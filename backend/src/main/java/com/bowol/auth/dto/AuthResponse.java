package com.bowol.auth.dto;

import com.bowol.organization.Role;
import lombok.*;

import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    @Builder.Default
    private String tokenType = "Bearer";
    private long expiresIn; // segundos (900)

    private UserSummary user;
    private OrganizationSummary organization;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserSummary {
        private UUID id;
        private String name;
        private String email;
        private String avatarUrl;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrganizationSummary {
        private UUID id;
        private String name;
        private String slug;
        private Role role;
        private Set<String> permissions;
    }
}
