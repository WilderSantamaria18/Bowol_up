package com.bowol.trend;

import com.bowol.source.TrendSource;
import com.bowol.source.TrendSourceCode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class TrendScoreCalculatorTests {

    private TrendScoreCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new TrendScoreCalculator();
    }

    @Test
    @DisplayName("Null and empty inputs return safe bounded defaults without exceptions")
    void testNullAndEmptyInputs() {
        assertThat(calculator.calculate(null)).isZero();
        assertThat(calculator.calculate(null, null, null, null)).isBetween(0, 100);
        assertThat(calculator.calculate(TrendSourceCode.GITHUB, "A", Instant.now(), Map.of())).isBetween(0, 100);
    }

    @Test
    @DisplayName("GitHub scoring rewards stars, forks and high daily velocity")
    void testGitHubScoring() {
        Map<String, Object> hotRepoMeta = Map.of(
                "stars", 25000L,
                "forks", 3500L,
                "stars_today", 150L,
                "open_issues", 80L
        );

        int hotScore = calculator.calculate(TrendSourceCode.GITHUB, "A", Instant.now().minus(2, ChronoUnit.HOURS), hotRepoMeta);

        Map<String, Object> lowRepoMeta = Map.of(
                "stars", 15L,
                "forks", 1L
        );
        int lowScore = calculator.calculate(TrendSourceCode.GITHUB, "A", Instant.now().minus(2, ChronoUnit.HOURS), lowRepoMeta);

        assertThat(hotScore).isGreaterThan(lowScore);
        assertThat(hotScore).isGreaterThanOrEqualTo(85);
        assertThat(hotScore).isLessThanOrEqualTo(100);
    }

    @Test
    @DisplayName("YouTube scoring rewards views, like ratios and comment engagement")
    void testYouTubeScoring() {
        Map<String, Object> viralVideo = Map.of(
                "views", 500000L,
                "likes", 35000L,
                "comments", 4500L
        );

        int viralScore = calculator.calculate(TrendSourceCode.YOUTUBE, "B", Instant.now().minus(6, ChronoUnit.HOURS), viralVideo);

        Map<String, Object> standardVideo = Map.of(
                "views", 1200L,
                "likes", 20L,
                "comments", 5L
        );
        int standardScore = calculator.calculate(TrendSourceCode.YOUTUBE, "B", Instant.now().minus(6, ChronoUnit.HOURS), standardVideo);

        assertThat(viralScore).isGreaterThan(standardScore);
        assertThat(viralScore).isGreaterThan(70);
    }

    @Test
    @DisplayName("Community scoring for HackerNews, Reddit and Dev.to rewards upvotes and discussion")
    void testCommunityScoring() {
        Map<String, Object> frontPagePost = Map.of(
                "score", 850L,
                "comments", 420L
        );

        int hnScore = calculator.calculate(TrendSourceCode.HACKERNEWS, "B", Instant.now().minus(3, ChronoUnit.HOURS), frontPagePost);
        int redditScore = calculator.calculate(TrendSourceCode.REDDIT, "B", Instant.now().minus(3, ChronoUnit.HOURS), frontPagePost);

        assertThat(hnScore).isGreaterThanOrEqualTo(75);
        assertThat(redditScore).isGreaterThanOrEqualTo(75);
    }

    @Test
    @DisplayName("Source Level A gives higher multiplier than B and C")
    void testSourceLevelMultiplier() {
        Map<String, Object> metrics = Map.of("count", 1000L, "engagement", 200L);
        Instant now = Instant.now();

        int scoreA = calculator.calculate(TrendSourceCode.GITHUB, "A", now, metrics);
        int scoreB = calculator.calculate(TrendSourceCode.GITHUB, "B", now, metrics);
        int scoreC = calculator.calculate(TrendSourceCode.GITHUB, "C", now, metrics);

        assertThat(scoreA).isGreaterThanOrEqualTo(scoreB);
        assertThat(scoreB).isGreaterThanOrEqualTo(scoreC);
    }

    @Test
    @DisplayName("Recency decay reduces score as items age")
    void testRecencyDecay() {
        Map<String, Object> metrics = Map.of(
                "stars", 5000L,
                "forks", 500L
        );

        Instant fresh = Instant.now().minus(6, ChronoUnit.HOURS);
        Instant weekOld = Instant.now().minus(8, ChronoUnit.DAYS);
        Instant old = Instant.now().minus(100, ChronoUnit.DAYS);

        int scoreFresh = calculator.calculate(TrendSourceCode.GITHUB, "A", fresh, metrics);
        int scoreWeekOld = calculator.calculate(TrendSourceCode.GITHUB, "A", weekOld, metrics);
        int scoreOld = calculator.calculate(TrendSourceCode.GITHUB, "A", old, metrics);

        assertThat(scoreFresh).isGreaterThan(scoreWeekOld);
        assertThat(scoreWeekOld).isGreaterThan(scoreOld);
    }

    @Test
    @DisplayName("Score calculation on Trend entity works seamlessly")
    void testTrendEntityCalculation() {
        TrendSource source = TrendSource.builder()
                .code(TrendSourceCode.GITHUB)
                .sourceLevel("A")
                .name("GitHub")
                .build();

        Trend trend = Trend.builder()
                .source(source)
                .externalId("facebook/react")
                .title("React")
                .url("https://github.com/facebook/react")
                .fetchedAt(Instant.now().minus(1, ChronoUnit.HOURS))
                .metadata(Map.of(
                        "stars", 220000L,
                        "forks", 45000L,
                        "stars_today", 80L
                ))
                .build();

        int score = calculator.calculate(trend);
        assertThat(score).isBetween(80, 100);
    }
}
