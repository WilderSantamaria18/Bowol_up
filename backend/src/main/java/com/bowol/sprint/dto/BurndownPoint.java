package com.bowol.sprint.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BurndownPoint {
    private LocalDate date;
    private BigDecimal idealHours;
    private BigDecimal remainingHours;
}
