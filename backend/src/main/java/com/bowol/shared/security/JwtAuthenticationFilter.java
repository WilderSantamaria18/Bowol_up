package com.bowol.shared.security;

import com.bowol.auth.JwtService;
import com.bowol.organization.Role;
import com.bowol.shared.multitenancy.TenantContext;
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
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

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
                    String roleStr = claims.get("role", String.class);
                    Role role = roleStr != null ? Role.valueOf(roleStr) : null;
                    @SuppressWarnings("unchecked")
                    List<String> permissions = claims.get("permissions", List.class);

                    UserPrincipal principal = UserPrincipal.create(userId, email, name, orgId, role, permissions);

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            principal,
                            null,
                            principal.getAuthorities()
                    );
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    // Establecer TenantContext para el request
                    if (orgId != null) {
                        TenantContext.setTenantId(orgId);
                    }
                } catch (Exception e) {
                    log.debug("Token JWT no válido o expirado: {}", e.getMessage());
                    SecurityContextHolder.clearContext();
                }
            }

            filterChain.doFilter(request, response);
        } finally {
            // Limpiar siempre TenantContext para evitar contaminación entre hilos del pool
            TenantContext.clear();
        }
    }
}
