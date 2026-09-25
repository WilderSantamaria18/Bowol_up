package com.bowol.trend;

import com.bowol.source.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrendSyncService {

    private final List<TrendSourceConnector> connectors;
    private final TrendSourceRepository trendSourceRepository;
    private final TrendRepository trendRepository;
    private final TrendScoreCalculator trendScoreCalculator;

    @Transactional
    public TrendSyncResult syncAllActiveSources(int limitPerSource) {
        log.info("Iniciando sincronización de todas las fuentes de tendencias activas...");
        TrendSyncResult aggregateResult = new TrendSyncResult();

        List<TrendSource> activeSources = trendSourceRepository.findByIsActiveTrue();
        if (activeSources.isEmpty()) {
            ensureDefaultSourcesSeeded();
            activeSources = trendSourceRepository.findByIsActiveTrue();
        }

        Map<TrendSourceCode, TrendSourceConnector> connectorMap = connectors.stream()
                .collect(Collectors.toMap(TrendSourceConnector::getSourceCode, c -> c, (c1, c2) -> c1));

        for (TrendSource source : activeSources) {
            TrendSourceConnector connector = connectorMap.get(source.getCode());
            if (connector == null) {
                log.debug("No hay conector registrado para la fuente {}", source.getCode());
                continue;
            }

            TrendSyncResult sourceResult = syncSourceWithConnector(source, connector, limitPerSource);
            aggregateResult.addFetched(sourceResult.getTotalFetched());
            for (int i = 0; i < sourceResult.getTotalCreated(); i++) aggregateResult.addCreated();
            for (int i = 0; i < sourceResult.getTotalUpdated(); i++) aggregateResult.addUpdated();
            if (sourceResult.getTotalErrors() > 0) {
                sourceResult.getMessages().forEach(aggregateResult::addError);
            }
        }

        log.info("Sincronización finalizada. Creados: {}, Actualizados: {}, Total obtenidos: {}",
                aggregateResult.getTotalCreated(), aggregateResult.getTotalUpdated(), aggregateResult.getTotalFetched());
        return aggregateResult;
    }

    @Transactional
    public TrendSyncResult syncSource(TrendSourceCode code, int limit) {
        TrendSource source = trendSourceRepository.findByCode(code)
                .orElseGet(() -> createDefaultSource(code));

        TrendSourceConnector connector = connectors.stream()
                .filter(c -> c.getSourceCode() == code)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("No hay conector implementado para: " + code));

        return syncSourceWithConnector(source, connector, limit);
    }

    private TrendSyncResult syncSourceWithConnector(TrendSource source, TrendSourceConnector connector, int limit) {
        TrendSyncResult result = new TrendSyncResult();
        try {
            List<RawTrendItem> rawItems = connector.fetchTrends(limit);
            result.addFetched(rawItems.size());

            for (RawTrendItem item : rawItems) {
                int calculatedScore = trendScoreCalculator.calculate(
                        source.getCode(),
                        source.getSourceLevel(),
                        item.getPublishedAt(),
                        item.getMetadata()
                );

                Optional<Trend> existingOpt = trendRepository.findBySourceIdAndExternalId(
                        source.getId(), item.getExternalId()
                );

                if (existingOpt.isPresent()) {
                    Trend existing = existingOpt.get();
                    existing.setTitle(item.getTitle());
                    existing.setDescription(item.getDescription());
                    existing.setUrl(item.getUrl());
                    existing.setTags(item.getTags());
                    existing.setMetadata(item.getMetadata());
                    existing.setScore(calculatedScore);
                    existing.setFetchedAt(Instant.now());
                    trendRepository.save(existing);
                    result.addUpdated();
                } else {
                    Trend newTrend = Trend.builder()
                            .source(source)
                            .externalId(item.getExternalId())
                            .title(item.getTitle())
                            .description(item.getDescription())
                            .url(item.getUrl())
                            .score(calculatedScore)
                            .tags(item.getTags())
                            .metadata(item.getMetadata())
                            .fetchedAt(Instant.now())
                            .build();
                    trendRepository.save(newTrend);
                    result.addCreated();
                }
            }

            source.setLastSyncedAt(Instant.now());
            trendSourceRepository.save(source);
        } catch (Exception e) {
            String err = "Error sincronizando fuente " + source.getCode() + ": " + e.getMessage();
            log.error(err, e);
            result.addError(err);
        }
        return result;
    }

    private void ensureDefaultSourcesSeeded() {
        if (!trendSourceRepository.existsByCode(TrendSourceCode.GITHUB)) {
            createDefaultSource(TrendSourceCode.GITHUB);
        }
        if (!trendSourceRepository.existsByCode(TrendSourceCode.YOUTUBE)) {
            createDefaultSource(TrendSourceCode.YOUTUBE);
        }
    }

    private TrendSource createDefaultSource(TrendSourceCode code) {
        String name = code == TrendSourceCode.GITHUB ? "GitHub" :
                code == TrendSourceCode.YOUTUBE ? "YouTube" : code.name();
        String level = code == TrendSourceCode.GITHUB ? "A" : "B";
        String url = code == TrendSourceCode.GITHUB ? "https://api.github.com" : "https://www.googleapis.com/youtube/v3";

        return trendSourceRepository.save(TrendSource.builder()
                .code(code)
                .name(name)
                .baseUrl(url)
                .sourceLevel(level)
                .isActive(true)
                .build());
    }
}
