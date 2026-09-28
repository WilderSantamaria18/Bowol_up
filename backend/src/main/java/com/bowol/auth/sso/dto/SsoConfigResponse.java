package com.bowol.auth.sso.dto;

import com.bowol.auth.sso.SsoProvider;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SsoConfigResponse {
    private UUID id;
    private UUID organizationId;
    private SsoProvider provider;
    private String displayName;
    private String clientId;
    private String issuerUri;
    private String metadataUrl;
    private String authorizationUrl;
    private String domainRestriction;
    private Boolean isEnabled;
    private Boolean enforceSso;
    private Instant createdAt;
    private Instant updatedAt;
}
