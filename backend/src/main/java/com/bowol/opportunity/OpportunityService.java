package com.bowol.opportunity;

import com.bowol.ai.audit.AIAuditService;
import com.bowol.ai.context.StrategicContextService;
import com.bowol.ai.model.*;
import com.bowol.ai.prompt.PromptTemplate;
import com.bowol.ai.prompt.PromptTemplateEngine;
import com.bowol.ai.provider.AIProvider;
import com.bowol.ai.provider.AIProviderResolver;
import com.bowol.ai.validation.AIResponseValidator;
import com.bowol.businessprofile.BusinessProfile;
import com.bowol.businessprofile.BusinessProfileRepository;
import com.bowol.opportunity.dto.*;
import com.bowol.shared.dto.PageResponse;
import com.bowol.shared.exception.NotFoundException;
import com.bowol.shared.security.UserPrincipal;
import com.bowol.swot.EvidenceRef;
import com.bowol.swot.EvidenceRefRepository;
import com.bowol.swot.SwotAnalysis;
import com.bowol.swot.SwotAnalysisRepository;
import com.bowol.trend.Trend;
import com.bowol.trend.TrendRepository;
import com.bowol.project.Project;
import com.bowol.project.ProjectMember;
import com.bowol.project.ProjectMemberRole;
import com.bowol.project.ProjectMemberRepository;
import com.bowol.project.ProjectRepository;
import com.bowol.project.ProjectStatus;
import com.bowol.project.dto.ProjectResponse;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class OpportunityService {

    private final OpportunityRepository opportunityRepository;
    private final SwotAnalysisRepository swotAnalysisRepository;
    private final EvidenceRefRepository evidenceRefRepository;
    private final BusinessProfileRepository businessProfileRepository;
    private final TrendRepository trendRepository;
    private final StrategicContextService strategicContextService;
    private final PromptTemplateEngine promptTemplateEngine;
    private final AIProviderResolver aiProviderResolver;
    private final AIResponseValidator aiResponseValidator;
    private final AIAuditService aiAuditService;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final com.bowol.developer.WebhookService webhookService;

    @Transactional
    public ProjectResponse convertToProject(UUID opportunityId, UserPrincipal principal) {
        UUID organizationId = principal.getOrganizationId();
        UUID userId = principal.getId();

        Opportunity opp = opportunityRepository.findByIdAndOrganizationId(opportunityId, organizationId)
                .orElseThrow(() -> new NotFoundException("OPORTUNIDAD_NO_ENCONTRADA", "No se encontró la oportunidad con id: " + opportunityId));

        // Check if project already exists for this opportunity
        Optional<Project> existingProject = projectRepository.findByOpportunityIdAndOrganizationIdAndDeletedAtIsNull(opportunityId, organizationId);
        if (existingProject.isPresent()) {
            return ProjectResponse.from(existingProject.get());
        }

        opp.setStatus(OpportunityStatus.CONVERTED);
        opportunityRepository.save(opp);

        Project project = Project.builder()
                .name(opp.getTitle())
                .description(opp.getDescription())
                .opportunityId(opp.getId())
                .status(ProjectStatus.PLANNING)
                .createdBy(userId)
                .build();
        project.setOrganizationId(organizationId);
        Project savedProject = projectRepository.save(project);

        if (userId != null) {
            ProjectMember owner = ProjectMember.builder()
                    .projectId(savedProject.getId())
                    .userId(userId)
                    .role(ProjectMemberRole.OWNER)
                    .build();
            projectMemberRepository.save(owner);
        }

        log.info("Oportunidad {} convertida exitosamente a proyecto {}", opportunityId, savedProject.getId());
        return ProjectResponse.from(savedProject);
    }

    @Transactional
    public OpportunitiesFromSwotResponse generateFromSwot(UUID swotId, UserPrincipal principal) {
        UUID organizationId = principal.getOrganizationId();
        UUID userId = principal.getId();
        log.info("Generando oportunidades RICE desde FODA {} para org {}", swotId, organizationId);

        // 1. Fetch SWOT Analysis
        SwotAnalysis swot = swotAnalysisRepository.findByIdAndOrganizationId(swotId, organizationId)
                .orElseThrow(() -> new NotFoundException("SWOT_NO_ENCONTRADO", "No se encontró el análisis FODA con id: " + swotId));

        // 2. Fetch Business Profile Context
        BusinessProfile profile = businessProfileRepository.findByOrganizationId(organizationId).orElse(null);
        Map<String, Object> bpContext = strategicContextService.extractBusinessProfileContext(profile);

        // 3. Assemble Prompt Variables
        Map<String, Object> variables = new HashMap<>(bpContext);
        variables.put("strengths", swot.getStrengths() != null ? swot.getStrengths() : List.of());
        variables.put("weaknesses", swot.getWeaknesses() != null ? swot.getWeaknesses() : List.of());
        variables.put("opportunities", swot.getOpportunities() != null ? swot.getOpportunities() : List.of());
        variables.put("threats", swot.getThreats() != null ? swot.getThreats() : List.of());

        // 4. Render Prompt Template
        PromptTemplate template = promptTemplateEngine.getTemplate("opportunity-from-swot-v1");
        String userPrompt = promptTemplateEngine.render("opportunity-from-swot-v1", variables);

        // 5. Complete with AI
        AIModel model = template.getModel() != null ? template.getModel() : AIModel.GPT_4O;
        AIRequest request = AIRequest.builder()
                .model(model)
                .systemPrompt("Eres el AI Product Strategist de BOWOL. Analizas matrices FODA para derivar oportunidades de alto impacto puntuadas con metodología RICE.")
                .messages(List.of(AIMessage.user(userPrompt)))
                .temperature(template.getTemperature())
                .format(ResponseFormat.JSON_OBJECT)
                .build();

        AIProvider provider = aiProviderResolver.resolve(model);
        AIResponse response = provider.complete(request);

        // 6. Validate JSON output
        JsonNode root = aiResponseValidator.validateOpportunityOutput(response.getContent());
        JsonNode oppsArray = root.get("opportunities");

        List<Opportunity> savedOpportunities = new ArrayList<>();
        if (oppsArray != null && oppsArray.isArray()) {
            for (JsonNode node : oppsArray) {
                String title;
                String description = "";
                Integer reach = 70;
                Integer impact = 70;
                Integer confidence = 70;
                Integer effort = 50;
                List<String> evidence = new ArrayList<>();

                if (node.isTextual()) {
                    title = node.asText().trim();
                } else {
                    title = node.path("title").asText("").trim();
                    if (title.isBlank() && node.has("text")) {
                        title = node.path("text").asText("").trim();
                    }
                    description = node.path("description").asText("");
                    if (node.has("reachScore")) reach = node.get("reachScore").asInt();
                    if (node.has("impactScore")) impact = node.get("impactScore").asInt();
                    if (node.has("confidenceScore")) confidence = node.get("confidenceScore").asInt();
                    if (node.has("effortScore")) effort = node.get("effortScore").asInt();

                    if (node.has("evidence") && node.get("evidence").isArray()) {
                        for (JsonNode evNode : node.get("evidence")) {
                            if (evNode.isTextual() && !evNode.asText().isBlank()) {
                                evidence.add(evNode.asText().trim());
                            }
                        }
                    }
                }

                if (title.isBlank()) continue;

                Opportunity opp = Opportunity.builder()
                        .organizationId(organizationId)
                        .swotAnalysisId(swotId)
                        .title(title)
                        .description(description)
                        .reachScore(reach)
                        .impactScore(impact)
                        .confidenceScore(confidence)
                        .effortScore(effort)
                        .status(OpportunityStatus.IDENTIFIED)
                        .evidence(evidence)
                        .build();

                // Deterministic calculation of RICE priority score
                opp.calculateAndSetPriorityScore();

                Opportunity saved = opportunityRepository.save(opp);
                savedOpportunities.add(saved);

                // Save evidence references if valid UUIDs referencing trends
                for (String evId : evidence) {
                    try {
                        UUID trendId = UUID.fromString(evId);
                        Trend trend = trendRepository.findById(trendId).orElse(null);
                        if (trend != null) {
                            EvidenceRef ref = EvidenceRef.builder()
                                    .organizationId(organizationId)
                                    .entityType("OPPORTUNITY")
                                    .entityId(saved.getId())
                                    .trend(trend)
                                    .note("Tendencia vinculada como evidencia de oportunidad RICE")
                                    .weight(trend.getScore())
                                    .build();
                            evidenceRefRepository.save(ref);
                        }
                    } catch (IllegalArgumentException ignored) {}
                }
            }
        }

        // 7. Audit log
        Map<String, Object> auditMetadata = Map.of(
                "swot_id", swotId.toString(),
                "prompt_template", template.getKey(),
                "generated_count", savedOpportunities.size()
        );
        aiAuditService.logUsage(organizationId, userId, "OPPORTUNITY_GENERATE_FROM_SWOT", response, auditMetadata);

        log.info("Generadas {} oportunidades desde FODA {} para org {}", savedOpportunities.size(), swotId, organizationId);

        savedOpportunities.forEach(opp -> dispatchRiceCalculatedWebhook(organizationId, opp));

        List<OpportunityResponse> dtoList = savedOpportunities.stream()
                .map(OpportunityResponse::from)
                .toList();

        return OpportunitiesFromSwotResponse.builder()
                .generated(dtoList.size())
                .opportunities(dtoList)
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponse<OpportunityResponse> getOpportunities(
            UserPrincipal principal,
            OpportunityStatus status,
            Pageable pageable) {

        UUID organizationId = principal.getOrganizationId();
        Page<Opportunity> page;
        if (status != null) {
            page = opportunityRepository.findByOrganizationIdAndStatus(organizationId, status, pageable);
        } else {
            page = opportunityRepository.findByOrganizationId(organizationId, pageable);
        }
        return PageResponse.of(page.map(OpportunityResponse::from));
    }

    @Transactional(readOnly = true)
    public Map<String, List<OpportunityResponse>> getBoard(UserPrincipal principal) {
        UUID organizationId = principal.getOrganizationId();
        Map<String, List<OpportunityResponse>> board = new LinkedHashMap<>();

        for (OpportunityStatus s : OpportunityStatus.values()) {
            List<Opportunity> opps = opportunityRepository.findByOrganizationIdAndStatus(organizationId, s);
            // Sort by priorityScore desc
            opps.sort((a, b) -> {
                if (a.getPriorityScore() == null) return 1;
                if (b.getPriorityScore() == null) return -1;
                return b.getPriorityScore().compareTo(a.getPriorityScore());
            });
            board.put(s.name(), opps.stream().map(OpportunityResponse::from).toList());
        }

        return board;
    }

    @Transactional(readOnly = true)
    public OpportunityResponse getOpportunityById(UUID id, UserPrincipal principal) {
        Opportunity opp = opportunityRepository.findByIdAndOrganizationId(id, principal.getOrganizationId())
                .orElseThrow(() -> new NotFoundException("OPORTUNIDAD_NO_ENCONTRADA", "No se encontró la oportunidad con id: " + id));
        return OpportunityResponse.from(opp);
    }

    @Transactional
    public OpportunityResponse createOpportunity(CreateOpportunityRequest request, UserPrincipal principal) {
        UUID organizationId = principal.getOrganizationId();

        Opportunity opp = Opportunity.builder()
                .organizationId(organizationId)
                .swotAnalysisId(request.getSwotAnalysisId())
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .reachScore(request.getReachScore())
                .impactScore(request.getImpactScore())
                .confidenceScore(request.getConfidenceScore())
                .effortScore(request.getEffortScore() != null ? request.getEffortScore() : 50)
                .status(OpportunityStatus.IDENTIFIED)
                .evidence(request.getEvidence() != null ? request.getEvidence() : new ArrayList<>())
                .build();

        opp.calculateAndSetPriorityScore();
        Opportunity saved = opportunityRepository.save(opp);

        dispatchRiceCalculatedWebhook(organizationId, saved);

        log.info("Oportunidad creada manualmente: id={}, org={}", saved.getId(), organizationId);
        return OpportunityResponse.from(saved);
    }

    @Transactional
    public OpportunityResponse updateOpportunity(UUID id, UpdateOpportunityRequest request, UserPrincipal principal) {
        Opportunity opp = opportunityRepository.findByIdAndOrganizationId(id, principal.getOrganizationId())
                .orElseThrow(() -> new NotFoundException("OPORTUNIDAD_NO_ENCONTRADA", "No se encontró la oportunidad con id: " + id));

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            opp.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            opp.setDescription(request.getDescription());
        }
        if (request.getReachScore() != null) {
            opp.setReachScore(request.getReachScore());
        }
        if (request.getImpactScore() != null) {
            opp.setImpactScore(request.getImpactScore());
        }
        if (request.getConfidenceScore() != null) {
            opp.setConfidenceScore(request.getConfidenceScore());
        }
        if (request.getEffortScore() != null) {
            opp.setEffortScore(request.getEffortScore());
        }
        if (request.getStatus() != null) {
            opp.setStatus(request.getStatus());
        }
        if (request.getEvidence() != null) {
            opp.setEvidence(request.getEvidence());
        }

        opp.calculateAndSetPriorityScore();
        Opportunity saved = opportunityRepository.save(opp);

        dispatchRiceCalculatedWebhook(principal.getOrganizationId(), saved);

        return OpportunityResponse.from(saved);
    }

    @Transactional
    public OpportunityResponse updateStatus(UUID id, UpdateOpportunityStatusRequest request, UserPrincipal principal) {
        Opportunity opp = opportunityRepository.findByIdAndOrganizationId(id, principal.getOrganizationId())
                .orElseThrow(() -> new NotFoundException("OPORTUNIDAD_NO_ENCONTRADA", "No se encontró la oportunidad con id: " + id));

        opp.setStatus(request.getStatus());
        Opportunity saved = opportunityRepository.save(opp);
        log.info("Estado de oportunidad {} actualizado a {}", id, request.getStatus());
        return OpportunityResponse.from(saved);
    }

    @Transactional
    public void deleteOpportunity(UUID id, UserPrincipal principal) {
        Opportunity opp = opportunityRepository.findByIdAndOrganizationId(id, principal.getOrganizationId())
                .orElseThrow(() -> new NotFoundException("OPORTUNIDAD_NO_ENCONTRADA", "No se encontró la oportunidad con id: " + id));

        evidenceRefRepository.deleteByOrganizationIdAndEntityTypeAndEntityId(principal.getOrganizationId(), "OPPORTUNITY", id);
        opportunityRepository.delete(opp);
        log.info("Oportunidad eliminada: id={}, org={}", id, principal.getOrganizationId());
    }

    private void dispatchRiceCalculatedWebhook(UUID organizationId, Opportunity opp) {
        try {
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("opportunity_id", opp.getId().toString());
            data.put("title", opp.getTitle());
            data.put("reach", opp.getReachScore());
            data.put("impact", opp.getImpactScore());
            data.put("confidence", opp.getConfidenceScore());
            data.put("effort", opp.getEffortScore());
            data.put("rice_score", opp.getPriorityScore());
            data.put("status", opp.getStatus() != null ? opp.getStatus().name() : "IDENTIFIED");
            webhookService.dispatchEventAsync(organizationId, "opportunity.rice_calculated", data);
        } catch (Exception e) {
            log.warn("No se pudo disparar webhook opportunity.rice_calculated: {}", e.getMessage());
        }
    }
}
