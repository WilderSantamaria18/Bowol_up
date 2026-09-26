package com.bowol.developer;

import com.bowol.organization.Role;
import com.bowol.shared.multitenancy.TenantContext;
import com.bowol.shared.security.UserPrincipal;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class ApiKeyAuthenticationFilter extends OncePerRequestFilter {

    private final ApiKeyService apiKeyService;
    private final RateLimiterService rateLimiterService;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String apiKeyHeader = request.getHeader("X-API-Key");

        // Solo procesar si se proporciona el header X-API-Key y no hay otra autenticación activa
        if (apiKeyHeader != null && !apiKeyHeader.isBlank() && SecurityContextHolder.getContext().getAuthentication() == null) {
            Optional<ApiKey> apiKeyOpt = apiKeyService.validateAndTouchKey(apiKeyHeader.trim());

            if (apiKeyOpt.isPresent()) {
                ApiKey apiKey = apiKeyOpt.get();
                String planId = apiKeyService.getPlanForOrganization(apiKey.getOrganizationId());

                // Verificar Rate Limiting
                RateLimiterService.RateLimitResult rateLimit = rateLimiterService.checkLimit(apiKey.getOrganizationId(), planId);

                // Exponer headers de Rate Limit
                response.setHeader("X-RateLimit-Limit", String.valueOf(rateLimit.getLimit()));
                response.setHeader("X-RateLimit-Remaining", String.valueOf(rateLimit.getRemaining()));
                response.setHeader("X-RateLimit-Reset", String.valueOf(rateLimit.getResetSeconds()));

                if (!rateLimit.isAllowed()) {
                    response.setStatus(429);
                    response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);

                    Map<String, Object> problem = new LinkedHashMap<>();
                    problem.put("type", "https://api.bowol.com/errors/rate-limit-exceeded");
                    problem.put("title", "Too Many Requests");
                    problem.put("status", 429);
                    problem.put("detail", "Se ha superado la cuota de peticiones para su plan (" + planId + ": " + rateLimit.getLimit() + " req/min). Reintente en " + rateLimit.getResetSeconds() + "s.");
                    problem.put("instance", request.getRequestURI());
                    problem.put("timestamp", Instant.now().toString());

                    response.getWriter().write(objectMapper.writeValueAsString(problem));
                    return;
                }

                // Autenticar la petición con rol ADMIN en el contexto de su organización
                UserPrincipal principal = UserPrincipal.create(
                        apiKey.getId(),
                        "api-key@" + apiKey.getKeyPrefix(),
                        "API Key: " + apiKey.getName(),
                        apiKey.getOrganizationId(),
                        Role.ADMIN,
                        List.of("ROLE_ADMIN", "SCOPE_API")
                );

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        principal,
                        null,
                        principal.getAuthorities()
                );
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                TenantContext.setTenantId(apiKey.getOrganizationId());
            } else {
                log.debug("X-API-Key inválida o revocada recibida en {}", request.getRequestURI());
            }
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            // Si la autenticación fue por API Key, asegurar limpieza de TenantContext
            if (apiKeyHeader != null && !apiKeyHeader.isBlank()) {
                TenantContext.clear();
            }
        }
    }
}
