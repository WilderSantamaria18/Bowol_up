package com.bowol.auth.sso.dto;

import com.bowol.auth.sso.SsoProvider;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SsoInitiateResponse {
    private UUID organizationId;
    private String organizationName;
    private SsoProvider provider;
    private String authorizationUrl;
    private String state;
}
