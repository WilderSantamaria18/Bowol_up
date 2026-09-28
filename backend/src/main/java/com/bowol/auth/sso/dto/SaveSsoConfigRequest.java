package com.bowol.auth.sso.dto;

import com.bowol.auth.sso.SsoProvider;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaveSsoConfigRequest {
    @NotNull(message = "El proveedor de SSO es obligatorio")
    private SsoProvider provider;

    private String displayName;

    @NotBlank(message = "El Client ID es obligatorio")
    private String clientId;

    private String clientSecret;

    private String issuerUri;
    private String metadataUrl;
    private String authorizationUrl;
    private String tokenUrl;
    private String userinfoUrl;

    private String domainRestriction;
    private Boolean isEnabled;
    private Boolean enforceSso;
}
