package com.bowol.trend;

import com.bowol.source.TrendSourceCode;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;

/**
 * Algoritmo determinístico de cálculo de TrendScore (0 a 100).
 * Evalúa tracción (volumen), engagement (interacción), velocidad (momentum),
 * fiabilidad de la fuente (source_level) y decaimiento por antigüedad (recency decay).
 */
@Component
public class TrendScoreCalculator {

    public int calculate(Trend trend) {
        if (trend == null) {
            return 0;
        }

        TrendSourceCode sourceCode = trend.getSource() != null ? trend.getSource().getCode() : null;
        String sourceLevel = trend.getSource() != null ? trend.getSource().getSourceLevel() : "B";
        Instant fetchedAt = trend.getFetchedAt() != null ? trend.getFetchedAt() : Instant.now();
        Map<String, Object> metadata = trend.getMetadata();

        return calculate(sourceCode, sourceLevel, fetchedAt, metadata);
    }

    public int calculate(TrendSourceCode sourceCode, String sourceLevel, Instant timestamp, Map<String, Object> metadata) {
        if (metadata == null) {
            metadata = Map.of();
        }

        double volumeScore;
        double engagementScore;
        double velocityScore;

        if (sourceCode == TrendSourceCode.GITHUB) {
            volumeScore = calculateGitHubVolume(metadata);
            engagementScore = calculateGitHubEngagement(metadata);
            velocityScore = calculateGitHubVelocity(metadata, timestamp);
        } else if (sourceCode == TrendSourceCode.YOUTUBE) {
            volumeScore = calculateYouTubeVolume(metadata);
            engagementScore = calculateYouTubeEngagement(metadata);
            velocityScore = calculateYouTubeVelocity(metadata, timestamp);
        } else if (sourceCode == TrendSourceCode.HACKERNEWS || sourceCode == TrendSourceCode.REDDIT || sourceCode == TrendSourceCode.DEVTO) {
            volumeScore = calculateCommunityVolume(metadata);
            engagementScore = calculateCommunityEngagement(metadata);
            velocityScore = calculateCommunityVelocity(metadata, timestamp);
        } else {
            volumeScore = calculateGenericVolume(metadata);
            engagementScore = calculateGenericEngagement(metadata);
            velocityScore = calculateGenericVelocity(timestamp);
        }

        double rawBase = volumeScore + engagementScore + velocityScore;

        double sourceMultiplier = getSourceLevelMultiplier(sourceLevel);
        double recencyFactor = getRecencyDecayFactor(timestamp);

        double finalScore = rawBase * sourceMultiplier * recencyFactor;

        return Math.max(0, Math.min(100, (int) Math.round(finalScore)));
    }

    // =========================================================================
    // GITHUB SCORING
    // =========================================================================
    private double calculateGitHubVolume(Map<String, Object> metadata) {
        long stars = getLong(metadata, "stars", "stargazers_count");
        long forks = getLong(metadata, "forks", "forks_count");

        // Max 35 pts from stars on log10 scale (10,000+ stars ~ 35 pts)
        double starPoints = stars <= 0 ? 0.0 : Math.min(35.0, (Math.log10(stars + 1.0) / 4.0) * 35.0);

        // Max 10 pts from forks (1,000+ forks ~ 10 pts)
        double forkPoints = forks <= 0 ? 0.0 : Math.min(10.0, (Math.log10(forks + 1.0) / 3.0) * 10.0);

        return Math.min(45.0, starPoints + forkPoints);
    }

    private double calculateGitHubEngagement(Map<String, Object> metadata) {
        long stars = getLong(metadata, "stars", "stargazers_count");
        long forks = getLong(metadata, "forks", "forks_count");
        long openIssues = getLong(metadata, "open_issues", "open_issues_count");

        if (stars == 0) {
            return 0.0;
        }

        // Fork ratio: active community branching
        double forkRatio = (double) forks / (double) stars;
        double ratioPoints = Math.min(15.0, forkRatio * 60.0);

        // Active issue activity
        double issuePoints = openIssues <= 0 ? 0.0 : Math.min(10.0, (Math.log10(openIssues + 1.0) / 2.5) * 10.0);

        return Math.min(25.0, ratioPoints + issuePoints);
    }

    private double calculateGitHubVelocity(Map<String, Object> metadata, Instant timestamp) {
        long starsToday = getLong(metadata, "stars_today", "daily_stars");
        if (starsToday > 0) {
            // e.g. trending repos with > 100 stars today get full 30 velocity points
            return Math.min(30.0, (starsToday / 100.0) * 30.0);
        }

        long weeklyStars = getLong(metadata, "stars_week", "weekly_stars");
        if (weeklyStars > 0) {
            return Math.min(30.0, (weeklyStars / 500.0) * 30.0);
        }

        // Fallback: age-based momentum
        return getRecencyVelocityBonus(timestamp);
    }

    // =========================================================================
    // YOUTUBE SCORING
    // =========================================================================
    private double calculateYouTubeVolume(Map<String, Object> metadata) {
        long views = getLong(metadata, "views", "view_count", "viewCount");
        if (views <= 0) return 0.0;

        // 100,000+ views ~ 45 pts
        return Math.min(45.0, (Math.log10(views + 1.0) / 5.0) * 45.0);
    }

