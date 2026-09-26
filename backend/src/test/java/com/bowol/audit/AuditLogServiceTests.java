package com.bowol.audit;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AuditLogServiceTests {

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private AuditLogRepository auditLogRepository;

    private UUID testOrgId;
    private UUID testUserId;

    @BeforeEach
    void setUp() {
        testOrgId = UUID.randomUUID();
        testUserId = UUID.randomUUID();
    }

    @Test
    @DisplayName("Debe registrar y consultar un evento de auditoría empresarial")
    void testRecordAndGetLogs() {
        AuditLog saved = auditLogService.record(
                testOrgId,
                testUserId,
                "admin@bowol.com",
                "PROJECT_CREATE",
                "PROJECT",
                "proj-123",
                Map.of("name", "Innovation Hub"),
                "192.168.1.100",
                "Mozilla/5.0 TestBrowser"
        );

        assertThat(saved).isNotNull();
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getAction()).isEqualTo("PROJECT_CREATE");
        assertThat(saved.getActorEmail()).isEqualTo("admin@bowol.com");

        Page<AuditLog> page = auditLogService.getLogs(
                testOrgId,
                "PROJECT_CREATE",
                null,
                null,
                null,
                null,
                PageRequest.of(0, 10)
        );

        assertThat(page.getTotalElements()).isGreaterThanOrEqualTo(1);
        assertThat(page.getContent()).anyMatch(log -> "proj-123".equals(log.getEntityId()));
    }

    @Test
    @DisplayName("Debe exportar registros de auditoría en formato CSV conforme a RFC 4180")
    void testExportToCsv() {
        auditLogService.record(
                testOrgId,
                testUserId,
                "security@enterprise.com",
                "ROLE_CHANGE",
                "MEMBER",
                "user-999",
                Map.of("previousRole", "MEMBER", "newRole", "ADMIN"),
                "10.0.0.1",
                "SecurityScanner/1.0"
        );

        String csv = auditLogService.exportToCsv(testOrgId, null, null, null, null, null);

        assertThat(csv).isNotNull();
        assertThat(csv).contains("ID,Timestamp,Actor Email,Action,Resource Type,Resource ID,IP Address,Details");
        assertThat(csv).contains("security@enterprise.com");
        assertThat(csv).contains("ROLE_CHANGE");
    }

    @Test
    @DisplayName("Debe generar métricas y resumen de compliance")
    void testAuditSummary() {
        auditLogService.record(
                testOrgId,
                testUserId,
                "audit@enterprise.com",
                "API_KEY_CREATE",
                "API_KEY",
                "key-1",
                Map.of("name", "CI/CD Key"),
                "127.0.0.1",
                "curl/8.0"
        );

        Map<String, Object> summary = auditLogService.getAuditSummary(testOrgId);

        assertThat(summary).isNotNull();
        assertThat(summary.get("complianceStatus")).isEqualTo("SOC2_TYPE_II_READY");
        assertThat(((Number) summary.get("totalEvents")).longValue()).isGreaterThanOrEqualTo(1);
    }
}
