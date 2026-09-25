package com.bowol.trend;

import com.bowol.organization.Organization;
import com.bowol.organization.OrganizationRepository;
import com.bowol.source.TrendSource;
import com.bowol.source.TrendSourceCode;
import com.bowol.source.TrendSourceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class TrendPersistenceTests {

    @Autowired
    private TrendSourceRepository trendSourceRepository;

    @Autowired
    private TrendRepository trendRepository;

    @Autowired
    private TrendRelevanceRepository trendRelevanceRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    private TrendSource githubSource;
    private Organization testOrg;

    @BeforeEach
    void setUp() {
        githubSource = trendSourceRepository.save(TrendSource.builder()
                .code(TrendSourceCode.GITHUB)
                .name("GitHub")
                .baseUrl("https://api.github.com")
                .sourceLevel("A")
                .isActive(true)
                .build());

        testOrg = organizationRepository.save(Organization.builder()
                .name("Acme AI Labs")
                .slug("acme-ai-" + UUID.randomUUID())
                .build());
    }

    @Test
    @DisplayName("TrendSource can be saved and found by code")
    void testTrendSourcePersistence() {
        Optional<TrendSource> found = trendSourceRepository.findByCode(TrendSourceCode.GITHUB);
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("GitHub");
        assertThat(found.get().getSourceLevel()).isEqualTo("A");
        assertThat(found.get().getIsActive()).isTrue();
    }

    @Test
    @DisplayName("Trend can be saved with JSON metadata, tags and retrieved with search queries")
    void testTrendPersistenceAndSearch() {
        Trend trend = Trend.builder()
                .source(githubSource)
                .externalId("facebook/llama-3")
                .title("Llama 3 Open Weights Model")
                .description("Next generation state-of-the-art open large language model.")
                .url("https://github.com/facebook/llama-3")
                .score(94)
                .tags(List.of("llm", "ai", "open-source"))
                .metadata(Map.of("stars", 45000L, "forks", 6200L))
                .build();

        Trend saved = trendRepository.save(trend);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getFetchedAt()).isNotNull();
        assertThat(saved.getTags()).contains("llm", "ai");
        assertThat(saved.getMetadata()).containsEntry("stars", 45000L);

        // Find by source and external ID
        Optional<Trend> bySourceAndExt = trendRepository.findBySourceIdAndExternalId(
                githubSource.getId(), "facebook/llama-3"
        );
        assertThat(bySourceAndExt).isPresent();
        assertThat(bySourceAndExt.get().getTitle()).isEqualTo("Llama 3 Open Weights Model");

        // Keyword search
        Page<Trend> searchResults = trendRepository.searchByKeyword("llama", PageRequest.of(0, 10));
        assertThat(searchResults.getContent()).hasSize(1);
        assertThat(searchResults.getContent().get(0).getTitle()).contains("Llama 3");

        // Score filter
        Page<Trend> highScorers = trendRepository.findByScoreGreaterThanEqual(90, PageRequest.of(0, 10));
        assertThat(highScorers.getContent()).isNotEmpty();
    }

    @Test
    @DisplayName("TrendRelevance persists tenant evaluation and links to trend")
    void testTrendRelevancePersistence() {
        Trend trend = trendRepository.save(Trend.builder()
                .source(githubSource)
                .externalId("langchain-ai/langchain")
                .title("LangChain Framework")
                .description("Building applications with LLMs through composability.")
                .url("https://github.com/langchain-ai/langchain")
                .score(91)
                .tags(List.of("agents", "orchestration"))
                .build());

        TrendRelevance relevance = TrendRelevance.builder()
                .organizationId(testOrg.getId())
                .trend(trend)
                .score(88)
                .aiSummary("Alta aplicabilidad para automatizar flujos de atención al cliente.")
                .tags(List.of("agentic-workflows", "high-priority"))
                .build();

        TrendRelevance savedRelevance = trendRelevanceRepository.save(relevance);

        assertThat(savedRelevance.getId()).isNotNull();
        assertThat(savedRelevance.getOrganizationId()).isEqualTo(testOrg.getId());
        assertThat(savedRelevance.getTrend().getTitle()).isEqualTo("LangChain Framework");
        assertThat(savedRelevance.getScore()).isEqualTo(88);
        assertThat(savedRelevance.getTags()).contains("high-priority");

        // Query by organization and trend
        Optional<TrendRelevance> found = trendRelevanceRepository.findByOrganizationIdAndTrendId(
                testOrg.getId(), trend.getId()
        );
        assertThat(found).isPresent();
        assertThat(found.get().getAiSummary()).contains("Alta aplicabilidad");

        // Check exists
        assertThat(trendRelevanceRepository.existsByOrganizationIdAndTrendId(testOrg.getId(), trend.getId())).isTrue();

        // Delete relevance
        trendRelevanceRepository.deleteByOrganizationIdAndTrendId(testOrg.getId(), trend.getId());
        assertThat(trendRelevanceRepository.findByOrganizationIdAndTrendId(testOrg.getId(), trend.getId())).isEmpty();
    }
}
