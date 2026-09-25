package com.bowol.trend;

import com.bowol.source.TrendSource;
import com.bowol.source.TrendSourceCode;
import com.bowol.source.TrendSourceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class TrendSyncServiceTests {

    @Autowired
    private TrendSyncService trendSyncService;

    @Autowired
    private TrendSourceRepository trendSourceRepository;

    @Autowired
    private TrendRepository trendRepository;

    @BeforeEach
    void setUp() {
        trendRepository.deleteAll();
    }

    @Test
    @DisplayName("Syncing all active sources creates trends with valid calculated scores and updates lastSyncedAt")
    void testSyncAllActiveSources() {
        TrendSyncResult result = trendSyncService.syncAllActiveSources(3);

        assertThat(result.getTotalFetched()).isGreaterThanOrEqualTo(2);
        assertThat(result.getTotalCreated()).isGreaterThanOrEqualTo(2);
        assertThat(result.getTotalErrors()).isZero();

        List<Trend> allTrends = trendRepository.findAll();
        assertThat(allTrends).isNotEmpty();

        for (Trend trend : allTrends) {
            assertThat(trend.getScore()).isBetween(0, 100);
            assertThat(trend.getSource()).isNotNull();
            assertThat(trend.getExternalId()).isNotBlank();
            assertThat(trend.getTitle()).isNotBlank();
            assertThat(trend.getUrl()).isNotBlank();
        }

        // Verify lastSyncedAt was updated on sources
        Optional<TrendSource> github = trendSourceRepository.findByCode(TrendSourceCode.GITHUB);
        assertThat(github).isPresent();
        assertThat(github.get().getLastSyncedAt()).isNotNull();
    }

    @Test
    @DisplayName("Re-running sync updates existing records idempotently instead of creating duplicates")
    void testIdempotentSync() {
        // First sync creates items
        TrendSyncResult firstRun = trendSyncService.syncSource(TrendSourceCode.GITHUB, 2);
        assertThat(firstRun.getTotalCreated()).isGreaterThanOrEqualTo(1);

        long countAfterFirstRun = trendRepository.count();

        // Second sync should update existing items
        TrendSyncResult secondRun = trendSyncService.syncSource(TrendSourceCode.GITHUB, 2);
        assertThat(secondRun.getTotalUpdated()).isGreaterThanOrEqualTo(1);
        assertThat(secondRun.getTotalCreated()).isZero();

        long countAfterSecondRun = trendRepository.count();
        assertThat(countAfterSecondRun).isEqualTo(countAfterFirstRun);
    }
}
