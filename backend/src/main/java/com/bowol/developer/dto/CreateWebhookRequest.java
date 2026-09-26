package com.bowol.developer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.URL;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateWebhookRequest {

    @NotBlank(message = "La URL del Webhook es obligatoria")
    @URL(message = "La URL debe ser válida (http:// o https://)")
    private String url;

    private String description;

    @NotEmpty(message = "Debe suscribirse al menos a un evento")
    private List<String> events;

    /**
     * Secreto HMAC opcional. Si no se provee, el servidor genera uno seguro automáticamente.
     */
    private String secret;
}
