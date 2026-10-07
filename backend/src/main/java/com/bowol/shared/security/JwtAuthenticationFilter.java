package com.bowol.shared.security;

import com.bowol.auth.JwtService;
import com.bowol.organization.MemberStatus;
import com.bowol.organization.OrganizationMember;
import com.bowol.organization.OrganizationMemberRepository;
import com.bowol.organization.Role;
import com.bowol.shared.multitenancy.TenantContext;
import com.bowol.user.UserRepository;
import com.bowol.user.UserStatus;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final OrganizationMemberRepository organizationMemberRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // Correlación de trazas
        String traceId = request.getHeader("X-Trace-Id");
        if (traceId == null || traceId.isBlank()) {
            traceId = UUID.randomUUID().toString();
        }
        response.setHeader("X-Trace-Id", traceId);

        String authHeader = request.getHeader("Authorization");

        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String jwt = authHeader.substring(7);

                try {
                    Claims claims = jwtService.parseAndValidate(jwt);
                    UUID userId = UUID.fromString(claims.getSubject());
                    String email = claims.get("email", String.class);
                    String name = claims.get("name", String.class);
                    String orgIdStr = claims.get("org_id", String.class);
                    UUID orgId = orgIdStr != null ? UUID.fromString(orgIdStr) : null;
                    if (orgId == null) {
                        throw new IllegalArgumentException("Token without an active organization");
                    }

                    TenantContext.setTenantId(orgId);
                    TenantContext.setUserId(userId);

                    UserStatus userStatus = userRepository.findByIdAndDeletedAtIsNull(userId)
                            .map(user -> user.getStatus())
                            .orElseThrow(() -> new IllegalArgumentException("Unknown user"));
                    if (userStatus != UserStatus.ACTIVE) {
                        throw new IllegalArgumentException("Inactive user");
                    }

                    OrganizationMember membership = organizationMemberRepository
                            .findByUserIdAndOrganizationId(userId, orgId)
                            .filter(member -> member.getStatus() == MemberStatus.ACTIVE)
                            .orElseThrow(() -> new IllegalArgumentException("Inactive membership"));

                    Role role = membership.getRole();
                    UserPrincipal principal = UserPrincipal.create(
                            userId,
                            email,
                            name,
                            orgId,
                            role,
                            RolePermissions.getPermissionValues(role)
                    );

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            principal,
                            null,
                            principal.getAuthorities()
                    );
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } catch (Exception e) {
                    log.debug("Token JWT no válido o expirado: {}", e.getMessage());
                    SecurityContextHolder.clearContext();
                    TenantContext.clear();
                }
            }

            filterChain.doFilter(request, response);
        } finally {
            // Limpiar siempre TenantContext para evitar contaminación entre hilos del pool
            TenantContext.clear();
        }
    }
}
