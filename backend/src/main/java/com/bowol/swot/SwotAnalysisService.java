package com.bowol.swot;

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
import com.bowol.shared.dto.PageResponse;
import com.bowol.shared.exception.NotFoundException;
import com.bowol.shared.security.UserPrincipal;
import com.bowol.swot.dto.*;
import com.bowol.trend.Trend;
import com.bowol.trend.TrendRepository;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class SwotAnalysisService {

    private final SwotAnalysisRepository swotAnalysisRepository;
    private final EvidenceRefRepository evidenceRefRepository;
    private final BusinessProfileRepository businessProfileRepository;
    private final TrendRepository trendRepository;
    private final StrategicContextService strategicContextService;
    private final PromptTemplateEngine promptTemplateEngine;
    private final AIProviderResolver aiProviderResolver;
    private final AIResponseValidator aiResponseValidator;
    private final AIAuditService aiAuditService;

    @Transactional
    public SwotAnalysisResponse generateSwot(UserPrincipal principal, GenerateSwotRequest request) {
        UUID organizationId = principal.getOrganizationId();
        UUID userId = principal.getId();
        log.info("Generando matriz FODA con IA para organización: {}", organizationId);

        // 1. Retrieve Business Profile & Snapshot
        BusinessProfile profile = businessProfileRepository.findByOrganizationId(organizationId).orElse(null);
        Map<String, Object> snapshot = strategicContextService.extractBusinessProfileContext(profile);

        // 2. Fetch Relevant Trends
        List<Trend> relevantTrends = new ArrayList<>();
        if (request == null || Boolean.TRUE.equals(request.getIncludeTrends())) {
            int limit = (request != null && request.getMaxTrends() != null && request.getMaxTrends() > 0)
                    ? Math.min(request.getMaxTrends(), 50)
                    : 20;
            relevantTrends = trendRepository.findAll(PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "score"))).getContent();
        }

        // 3. Ground Context & Render Prompt Template
        Map<String, Object> context = strategicContextService.buildSwotContext(organizationId, relevantTrends);
        PromptTemplate template = promptTemplateEngine.getTemplate("swot-generate-v1");
        String userPrompt = promptTemplateEngine.render("swot-generate-v1", context);

        // 4. Request AI Inference
        AIModel model = template.getModel() != null ? template.getModel() : AIModel.GPT_4O;
        AIRequest aiRequest = AIRequest.builder()
                .model(model)
                .systemPrompt("Eres el AI Strategic Planner de BOWOL. Generas matrices FODA (SWOT) dinámicas basadas en el perfil de la empresa y en las tendencias del mercado.")
                .messages(List.of(AIMessage.user(userPrompt)))
                .temperature(template.getTemperature())
                .format(ResponseFormat.JSON_OBJECT)
                .build();

        AIProvider provider = aiProviderResolver.resolve(model);
        AIResponse response = provider.complete(aiRequest);

        // 5. Validate AI Output against JSON Schema
        JsonNode validatedJson = aiResponseValidator.validateSwotAnalysis(response.getContent());
        List<SwotItem> strengths = aiResponseValidator.extractQuadrantItems(validatedJson, "strengths");
        List<SwotItem> weaknesses = aiResponseValidator.extractQuadrantItems(validatedJson, "weaknesses");
        List<SwotItem> opportunities = aiResponseValidator.extractQuadrantItems(validatedJson, "opportunities");
        List<SwotItem> threats = aiResponseValidator.extractQuadrantItems(validatedJson, "threats");
        String summaryText = aiResponseValidator.extractSummary(validatedJson);

        // If opportunities items have no evidenceIds, assign relevant trend IDs where applicable
        if (!relevantTrends.isEmpty() && !opportunities.isEmpty()) {
            for (int i = 0; i < opportunities.size() && i < relevantTrends.size(); i++) {
                SwotItem opp = opportunities.get(i);
                if (opp.getEvidenceIds() == null || opp.getEvidenceIds().isEmpty()) {
                    opp.setEvidenceIds(List.of(relevantTrends.get(i).getId().toString()));
                }
            }
        }

        // 6. Record Audit Log
        Map<String, Object> auditMetadata = new HashMap<>();
        auditMetadata.put("prompt_template", template.getKey());
        auditMetadata.put("trends_included", relevantTrends.size());
        aiAuditService.logUsage(organizationId, userId, "SWOT_GENERATE", response, auditMetadata);

        // 7. Persist SwotAnalysis
        Map<String, Object> summaryMap = new HashMap<>();
        if (summaryText != null && !summaryText.isBlank()) {
            summaryMap.put("text", summaryText);
        }

        SwotAnalysis swotAnalysis = SwotAnalysis.builder()
                .organizationId(organizationId)
                .businessProfileId(profile != null ? profile.getId() : null)
                .profileSnapshot(snapshot)
                .strengths(strengths)
                .weaknesses(weaknesses)
                .opportunities(opportunities)
                .threats(threats)
                .summary(summaryMap)
                .aiProvider(response.getProvider())
                .aiModelUsed(response.getModel())
                .generatedAt(Instant.now())
                .build();

        SwotAnalysis saved = swotAnalysisRepository.save(swotAnalysis);

        // 8. Persist Evidence References
        for (Trend trend : relevantTrends) {
            EvidenceRef evidenceRef = EvidenceRef.builder()
                    .organizationId(organizationId)
                    .entityType("SWOT")
                    .entityId(saved.getId())
                    .trend(trend)
                    .note("Tendencia analizada para fundamentar oportunidades del FODA")
                    .weight(trend.getScore())
                    .build();
            evidenceRefRepository.save(evidenceRef);
        }

        log.info("Análisis FODA generado exitosamente: id={}, fortalezas={}, debilidades={}, oportunidades={}, amenazas={}",
                saved.getId(), strengths.size(), weaknesses.size(), opportunities.size(), threats.size());

        return SwotAnalysisResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public SwotAnalysisResponse getLatestSwot(UserPrincipal principal) {
        UUID organizationId = principal.getOrganizationId();
        SwotAnalysis swot = swotAnalysisRepository.findFirstByOrganizationIdOrderByGeneratedAtDesc(organizationId)
                .orElseThrow(() -> new NotFoundException("SWOT_NO_ENCONTRADO", "No se encontró ningún análisis FODA para la organización"));
        return SwotAnalysisResponse.from(swot);
    }

    @Transactional(readOnly = true)
    public SwotAnalysisResponse getSwotById(UUID id, UserPrincipal principal) {
        SwotAnalysis swot = swotAnalysisRepository.findByIdAndOrganizationId(id, principal.getOrganizationId())
                .orElseThrow(() -> new NotFoundException("SWOT_NO_ENCONTRADO", "No se encontró el análisis FODA con id: " + id));
        return SwotAnalysisResponse.from(swot);
    }

    @Transactional(readOnly = true)
    public PageResponse<SwotAnalysisResponse> getAllSwots(UserPrincipal principal, Pageable pageable) {
        Page<SwotAnalysis> page = swotAnalysisRepository.findByOrganizationIdOrderByGeneratedAtDesc(
                principal.getOrganizationId(), pageable);
        return PageResponse.of(page.map(SwotAnalysisResponse::from));
    }

    @Transactional
    public SwotAnalysisResponse updateSwot(UUID id, UpdateSwotRequest request, UserPrincipal principal) {
        SwotAnalysis swot = swotAnalysisRepository.findByIdAndOrganizationId(id, principal.getOrganizationId())
                .orElseThrow(() -> new NotFoundException("SWOT_NO_ENCONTRADO", "No se encontró el análisis FODA con id: " + id));

        if (request.getStrengths() != null) {
            swot.setStrengths(request.getStrengths());
        }
        if (request.getWeaknesses() != null) {
            swot.setWeaknesses(request.getWeaknesses());
        }
        if (request.getOpportunities() != null) {
            swot.setOpportunities(request.getOpportunities());
        }
        if (request.getThreats() != null) {
            swot.setThreats(request.getThreats());
        }
        if (request.getSummary() != null) {
            Map<String, Object> summaryMap = new HashMap<>();
            summaryMap.put("text", request.getSummary());
            swot.setSummary(summaryMap);
        }

        SwotAnalysis saved = swotAnalysisRepository.save(swot);
        return SwotAnalysisResponse.from(saved);
    }

    @Transactional
    public SwotAnalysisResponse addItem(UUID id, AddSwotItemRequest request, UserPrincipal principal) {
        SwotAnalysis swot = swotAnalysisRepository.findByIdAndOrganizationId(id, principal.getOrganizationId())
                .orElseThrow(() -> new NotFoundException("SWOT_NO_ENCONTRADO", "No se encontró el análisis FODA con id: " + id));

        SwotItem newItem = SwotItem.builder()
                .id(UUID.randomUUID().toString())
                .text(request.getText().trim())
                .evidenceIds(request.getEvidenceIds() != null ? request.getEvidenceIds() : new ArrayList<>())
                .build();

        String quadrant = request.getQuadrant().trim().toLowerCase();
        switch (quadrant) {
            case "strengths", "fortalezas" -> swot.getStrengths().add(newItem);
            case "weaknesses", "debilidades" -> swot.getWeaknesses().add(newItem);
            case "opportunities", "oportunidades" -> swot.getOpportunities().add(newItem);
            case "threats", "amenazas" -> swot.getThreats().add(newItem);
            default -> throw new IllegalArgumentException("Cuadrante no reconocido: " + request.getQuadrant() + ". Válidos: strengths, weaknesses, opportunities, threats");
        }

        SwotAnalysis saved = swotAnalysisRepository.save(swot);
        return SwotAnalysisResponse.from(saved);
    }

    @Transactional
    public SwotAnalysisResponse removeItem(UUID id, String itemId, UserPrincipal principal) {
        SwotAnalysis swot = swotAnalysisRepository.findByIdAndOrganizationId(id, principal.getOrganizationId())
                .orElseThrow(() -> new NotFoundException("SWOT_NO_ENCONTRADO", "No se encontró el análisis FODA con id: " + id));

        swot.getStrengths().removeIf(item -> Objects.equals(item.getId(), itemId));
        swot.getWeaknesses().removeIf(item -> Objects.equals(item.getId(), itemId));
        swot.getOpportunities().removeIf(item -> Objects.equals(item.getId(), itemId));
        swot.getThreats().removeIf(item -> Objects.equals(item.getId(), itemId));

        SwotAnalysis saved = swotAnalysisRepository.save(swot);
        return SwotAnalysisResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<EvidenceRefResponse> getEvidence(UUID id, UserPrincipal principal) {
        // Verify SWOT exists and belongs to the caller's organization
        swotAnalysisRepository.findByIdAndOrganizationId(id, principal.getOrganizationId())
                .orElseThrow(() -> new NotFoundException("SWOT_NO_ENCONTRADO", "No se encontró el análisis FODA con id: " + id));

        List<EvidenceRef> refs = evidenceRefRepository.findByOrganizationIdAndEntityTypeAndEntityId(
                principal.getOrganizationId(), "SWOT", id);
        return refs.stream().map(EvidenceRefResponse::from).toList();
    }

    @Transactional
    public void deleteSwot(UUID id, UserPrincipal principal) {
        SwotAnalysis swot = swotAnalysisRepository.findByIdAndOrganizationId(id, principal.getOrganizationId())
                .orElseThrow(() -> new NotFoundException("SWOT_NO_ENCONTRADO", "No se encontró el análisis FODA con id: " + id));

        evidenceRefRepository.deleteByOrganizationIdAndEntityTypeAndEntityId(principal.getOrganizationId(), "SWOT", id);
        swotAnalysisRepository.delete(swot);
        log.info("Análisis FODA eliminado: id={}, org={}", id, principal.getOrganizationId());
    }
}
