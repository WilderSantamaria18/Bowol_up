package com.bowol.audit;

import com.bowol.shared.multitenancy.TenantContext;
import com.bowol.shared.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;
import java.util.*;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class AuditAspect {

    private final AuditLogService auditLogService;

    @Around("@annotation(auditedAction)")
    public Object auditMethod(ProceedingJoinPoint joinPoint, AuditedAction auditedAction) throws Throwable {
        long startTime = System.currentTimeMillis();
        Object result = null;
        Throwable thrown = null;

        try {
            result = joinPoint.proceed();
            return result;
        } catch (Throwable t) {
            thrown = t;
            throw t;
        } finally {
            try {
                recordAudit(joinPoint, auditedAction, result, thrown, System.currentTimeMillis() - startTime);
            } catch (Exception e) {
                log.error("Error al registrar evento de auditoría en aspecto AOP: {}", e.getMessage(), e);
            }
        }
    }

    private void recordAudit(
            ProceedingJoinPoint joinPoint,
            AuditedAction annotation,
            Object result,
            Throwable thrown,
            long executionMs
    ) {
        UUID organizationId = TenantContext.getTenantId();
        UUID userId = null;
        String actorEmail = "anonymous";

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            userId = principal.getId();
            actorEmail = principal.getEmail();
            if (organizationId == null) {
                organizationId = principal.getOrganizationId();
            }
        }

        String clientIp = "127.0.0.1";
        String userAgent = "Unknown";
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            clientIp = extractClientIp(request);
            userAgent = request.getHeader("User-Agent");
            if (userAgent == null) userAgent = "Direct-API";
        }

        // Extraer Entity ID de parámetros o del resultado
        String entityId = extractEntityId(joinPoint, annotation, result);

        Map<String, Object> details = new LinkedHashMap<>();
        details.put("method", joinPoint.getSignature().toShortString());
        details.put("executionTimeMs", executionMs);
        details.put("status", thrown == null ? "SUCCESS" : "FAILURE");
        if (thrown != null) {
            details.put("error", thrown.getMessage());
        }
        if (!annotation.description().isBlank()) {
            details.put("description", annotation.description());
        }

        auditLogService.record(
                organizationId,
                userId,
                actorEmail,
                annotation.action(),
                annotation.entityType(),
                entityId,
                details,
                clientIp,
                userAgent
        );
    }

    private String extractEntityId(ProceedingJoinPoint joinPoint, AuditedAction annotation, Object result) {
        // 1. Revisar si hay un parámetro llamado id o uuid
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String[] paramNames = signature.getParameterNames();
        Object[] args = joinPoint.getArgs();

        if (paramNames != null && args != null) {
            String targetParam = annotation.entityIdParam();
            for (int i = 0; i < paramNames.length; i++) {
                if (!targetParam.isBlank() && paramNames[i].equalsIgnoreCase(targetParam) && args[i] != null) {
                    return args[i].toString();
                }
                if (targetParam.isBlank() && (paramNames[i].equalsIgnoreCase("id") || paramNames[i].equalsIgnoreCase("projectId") || paramNames[i].equalsIgnoreCase("userId")) && args[i] != null) {
                    return args[i].toString();
                }
            }
            // Si el primer parámetro es UUID o Long/String y no encontramos por nombre
            if (args.length > 0 && args[0] != null) {
                if (args[0] instanceof UUID || args[0] instanceof Long) {
                    return args[0].toString();
                }
            }
        }

        // 2. Extraer del objeto devuelto si es un DTO o entidad con getId()
        if (result != null) {
            try {
                Method getIdMethod = result.getClass().getMethod("getId");
                Object idVal = getIdMethod.invoke(result);
                if (idVal != null) {
                    return idVal.toString();
                }
            } catch (Exception ignored) {
            }
        }

        return null;
    }

    private String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank() && !"unknown".equalsIgnoreCase(realIp)) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }
}
