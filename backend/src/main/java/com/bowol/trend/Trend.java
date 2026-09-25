package com.bowol.trend;

import com.bowol.source.TrendSource;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.*;

@Entity
@Table(name = "trends", uniqueConstraints = {
    @UniqueConstraint(name = "uq_trends_source_external", columnNames = {"source_id", "external_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trend {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "source_id", nullable = false)
    private TrendSource source;

    @Column(name = "external_id", nullable = false)
    private String externalId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "url", nullable = false)
    private String url;

    @Column(name = "score", nullable = false)
    @Builder.Default
    private Integer score = 0;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "tags")
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata")
    @Builder.Default
    private Map<String, Object> metadata = new HashMap<>();

    @Column(name = "fetched_at", nullable = false)
    private Instant fetchedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
        if (this.fetchedAt == null) {
            this.fetchedAt = Instant.now();
        }
        if (this.score == null) {
            this.score = 0;
        }
        if (this.tags == null) {
            this.tags = new ArrayList<>();
        }
        if (this.metadata == null) {
            this.metadata = new HashMap<>();
        }
    }
}
