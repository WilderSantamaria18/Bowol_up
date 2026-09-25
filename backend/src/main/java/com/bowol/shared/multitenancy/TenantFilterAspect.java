package com.bowol.shared.multitenancy;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.hibernate.Session;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Aspect
@Component
public class TenantFilterAspect {

    @PersistenceContext
    private EntityManager entityManager;

    @Before("execution(* org.springframework.data.repository.Repository+.*(..))")
    public void enableTenantFilter() {
        UUID tenantId = TenantContext.getTenantId();
        if (tenantId != null) {
            try {
                Session session = entityManager.unwrap(Session.class);
                if (session != null && session.isOpen()) {
                    // 1. Filtro Hibernate a nivel JPA
                    session.enableFilter("tenantFilter").setParameter("tenantId", tenantId);

                    // 2. Seteo de variable de sesión para Row Level Security (RLS) en PostgreSQL
                    session.doWork(connection -> {
                        try (java.sql.Statement stmt = connection.createStatement()) {
                            stmt.execute("SET LOCAL app.current_organization_id = '" + tenantId + "'");
                        } catch (Exception e) {
                            // En entornos de test H2 las variables GUC de Postgres se ignoran limpiamente
                            log.trace("Variable RLS de Postgres no requerida en test H2: {}", e.getMessage());
                        }
                    });
                }
            } catch (Exception e) {
                log.trace("TenantFilter no pudo ser habilitado: {}", e.getMessage());
            }
        }
    }
}
