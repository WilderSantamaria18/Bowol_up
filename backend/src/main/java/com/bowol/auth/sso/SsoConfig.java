package com.bowol.auth.sso;

import com.bowol.shared.persistence.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "organization_sso_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SsoConfig extends BaseTenantEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider", length = 30, nullable = false)
    private SsoProvider provider;

    @Column(name = "display_name", length = 100, nullable = false)
    @Builder.Default
    private String displayName = "Corporate SSO";

    @Column(name = "client_id", nullable = false)
    private String clientId;

    @Column(name = "client_secret")
    private String clientSecret;

    @Column(name = "issuer_uri")
    private String issuerUri;

    @Column(name = "metadata_url")
    private String metadataUrl;

    @Column(name = "authorization_url")
    private String authorizationUrl;

    @Column(name = "token_url")
    private String tokenUrl;

    @Column(name = "userinfo_url")
    private String userinfoUrl;

    @Column(name = "domain_restriction")
    private String domainRestriction;

    @Column(name = "is_enabled", nullable = false)
    @Builder.Default
    private Boolean isEnabled = true;

    @Column(name = "enforce_sso", nullable = false)
    @Builder.Default
    private Boolean enforceSso = false;

    @Column(name = "deleted_at")
    private Instant deletedAt;
}
