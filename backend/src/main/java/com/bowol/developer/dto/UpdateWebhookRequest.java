package com.bowol.developer.dto;

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
public class UpdateWebhookRequest {

    @URL(message = "La URL debe ser válida")
    private String url;

    private String description;

    private List<String> events;

    private Boolean isActive;
}
