package com.bowol.developer;

import lombok.Builder;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class RateLimiterService {

    @Getter
    @Builder
    public static class RateLimitResult {
        private final boolean allowed;
        private final int limit;
        private final int remaining;
        private final long resetSeconds;
    }

    private static class TokenBucket {
        private final int capacity;
        private double tokens;
        private long lastRefillNanos;

        public TokenBucket(int capacity) {
            this.capacity = capacity;
            this.tokens = capacity;
            this.lastRefillNanos = System.nanoTime();
        }

        public synchronized RateLimitResult tryConsume() {
            long now = System.nanoTime();
            double elapsedSeconds = (now - lastRefillNanos) / 1_000_000_000.0;
            lastRefillNanos = now;

            // Capacidad por minuto: recarga tokens/segundo = capacity / 60.0
            double refillRate = (double) capacity / 60.0;
            tokens = Math.min((double) capacity, tokens + elapsedSeconds * refillRate);

            if (tokens >= 1.0) {
                tokens -= 1.0;
                int remaining = (int) Math.floor(tokens);
                long reset = (long) Math.ceil((capacity - tokens) / refillRate);
                return RateLimitResult.builder()
                        .allowed(true)
                        .limit(capacity)
                        .remaining(remaining)
                        .resetSeconds(Math.max(1, reset))
                        .build();
            } else {
                long waitSeconds = (long) Math.ceil((1.0 - tokens) / refillRate);
                return RateLimitResult.builder()
                        .allowed(false)
                        .limit(capacity)
                        .remaining(0)
                        .resetSeconds(Math.max(1, waitSeconds))
                        .build();
            }
        }
    }

    private final Map<UUID, TokenBucket> buckets = new ConcurrentHashMap<>();

    public RateLimitResult checkLimit(UUID organizationId, String planId) {
        int limit = getLimitForPlan(planId);
        TokenBucket bucket = buckets.computeIfAbsent(organizationId, k -> new TokenBucket(limit));
        return bucket.tryConsume();
    }

    public int getLimitForPlan(String planId) {
        if (planId == null) return 60;
        return switch (planId.toUpperCase()) {
            case "PRO" -> 1000;
            case "BUSINESS", "ENTERPRISE" -> 10000;
            default -> 60; // FREE
        };
    }
}
