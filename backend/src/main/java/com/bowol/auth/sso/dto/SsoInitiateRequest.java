package com.bowol.auth.sso.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SsoInitiateRequest {
    @NotBlank(message = "El correo corporativo es obligatorio")
    @Email(message = "Formato de correo inválido")
    private String email;

    private String redirectUri;
}
