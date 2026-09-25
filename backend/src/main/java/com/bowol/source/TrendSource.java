package com.bowol.source;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "trend_sources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrendSource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "code", length = 30, nullable = false, unique = true)
    private TrendSourceCode code;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "base_url")
    private String baseUrl;

    @Column(name = "source_level", length = 1, nullable = false)
    @Builder.Default
    private String sourceLevel = "B";

    @Column(name = "description")
    private String description;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "last_synced_at")
    private Instant lastSyncedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
        if (this.isActive == null) {
            this.isActive = true;
        }
        if (this.sourceLevel == null) {
            this.sourceLevel = "B";
        }
    }
}
