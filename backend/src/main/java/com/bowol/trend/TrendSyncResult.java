package com.bowol.trend;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrendSyncResult {

    @Builder.Default
    private int totalFetched = 0;

    @Builder.Default
    private int totalCreated = 0;

    @Builder.Default
    private int totalUpdated = 0;

    @Builder.Default
    private int totalErrors = 0;

    @Builder.Default
    private List<String> messages = new ArrayList<>();

    public void addCreated() {
        this.totalCreated++;
    }

    public void addUpdated() {
        this.totalUpdated++;
    }

    public void addFetched(int count) {
        this.totalFetched += count;
    }

    public void addError(String message) {
        this.totalErrors++;
        this.messages.add(message);
    }
}