    private double calculateYouTubeEngagement(Map<String, Object> metadata) {
        long views = getLong(metadata, "views", "view_count", "viewCount");
        long likes = getLong(metadata, "likes", "like_count", "likeCount");
        long comments = getLong(metadata, "comments", "comment_count", "commentCount");

        if (views == 0) return 0.0;

        double likeRatio = (double) likes / (double) views;
        double likePoints = Math.min(15.0, (likeRatio / 0.05) * 15.0); // 5% like ratio is exceptional

        double commentPoints = comments <= 0 ? 0.0 : Math.min(10.0, (Math.log10(comments + 1.0) / 3.0) * 10.0);

        return Math.min(25.0, likePoints + commentPoints);
    }

    private double calculateYouTubeVelocity(Map<String, Object> metadata, Instant timestamp) {
        long views = getLong(metadata, "views", "view_count", "viewCount");
        long hours = getAgeInHours(timestamp);
        if (hours <= 0) hours = 1;

        double viewsPerHour = (double) views / hours;
        if (viewsPerHour > 500) return 30.0;
        return Math.min(30.0, (viewsPerHour / 500.0) * 30.0);
    }

    // =========================================================================
    // COMMUNITY (HackerNews, Reddit, Dev.to)
    // =========================================================================
    private double calculateCommunityVolume(Map<String, Object> metadata) {
        long score = getLong(metadata, "score", "points", "upvotes");
        if (score <= 0) return 0.0;

        // 500+ points ~ 45 pts
        return Math.min(45.0, (Math.log10(score + 1.0) / 2.7) * 45.0);
    }

    private double calculateCommunityEngagement(Map<String, Object> metadata) {
        long comments = getLong(metadata, "comments", "num_comments", "comments_count");
        if (comments <= 0) return 0.0;

        // 200+ comments ~ 25 pts
        return Math.min(25.0, (Math.log10(comments + 1.0) / 2.3) * 25.0);
    }

    private double calculateCommunityVelocity(Map<String, Object> metadata, Instant timestamp) {
        long score = getLong(metadata, "score", "points", "upvotes");
        long hours = getAgeInHours(timestamp);
        if (hours <= 0) hours = 1;

        double pointsPerHour = (double) score / hours;
        if (pointsPerHour > 25) return 30.0;
        return Math.min(30.0, (pointsPerHour / 25.0) * 30.0);
    }

    // =========================================================================
    // GENERIC FALLBACK
    // =========================================================================
    private double calculateGenericVolume(Map<String, Object> metadata) {
        long count = getLong(metadata, "volume", "count", "metrics_sum");
        if (count <= 0) return 15.0; // Baseline
        return Math.min(45.0, (Math.log10(count + 1.0) / 3.0) * 45.0);
    }

    private double calculateGenericEngagement(Map<String, Object> metadata) {
        long interactions = getLong(metadata, "engagement", "interactions");
        if (interactions <= 0) return 10.0;
        return Math.min(25.0, (Math.log10(interactions + 1.0) / 2.5) * 25.0);
    }

    private double calculateGenericVelocity(Instant timestamp) {
        return getRecencyVelocityBonus(timestamp);
    }

    // =========================================================================
    // MULTIPLIERS & DECAY FACTORS
    // =========================================================================
    public double getSourceLevelMultiplier(String sourceLevel) {
        if (sourceLevel == null) return 0.88;
        return switch (sourceLevel.trim().toUpperCase()) {
            case "A" -> 1.00;
            case "B" -> 0.90;
            case "C" -> 0.75;
            default -> 0.85;
        };
    }

    public double getRecencyDecayFactor(Instant timestamp) {
        long hours = getAgeInHours(timestamp);

        if (hours <= 24) {
            return 1.00;
        } else if (hours <= 72) {
            return 0.95;
        } else if (hours <= 168) { // 7 days
            return 0.88;
        } else if (hours <= 720) { // 30 days
            return 0.75;
        } else if (hours <= 2160) { // 90 days
            return 0.60;
        } else {
            return 0.45;
        }
    }

    private double getRecencyVelocityBonus(Instant timestamp) {
        long hours = getAgeInHours(timestamp);
        if (hours <= 12) return 30.0;
        if (hours <= 24) return 25.0;
        if (hours <= 48) return 18.0;
        if (hours <= 120) return 10.0;
        return 5.0;
    }

    private long getAgeInHours(Instant timestamp) {
        if (timestamp == null) return 0;
        Duration diff = Duration.between(timestamp, Instant.now());
        return Math.max(0, diff.toHours());
    }

    private long getLong(Map<String, Object> map, String... keys) {
        if (map == null) return 0;
        for (String key : keys) {
            Object val = map.get(key);
            if (val instanceof Number n) {
                return n.longValue();
            } else if (val instanceof String s) {
                try {
                    return Long.parseLong(s.trim());
                } catch (NumberFormatException ignored) {}
            }
        }
        return 0;
    }
}
