package com.bowol.ai;

import com.bowol.ai.context.StrategicContextService;
import com.bowol.businessprofile.BusinessProfile;
import com.bowol.businessprofile.BusinessProfileRepository;
import com.bowol.businessprofile.dto.GoalItem;
import com.bowol.organization.OrganizationSize;
import com.bowol.source.TrendSource;
import com.bowol.source.TrendSourceCode;
import com.bowol.trend.Trend;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StrategicContextServiceTests {

    @Mock
    private BusinessProfileRepository businessProfileRepository;

    private StrategicContextService contextService;

    @BeforeEach
    void setUp() {
        contextService = new StrategicContextService(businessProfileRepository);
    }

    @Test
    @DisplayName("Extracts all strategic dimensions from BusinessProfile")
    void testExtractBusinessProfileContext() {
        BusinessProfile profile = BusinessProfile.builder()
                .industry("HealthTech / Biotech")
                .size(OrganizationSize.SMALL)
                .market("Europe Clinical")
                .goals(List.of(
                        GoalItem.builder().text("Reducir tiempo de diagnóstico").priority(1).build()
                ))
                .problems(List.of("Cuello de botella en análisis manual"))
                .tools(List.of("Python", "DICOM Viewer"))
                .competitors(List.of("HealthCorp", "BioAI"))
                .channels(List.of("Hospitales privados"))
                .digitalMaturity(80)
                .aiMaturity(45)
                .build();

        Map<String, Object> context = contextService.extractBusinessProfileContext(profile);

        assertThat(context.get("industry")).isEqualTo("HealthTech / Biotech");
        assertThat(context.get("size")).isEqualTo("SMALL");
        assertThat(context.get("goals").toString()).contains("Reducir tiempo de diagnóstico (Prioridad 1)");
        assertThat(context.get("problems")).isEqualTo("Cuello de botella en análisis manual");
        assertThat(context.get("digitalMaturity")).isEqualTo(80);
    }

    @Test
    @DisplayName("Gracefully provides sensible defaults when BusinessProfile is null")
    void testNullProfileDefaults() {
        Map<String, Object> context = contextService.extractBusinessProfileContext(null);

        assertThat(context.get("industry")).isNotNull();
        assertThat(context.get("size")).isEqualTo("SMALL");
        assertThat(context.get("digitalMaturity")).isEqualTo(50);
    }

    @Test
    @DisplayName("Combines BusinessProfile and Trend into complete relevance prompt context")
    void testBuildTrendRelevanceContext() {
        UUID orgId = UUID.randomUUID();
        when(businessProfileRepository.findByOrganizationId(orgId)).thenReturn(Optional.of(
                BusinessProfile.builder()
                        .industry("EdTech")
                        .size(OrganizationSize.MICRO)
                        .market("Spain")
                        .build()
        ));

        Trend trend = Trend.builder()
                .id(UUID.randomUUID())
                .source(TrendSource.builder().code(TrendSourceCode.GITHUB).name("GitHub").build())
                .title("LangChain")
                .score(93)
                .description("Framework for agentic workflows")
                .url("https://github.com/langchain-ai/langchain")
                .tags(List.of("ai", "agents"))
                .build();

        Map<String, Object> context = contextService.buildTrendRelevanceContext(orgId, trend);

        assertThat(context.get("industry")).isEqualTo("EdTech");
        assertThat(context.get("trendTitle")).isEqualTo("LangChain");
        assertThat(context.get("trendScore")).isEqualTo(93);
        assertThat(context.get("trendTags")).isEqualTo("ai, agents");
    }
}
