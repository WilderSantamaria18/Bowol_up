package com.bowol.subscription.dto;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BuyCreditsRequest {

    @Min(value = 500, message = "El paquete mínimo es de 500 créditos")
    private Integer credits;
}
