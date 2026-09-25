package com.bowol.trend;

import com.bowol.shared.dto.PageResponse;
import com.bowol.shared.exception.NotFoundException;
import com.bowol.shared.multitenancy.TenantContext;
import com.bowol.shared.security.UserPrincipal;
import com.bowol.source.TrendSourceCode;
import com.bowol.trend.dto.MarkRelevantRequest;
import com.bowol.trend.dto.TrendRelevanceResponse;
import com.bowol.trend.dto.TrendResponse;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrendService {

    private final TrendRepository trendRepository;
    private final TrendRelevanceRepository trendRelevanceRepository;
    private final TrendSyncService trendSyncService;

    @Transactional(readOnly = true)
    public PageResponse<TrendResponse> getTrends(
            UserPrincipal principal,
            TrendSourceCode sourceCode,
            String query,
            Integer minScore,
            int page,
            int size) {

        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, Math.min(size, 100));

        Specification<Trend> spec = (root, q, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (sourceCode != null) {
                predicates.add(cb.equal(root.get("source").get("code"), sourceCode));
            }

            if (query != null && !query.isBlank()) {
                String pattern = "%" + query.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)
                ));
            }

            if (minScore != null && minScore > 0) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("score"), minScore));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        PageRequest pageRequest = PageRequest.of(
                safePage,
                safeSize,
                Sort.by(Sort.Direction.DESC, "score").and(Sort.by(Sort.Direction.DESC, "fetchedAt"))
        );

        Page<Trend> trendsPage = trendRepository.findAll(spec, pageRequest);

        UUID orgId = resolveOrganizationId(principal);
        Map<UUID, TrendRelevance> relevanceMap = fetchRelevanceMapForPage(orgId, trendsPage.getContent());

        List<TrendResponse> responseList = trendsPage.getContent().stream()
                .map(trend -> TrendResponse.from(trend, Optional.ofNullable(relevanceMap.get(trend.getId()))))
                .toList();

        Page<TrendResponse> dtoPage = new PageImpl<>(responseList, pageRequest, trendsPage.getTotalElements());
        return PageResponse.of(dtoPage);
    }

    @Transactional(readOnly = true)
    public TrendResponse getTrendById(UUID trendId, UserPrincipal principal) {
        Trend trend = trendRepository.findById(trendId)
                .orElseThrow(() -> new NotFoundException("TENDENCIA_NO_ENCONTRADA", "No se encontró la tendencia con id: " + trendId));

        UUID orgId = resolveOrganizationId(principal);
        Optional<TrendRelevance> relevanceOpt = orgId != null
                ? trendRelevanceRepository.findByOrganizationIdAndTrendId(orgId, trendId)
                : Optional.empty();

        return TrendResponse.from(trend, relevanceOpt);
    }

    @Transactional(readOnly = true)
    public PageResponse<TrendRelevanceResponse> getTrendsForMe(UserPrincipal principal, int page, int size) {
        UUID orgId = resolveRequiredOrganizationId(principal);
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, Math.min(size, 100));

        PageRequest pageRequest = PageRequest.of(safePage, safeSize);
        Page<TrendRelevance> pageResult = trendRelevanceRepository.findByOrganizationIdOrderByScoreDesc(orgId, pageRequest);

        List<TrendRelevanceResponse> items = pageResult.getContent().stream()
                .map(TrendRelevanceResponse::from)
                .toList();

        Page<TrendRelevanceResponse> dtoPage = new PageImpl<>(items, pageRequest, pageResult.getTotalElements());
        return PageResponse.of(dtoPage);
    }

    @Transactional
    public TrendRelevanceResponse markRelevant(UUID trendId, MarkRelevantRequest request, UserPrincipal principal) {
        UUID orgId = resolveRequiredOrganizationId(principal);

        Trend trend = trendRepository.findById(trendId)
                .orElseThrow(() -> new NotFoundException("TENDENCIA_NO_ENCONTRADA", "No se encontró la tendencia con id: " + trendId));

        TrendRelevance relevance = trendRelevanceRepository.findByOrganizationIdAndTrendId(orgId, trendId)
                .orElseGet(() -> TrendRelevance.builder()
                        .organizationId(orgId)
                        .trend(trend)
                        .build());

        int score = (request != null && request.getScore() != null)
                ? request.getScore()
                : trend.getScore();

        relevance.setScore(score);

        if (request != null) {
            if (request.getAiSummary() != null && !request.getAiSummary().isBlank()) {
                relevance.setAiSummary(request.getAiSummary());
            }
            if (request.getTags() != null && !request.getTags().isEmpty()) {
                relevance.setTags(request.getTags());
            }
        }
        relevance.setEvaluatedAt(Instant.now());

        TrendRelevance saved = trendRelevanceRepository.save(relevance);
        log.info("Tendencia {} marcada como relevante para org {} con score {}", trendId, orgId, score);
        return TrendRelevanceResponse.from(saved);
    }

    @Transactional
    public void dismissRelevance(UUID trendId, UserPrincipal principal) {
        UUID orgId = resolveRequiredOrganizationId(principal);
        trendRelevanceRepository.deleteByOrganizationIdAndTrendId(orgId, trendId);
        log.info("Relevancia de tendencia {} eliminada para la org {}", trendId, orgId);
    }

    @Transactional
    public TrendSyncResult triggerSync(UserPrincipal principal, Integer limitPerSource) {
        int safeLimit = limitPerSource != null ? Math.max(1, Math.min(limitPerSource, 30)) : 10;
        return trendSyncService.syncAllActiveSources(safeLimit);
    }

    private Map<UUID, TrendRelevance> fetchRelevanceMapForPage(UUID orgId, List<Trend> trends) {
        if (orgId == null || trends.isEmpty()) {
            return Map.of();
        }
        List<UUID> trendIds = trends.stream().map(Trend::getId).toList();
        List<TrendRelevance> relevances = trendRelevanceRepository.findByOrganizationIdAndTrendIdIn(orgId, trendIds);
        return relevances.stream().collect(Collectors.toMap(
                r -> r.getTrend().getId(),
                Function.identity(),
                (r1, r2) -> r1
        ));
    }

    private UUID resolveOrganizationId(UserPrincipal principal) {
        if (principal != null && principal.getOrganizationId() != null) {
            return principal.getOrganizationId();
        }
        return TenantContext.getTenantId();
    }

    private UUID resolveRequiredOrganizationId(UserPrincipal principal) {
        UUID orgId = resolveOrganizationId(principal);
        if (orgId == null) {
            throw new IllegalArgumentException("Se requiere una organización activa en la sesión para consultar relevancia");
        }
        return orgId;
    }
}
