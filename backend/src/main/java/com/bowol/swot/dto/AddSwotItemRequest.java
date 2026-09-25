package com.bowol.swot.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddSwotItemRequest {

    @NotBlank(message = "El cuadrante es obligatorio (strengths, weaknesses, opportunities, threats)")
    private String quadrant;

    @NotBlank(message = "El texto del item es obligatorio")
    private String text;

    @Builder.Default
    private List<String> evidenceIds = new ArrayList<>();
}
