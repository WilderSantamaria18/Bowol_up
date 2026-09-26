package com.bowol.audit;

import com.bowol.shared.multitenancy.TenantContext;
import com.bowol.shared.security.UserPrincipal;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.io.StringWriter;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    /**
     * Registra un evento de auditoría de forma segura e independiente en su propia transacción.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public AuditLog record(
            UUID organizationId,
            UUID userId,
            String actorEmail,
            String action,
            String entityType,
            String entityId,
            Object details,
            String ipAddress,
            String userAgent
    ) {
        String detailsJson = "{}";
        if (details != null) {
            try {
                if (details instanceof String str) {
                    detailsJson = str;
                } else {
                    detailsJson = objectMapper.writeValueAsString(details);
                }
            } catch (Exception e) {
                log.warn("No se pudo serializar detalles de auditoría: {}", e.getMessage());
                detailsJson = "{\"raw\":\"" + details.toString().replace("\"", "\\\"") + "\"}";
            }
        }

        AuditLog auditLog = AuditLog.builder()
                .organizationId(organizationId)
                .userId(userId)
                .actorEmail(actorEmail)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .detailsJson(detailsJson)
                .metadata(detailsJson)
                .createdAt(Instant.now())
                .build();

        AuditLog saved = auditLogRepository.save(auditLog);
        log.info("[AUDIT] {} on {} ({}) by {} - org: {}", action, entityType, entityId, actorEmail, organizationId);
        return saved;
    }

    /**
     * Registra automáticamente con el contexto de seguridad actual.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public AuditLog recordCurrent(
            String action,
            String entityType,
            String entityId,
            Object details,
            String ipAddress,
            String userAgent
    ) {
        UUID orgId = TenantContext.getTenantId();
        UUID userId = null;
        String email = "system";

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            userId = principal.getId();
            email = principal.getEmail();
            if (orgId == null) {
                orgId = principal.getOrganizationId();
            }
        }

        return record(orgId, userId, email, action, entityType, entityId, details, ipAddress, userAgent);
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getLogs(
            UUID organizationId,
            String action,
            String entityType,
            String actorEmail,
            Instant fromDate,
            Instant toDate,
            Pageable pageable
    ) {
        return auditLogRepository.findFiltered(organizationId, action, entityType, actorEmail, fromDate, toDate, pageable);
    }

    @Transactional(readOnly = true)
    public String exportToCsv(
            UUID organizationId,
            String action,
            String entityType,
            String actorEmail,
            Instant fromDate,
            Instant toDate
    ) {
        List<AuditLog> logs = auditLogRepository.findAllFilteredForExport(organizationId, action, entityType, actorEmail, fromDate, toDate);
        DateTimeFormatter dtf = DateTimeFormatter.ISO_INSTANT;

        StringWriter sw = new StringWriter();
        sw.append("ID,Timestamp,Actor Email,Action,Resource Type,Resource ID,IP Address,Details\n");

        for (AuditLog l : logs) {
            sw.append(String.valueOf(l.getId())).append(",");
            sw.append(escapeCsv(dtf.format(l.getCreatedAt()))).append(",");
            sw.append(escapeCsv(l.getActorEmail() != null ? l.getActorEmail() : "System")).append(",");
            sw.append(escapeCsv(l.getAction())).append(",");
            sw.append(escapeCsv(l.getEntityType())).append(",");
            sw.append(escapeCsv(l.getEntityId() != null ? l.getEntityId() : "")).append(",");
            sw.append(escapeCsv(l.getIpAddress() != null ? l.getIpAddress() : "")).append(",");
            sw.append(escapeCsv(l.getDetailsJson() != null ? l.getDetailsJson() : "")).append("\n");
        }

        return sw.toString();
    }

    @Transactional(readOnly = true)
    public List<AuditLog> exportToJson(
            UUID organizationId,
            String action,
            String entityType,
            String actorEmail,
            Instant fromDate,
            Instant toDate
    ) {
        return auditLogRepository.findAllFilteredForExport(organizationId, action, entityType, actorEmail, fromDate, toDate);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAuditSummary(UUID organizationId) {
        long totalLogs = auditLogRepository.countByOrganizationId(organizationId);
        List<AuditLog> recent = auditLogRepository.findTop20ByOrganizationIdOrderByCreatedAtDesc(organizationId);

        Instant twentyFourHoursAgo = Instant.now().minusSeconds(86400);
        long last24hCount = recent.stream().filter(l -> l.getCreatedAt().isAfter(twentyFourHoursAgo)).count();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalEvents", totalLogs);
        summary.put("eventsLast24Hours", last24hCount);
        summary.put("recentActivities", recent);
        summary.put("complianceStatus", "SOC2_TYPE_II_READY");
        return summary;
    }

    private String escapeCsv(String value) {
        if (value == null) return "\"\"";
        String escaped = value.replace("\"", "\"\"");
        return "\"" + escaped + "\"";
    }
}
