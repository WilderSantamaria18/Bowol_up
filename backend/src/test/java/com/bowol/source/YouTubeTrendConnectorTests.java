package com.bowol.source;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class YouTubeTrendConnectorTests {

    private YouTubeTrendConnector connector;

    @BeforeEach
    void setUp() {
        connector = new YouTubeTrendConnector(new ObjectMapper(), "");
    }

    @Test
    @DisplayName("Connector returns YOUTUBE code and non-empty trend list")
    void testFetchTrends() {
        assertThat(connector.getSourceCode()).isEqualTo(TrendSourceCode.YOUTUBE);

        List<RawTrendItem> trends = connector.fetchTrends(5);
        assertThat(trends).isNotEmpty();

        RawTrendItem first = trends.get(0);
        assertThat(first.getExternalId()).isNotBlank();
        assertThat(first.getTitle()).isNotBlank();
        assertThat(first.getUrl()).contains("youtube.com");
        assertThat(first.getTags()).isNotEmpty();
        assertThat(first.getMetadata()).containsKey("views");
    }
}
