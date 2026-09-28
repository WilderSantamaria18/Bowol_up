package com.bowol.dashboard.dto;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardActivityItem {
    private Long id;
    private String action;
    private String entityType;
    private String entityId;
    private String actorEmail;
    private String description;
    private Instant createdAt;
}
