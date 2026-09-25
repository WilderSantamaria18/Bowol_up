package com.bowol.auth;

import com.bowol.organization.Role;
import com.bowol.shared.security.RsaKeyProvider;
import com.bowol.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final RsaKeyProvider rsaKeyProvider;

    @Value("${bowol.security.jwt.access-token-expiration-ms:900000}")
    private long accessTokenExpirationMs; // 15 minutos por defecto

    public String generateAccessToken(User user, UUID organizationId, Role role, Set<String> permissions) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + accessTokenExpirationMs);
        String jti = UUID.randomUUID().toString();

        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("name", user.getName())
                .claim("org_id", organizationId != null ? organizationId.toString() : null)
                .claim("role", role != null ? role.name() : null)
                .claim("permissions", new ArrayList<>(permissions))
                .id(jti)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(rsaKeyProvider.getPrivateKey(), Jwts.SIG.RS256)
                .compact();
    }

    public Claims parseAndValidate(String token) {
        return Jwts.parser()
                .verifyWith(rsaKeyProvider.getPublicKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public UUID extractUserId(String token) {
        return UUID.fromString(parseAndValidate(token).getSubject());
    }

    public UUID extractOrganizationId(String token) {
        String orgId = parseAndValidate(token).get("org_id", String.class);
        return orgId != null ? UUID.fromString(orgId) : null;
    }

    public Role extractRole(String token) {
        String roleStr = parseAndValidate(token).get("role", String.class);
        return roleStr != null ? Role.valueOf(roleStr) : null;
    }

    @SuppressWarnings("unchecked")
    public List<String> extractPermissions(String token) {
        return parseAndValidate(token).get("permissions", List.class);
    }

    public String extractJti(String token) {
        return parseAndValidate(token).getId();
    }

    public boolean isTokenExpired(String token) {
        try {
            return parseAndValidate(token).getExpiration().before(new Date());
        } catch (Exception e) {
            return true;
        }
    }
}
