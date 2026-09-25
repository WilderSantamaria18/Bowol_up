package com.bowol.hypothesis;

import com.bowol.ai.audit.AIAuditService;
import com.bowol.ai.model.*;
import com.bowol.ai.prompt.PromptTemplate;
import com.bowol.ai.prompt.PromptTemplateEngine;
import com.bowol.ai.provider.AIProvider;
import com.bowol.ai.provider.AIProviderResolver;
import com.bowol.ai.validation.AIResponseValidator;
import com.bowol.businessprofile.BusinessProfile;
import com.bowol.businessprofile.BusinessProfileRepository;
import com.bowol.hypothesis.dto.*;
import com.bowol.opportunity.Opportunity;
import com.bowol.opportunity.OpportunityRepository;
import com.bowol.opportunity.OpportunityStatus;
import com.bowol.project.Project;
import com.bowol.project.ProjectMember;
import com.bowol.project.ProjectMemberRepository;
import com.bowol.project.ProjectMemberRole;
import com.bowol.project.ProjectRepository;
import com.bowol.project.ProjectStatus;
import com.bowol.project.dto.ProjectResponse;
import com.bowol.shared.exception.NotFoundException;
import com.bowol.shared.security.UserPrincipal;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class HypothesisService {

    private final HypothesisRepository hypothesisRepository;
    private final OpportunityRepository opportunityRepository;
    private final BusinessProfileRepository businessProfileRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final PromptTemplateEngine promptTemplateEngine;
    private final AIProviderResolver aiProviderResolver;
    private final AIResponseValidator aiResponseValidator;
    private final AIAuditService aiAuditService;

    @Transactional(readOnly = true)
    public List<HypothesisResponse> getHypotheses(UUID opportunityId, HypothesisStatus status, UserPrincipal principal) {
        UUID orgId = principal.getOrganizationId();
        List<Hypothesis> list;

        if (opportunityId != null && status != null) {
            list = hypothesisRepository.findAllByOpportunityIdAndOrganizationIdAndStatus(opportunityId, orgId, status);
        } else if (opportunityId != null) {
            list = hypothesisRepository.findAllByOpportunityIdAndOrganizationId(opportunityId, orgId);
        } else if (status != null) {
            list = hypothesisRepository.findAllByOrganizationIdAndStatus(orgId, status);
        } else {
            list = hypothesisRepository.findAllByOrganizationId(orgId);
        }

        return list.stream().map(HypothesisResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public HypothesisResponse getHypothesisById(UUID id, UserPrincipal principal) {
        Hypothesis hypothesis = getHypothesisEntity(id, principal.getOrganizationId());
        return HypothesisResponse.from(hypothesis);
    }

    @Transactional(readOnly = true)
    public Hypothesis getHypothesisEntity(UUID id, UUID organizationId) {
        Hypothesis hypothesis = hypothesisRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Hipótesis no encontrada: " + id));

        if (!hypothesis.getOrganizationId().equals(organizationId)) {
            throw new NotFoundException("Hipótesis no encontrada: " + id);
        }
        return hypothesis;
    }

    @Transactional
    public HypothesisResponse createHypothesis(CreateHypothesisRequest request, UserPrincipal principal) {
        UUID orgId = principal.getOrganizationId();

        Opportunity opp = opportunityRepository.findByIdAndOrganizationId(request.getOpportunityId(), orgId)
                .orElseThrow(() -> new NotFoundException("Oportunidad no encontrada: " + request.getOpportunityId()));

        Hypothesis hypothesis = Hypothesis.builder()
                .organizationId(orgId)
                .opportunityId(opp.getId())
                .statement(request.getStatement())
                .validationMethod(request.getValidationMethod())
                .successMetric(request.getSuccessMetric())
                .targetValue(request.getTargetValue())
                .status(request.getStatus() != null ? request.getStatus() : HypothesisStatus.DRAFT)
                .createdBy(principal.getId())
                .build();

        Hypothesis saved = hypothesisRepository.save(hypothesis);
        log.info("Hipótesis creada id={} para oportunidad={}", saved.getId(), opp.getId());
        return HypothesisResponse.from(saved);
    }

    @Transactional
    public HypothesisResponse updateHypothesis(UUID id, UpdateHypothesisRequest request, UserPrincipal principal) {
        Hypothesis hypothesis = getHypothesisEntity(id, principal.getOrganizationId());

        if (request.getStatement() != null && !request.getStatement().isBlank()) {
            hypothesis.setStatement(request.getStatement().trim());
        }
        if (request.getValidationMethod() != null) {
            hypothesis.setValidationMethod(request.getValidationMethod().trim());
        }
        if (request.getSuccessMetric() != null) {
            hypothesis.setSuccessMetric(request.getSuccessMetric().trim());
        }
        if (request.getTargetValue() != null) {
            hypothesis.setTargetValue(request.getTargetValue().trim());
        }
        if (request.getStatus() != null) {
            hypothesis.setStatus(request.getStatus());
            if ((request.getStatus() == HypothesisStatus.VALIDATED || request.getStatus() == HypothesisStatus.INVALIDATED)
                    && hypothesis.getValidatedAt() == null) {
                hypothesis.setValidatedAt(Instant.now());
            }
        }

        Hypothesis saved = hypothesisRepository.save(hypothesis);
        return HypothesisResponse.from(saved);
    }

    @Transactional
    public HypothesisResponse recordResult(UUID id, RecordHypothesisResultRequest request, UserPrincipal principal) {
        Hypothesis hypothesis = getHypothesisEntity(id, principal.getOrganizationId());

        hypothesis.setResult(request.getResult());
        hypothesis.setResultNotes(request.getResultNotes());
        hypothesis.setValidatedAt(Instant.now());

        if (request.getResult() == HypothesisResult.SUPPORTED) {
            hypothesis.setStatus(HypothesisStatus.VALIDATED);
        } else if (request.getResult() == HypothesisResult.REFUTED) {
            hypothesis.setStatus(HypothesisStatus.INVALIDATED);
        }

        Hypothesis saved = hypothesisRepository.save(hypothesis);
        log.info("Resultado registrado para hipótesis {}: result={}", id, request.getResult());
        return HypothesisResponse.from(saved);
    }

    @Transactional
    public void deleteHypothesis(UUID id, UserPrincipal principal) {
        Hypothesis hypothesis = getHypothesisEntity(id, principal.getOrganizationId());
        hypothesisRepository.delete(hypothesis);
        log.info("Hipótesis eliminada: {}", id);
    }

    @Transactional
    public HypothesisResponse formulateFromOpportunity(UUID opportunityId, UserPrincipal principal) {
        UUID organizationId = principal.getOrganizationId();
        UUID userId = principal.getId();

        Opportunity opp = opportunityRepository.findByIdAndOrganizationId(opportunityId, organizationId)
                .orElseThrow(() -> new NotFoundException("Oportunidad no encontrada: " + opportunityId));

        log.info("Iniciando formulación IA de hipótesis para oportunidad {} ({})", opportunityId, opp.getTitle());

        BusinessProfile profile = businessProfileRepository.findByOrganizationId(organizationId).orElse(null);
        String industry = profile != null ? profile.getIndustry() : "Tecnología / Startups";

        // 1. Template
        PromptTemplate template = promptTemplateEngine.getTemplate("formulate-hypothesis-v1");
        Map<String, Object> variables = new HashMap<>();
        variables.put("opportunityTitle", opp.getTitle());
        variables.put("opportunityDescription", opp.getDescription() != null ? opp.getDescription() : "Sin descripción adicional");
        variables.put("targetAudience", "Clientes potenciales y usuarios del sector");
        variables.put("industry", industry);
        variables.put("reach", opp.getReachScore() != null ? opp.getReachScore() : 5);
        variables.put("impact", opp.getImpactScore() != null ? opp.getImpactScore() : 5);
        variables.put("confidence", opp.getConfidenceScore() != null ? opp.getConfidenceScore() : 5);
        variables.put("effort", opp.getEffortScore() != null ? opp.getEffortScore() : 5);

        String renderedPrompt = promptTemplateEngine.render("formulate-hypothesis-v1", variables);

        // 2. AI Request
        AIModel targetModel = template.getModel() != null ? template.getModel() : AIModel.GPT_4O;
        AIProvider provider = aiProviderResolver.resolve(targetModel);

        AIRequest aiRequest = AIRequest.builder()
                .model(targetModel)
                .systemPrompt("Eres el Chief Strategy Officer y Lead Scientist de BOWOL. Formulas hipótesis científicas y falsables a partir de oportunidades de negocio.")
                .messages(List.of(AIMessage.user(renderedPrompt)))
                .temperature(template.getTemperature())
                .format(ResponseFormat.JSON_OBJECT)
                .build();

        AIResponse aiResponse = provider.complete(aiRequest);

        // 3. Validate
        JsonNode root = aiResponseValidator.validateHypothesisOutput(aiResponse.getContent());

        // 4. Audit
        Map<String, Object> auditMetadata = Map.of(
                "opportunity_id", opportunityId.toString(),
                "prompt_template", template.getKey()
        );
        aiAuditService.logUsage(organizationId, userId, "HYPOTHESIS_FORMULATE", aiResponse, auditMetadata);

        // 5. Build and save hypothesis
        String statement = root.get("statement").asText().trim();
        String validationMethod = root.get("validationMethod").asText().trim();
        String successMetric = root.get("successMetric").asText().trim();
        String targetValue = root.get("targetValue").asText().trim();

        Hypothesis hypothesis = Hypothesis.builder()
                .organizationId(organizationId)
                .opportunityId(opp.getId())
                .statement(statement)
                .validationMethod(validationMethod)
                .successMetric(successMetric)
                .targetValue(targetValue)
                .status(HypothesisStatus.READY)
                .createdBy(userId)
                .build();

        Hypothesis saved = hypothesisRepository.save(hypothesis);
        log.info("Hipótesis formulada automáticamente por IA id={} para oportunidad {}", saved.getId(), opportunityId);
        return HypothesisResponse.from(saved);
    }

    @Transactional
    public ProjectResponse convertToProject(UUID hypothesisId, UserPrincipal principal) {
        UUID organizationId = principal.getOrganizationId();
        UUID userId = principal.getId();

        Hypothesis hypothesis = getHypothesisEntity(hypothesisId, organizationId);
        Opportunity opp = opportunityRepository.findByIdAndOrganizationId(hypothesis.getOpportunityId(), organizationId)
                .orElseThrow(() -> new NotFoundException("Oportunidad no encontrada: " + hypothesis.getOpportunityId()));

        // Check if project already exists for this opportunity
        Optional<Project> existingProject = projectRepository.findByOpportunityIdAndOrganizationIdAndDeletedAtIsNull(opp.getId(), organizationId);
        if (existingProject.isPresent()) {
            return ProjectResponse.from(existingProject.get());
        }

        // Mark opportunity as CONVERTED and hypothesis as VALIDATED if not already
        opp.setStatus(OpportunityStatus.CONVERTED);
        opportunityRepository.save(opp);

        if (hypothesis.getStatus() != HypothesisStatus.VALIDATED) {
            hypothesis.setStatus(HypothesisStatus.VALIDATED);
            if (hypothesis.getValidatedAt() == null) {
                hypothesis.setValidatedAt(Instant.now());
            }
            hypothesisRepository.save(hypothesis);
        }

        String projectName = opp.getTitle();
        String projectDescription = hypothesis.getStatement() != null
                ? hypothesis.getStatement()
                : opp.getDescription();

        Project project = Project.builder()
                .name(projectName)
                .description(projectDescription)
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

        log.info("Proyecto creado desde hipótesis validada: projectId={}, hypothesisId={}, orgId={}",
                savedProject.getId(), hypothesisId, organizationId);

        return ProjectResponse.from(savedProject);
    }
}
