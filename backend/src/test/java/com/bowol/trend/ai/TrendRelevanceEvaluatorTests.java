package com.bowol.trend.ai;

import com.bowol.ai.audit.AIUsageLog;
import com.bowol.ai.audit.AIUsageLogRepository;
import com.bowol.businessprofile.BusinessProfile;
import com.bowol.businessprofile.BusinessProfileRepository;
import com.bowol.organization.Organization;
import com.bowol.organization.OrganizationRepository;
import com.bowol.organization.OrganizationSize;
import com.bowol.source.TrendSource;
import com.bowol.source.TrendSourceCode;
import com.bowol.source.TrendSourceRepository;
import com.bowol.trend.Trend;
import com.bowol.trend.TrendRelevance;
import com.bowol.trend.TrendRelevanceRepository;
import com.bowol.trend.TrendRepository;
import com.bowol.trend.dto.TrendRelevanceResponse;
import com.bowol.user.User;
import com.bowol.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class TrendRelevanceEvaluatorTests {

    @Autowired
    private TrendRelevanceEvaluator evaluator;

    @Autowired
    private TrendRepository trendRepository;

    @Autowired
    private TrendSourceRepository trendSourceRepository;

    @Autowired
    private TrendRelevanceRepository trendRelevanceRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private BusinessProfileRepository businessProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AIUsageLogRepository usageLogRepository;

    private Organization testOrg;
    private User testUser;
    private Trend testTrend;

    @BeforeEach
    void setUp() {
        testUser = userRepository.save(User.builder()
                .name("Analyst User")
                .email("analyst-" + UUID.randomUUID() + "@bowol.com")
                .passwordHash("secret")
                .build());

        testOrg = organizationRepository.save(Organization.builder()
                .name("Health AI Co")
                .slug("health-ai-" + UUID.randomUUID())
                .build());

        BusinessProfile profile = BusinessProfile.builder()
                .industry("HealthTech")
                .size(OrganizationSize.SMALL)
                .market("Europe")
                .digitalMaturity(75)
                .aiMaturity(50)
                .build();
        profile.setOrganizationId(testOrg.getId());
        businessProfileRepository.save(profile);

        TrendSource source = trendSourceRepository.save(TrendSource.builder()
                .code(TrendSourceCode.GITHUB)
                .name("GitHub")
                .sourceLevel("A")
                .isActive(true)
                .build());

        testTrend = trendRepository.save(Trend.builder()
                .source(source)
                .externalId("huggingface/transformers")
                .title("Transformers Library")
                .description("State-of-the-art Machine Learning for Pytorch, TensorFlow, and JAX.")
                .url("https://github.com/huggingface/transformers")
                .score(95)
                .tags(List.of("ml", "nlp", "transformers"))
                .metadata(Map.of("stars", 125000L))
                .build());
    }

    @Test
    @DisplayName("evaluateRelevance executes grounded AI prompt, validates schema, persists TrendRelevance and writes AIUsageLog")
    void testEvaluateRelevancePipeline() {
        TrendRelevanceResponse response = evaluator.evaluateRelevance(testOrg.getId(), testUser.getId(), testTrend.getId());

        assertThat(response).isNotNull();
        assertThat(response.getOrganizationId()).isEqualTo(testOrg.getId());
        assertThat(response.getScore()).isBetween(0, 100);
        assertThat(response.getAiSummary()).isNotBlank();
        assertThat(response.getTags()).isNotEmpty();
        assertThat(response.getStrategicAlignment()).isEqualTo("HIGH");
        assertThat(response.getRecommendedActions()).isNotEmpty();
        assertThat(response.getTokensUsed()).isPositive();

        // 1. Verify TrendRelevance was persisted in DB
        Optional<TrendRelevance> savedRel = trendRelevanceRepository.findByOrganizationIdAndTrendId(testOrg.getId(), testTrend.getId());
        assertThat(savedRel).isPresent();
        assertThat(savedRel.get().getScore()).isEqualTo(response.getScore());
        assertThat(savedRel.get().getAiSummary()).isEqualTo(response.getAiSummary());

        // 2. Verify AIUsageLog was recorded with tokens and operation
        List<AIUsageLog> logs = usageLogRepository.findByOrganizationIdAndOperation(testOrg.getId(), "TREND_RELEVANCE_EVALUATION");
        assertThat(logs).isNotEmpty();
        AIUsageLog log = logs.get(0);
        assertThat(log.getTokensInput()).isPositive();
        assertThat(log.getTokensOutput()).isPositive();
        assertThat(log.getModel()).isNotBlank();
        assertThat(log.getProvider()).isEqualTo("mock");
    }
}
