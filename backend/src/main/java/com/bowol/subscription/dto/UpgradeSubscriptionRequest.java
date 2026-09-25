package com.bowol.subscription.dto;

import com.bowol.subscription.PaymentGateway;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpgradeSubscriptionRequest {

    @NotBlank(message = "El identificador del plan es obligatorio")
    private String planId;

    @Builder.Default
    private PaymentGateway paymentGateway = PaymentGateway.MOCK_STRIPE;
}
