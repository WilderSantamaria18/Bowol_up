package com.bowol.swot.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateSwotItemStatusRequest {

    @NotBlank(message = "El status es obligatorio (ACTIVE, CONVERTED, DISMISSED)")
    private String status;
}
