package com.bowol.planning.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrioritizationDto {
    private Integer reach;          // 1 a 10
    private Integer impact;         // 1 (bajo), 2 (medio), 3 (alto)
    private BigDecimal confidence;  // 0.0 a 1.0
    private BigDecimal effortHours; // Horas totales estimadas > 0
    private BigDecimal score;       // Score = (reach * impact * confidence) / effortHours
    private Boolean provisional;
    private String evidence;
}
