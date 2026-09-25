package com.bowol.opportunity.dto;

import com.bowol.opportunity.OpportunityStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateOpportunityStatusRequest {
    @NotNull(message = "El estado es obligatorio (IDENTIFIED, EVALUATING, APPROVED, REJECTED, CONVERTED)")
    private OpportunityStatus status;
}
