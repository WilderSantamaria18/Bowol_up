package com.bowol.auth.sso.dto;

import com.bowol.auth.sso.SsoProvider;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SsoCallbackRequest {
    @NotNull(message = "La organización es obligatoria")
    private UUID organizationId;

    @NotNull(message = "El proveedor es obligatorio")
    private SsoProvider provider;

    @NotBlank(message = "El código de autorización o token es obligatorio")
    private String code;

    private String email;
    private String fullName;
    private String avatarUrl;
}
