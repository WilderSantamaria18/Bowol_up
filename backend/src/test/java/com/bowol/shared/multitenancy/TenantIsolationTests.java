package com.bowol.shared.multitenancy;

import com.bowol.organization.Organization;
import com.bowol.organization.OrganizationRepository;
import com.bowol.project.Project;
import com.bowol.project.ProjectRepository;
import com.bowol.project.ProjectStatus;
import jakarta.persistence.EntityManager;
import org.hibernate.Session;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("Multi-Tenancy Hibernate Filter Isolation Tests")
class TenantIsolationTests {

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private EntityManager entityManager;

    private Organization orgA;
    private Organization orgB;

    @BeforeEach
    void setUp() {
        TenantContext.clear();

        orgA = organizationRepository.save(Organization.builder()
                .name("Tenant Alpha Inc")
                .slug("tenant-alpha-" + UUID.randomUUID())
                .build());

        orgB = organizationRepository.save(Organization.builder()
                .name("Tenant Beta Corp")
                .slug("tenant-beta-" + UUID.randomUUID())
                .build());
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    private void applyTenant(UUID tenantId) {
        TenantContext.setTenantId(tenantId);
        Session session = entityManager.unwrap(Session.class);
        if (session != null) {
            session.enableFilter("tenantFilter").setParameter("tenantId", tenantId);
        }
    }

    @Test
    @DisplayName("Aislamiento Estricto: Organización A no ve los proyectos de Organización B")
    void shouldIsolateProjectsBetweenTenants() {
        // 1. Guardar proyecto en Organización A
        applyTenant(orgA.getId());
        Project projectA = projectRepository.save(Project.builder()
                .name("Proyecto Confidencial Alpha")
                .status(ProjectStatus.ACTIVE)
                .build());

        entityManager.flush();
        entityManager.clear();

        // 2. Consultar en contexto de Organización A
        applyTenant(orgA.getId());
        List<Project> projectsInA = projectRepository.findAll();
        assertThat(projectsInA).hasSize(1);
        assertEquals("Proyecto Confidencial Alpha", projectsInA.get(0).getName());
        assertEquals(orgA.getId(), projectsInA.get(0).getOrganizationId());

        entityManager.clear();

        // 3. Cambiar a contexto de Organización B
        applyTenant(orgB.getId());

        // Aislamiento de lista: findAll() debe ser vacío
        List<Project> projectsInB = projectRepository.findAll();
        assertThat(projectsInB).isEmpty();

        // Aislamiento por ID directo: findById(projectA.getId()) debe ser empty (previene enumeración de recursos)
        Optional<Project> directLookup = projectRepository.findById(projectA.getId());
        assertFalse(directLookup.isPresent(), "Un tenant no debe poder acceder a recursos de otro tenant por ID directo");

        // 4. Guardar proyecto en Organización B
        Project projectB = projectRepository.save(Project.builder()
                .name("Proyecto Beta Público")
                .status(ProjectStatus.PLANNING)
                .build());

        entityManager.flush();
        entityManager.clear();

        // 5. Consultar en Organización B -> solo debe existir Proyecto B
        applyTenant(orgB.getId());
        List<Project> finalB = projectRepository.findAll();
        assertThat(finalB).hasSize(1);
        assertEquals("Proyecto Beta Público", finalB.get(0).getName());
        assertEquals(orgB.getId(), finalB.get(0).getOrganizationId());

        entityManager.clear();

        // 6. Regresar a Organización A -> solo debe existir Proyecto A
        applyTenant(orgA.getId());
        List<Project> finalA = projectRepository.findAll();
        assertThat(finalA).hasSize(1);
        assertEquals("Proyecto Confidencial Alpha", finalA.get(0).getName());
    }

    @Test
    @DisplayName("Inyección automática: BaseTenantEntity autoasigna organization_id desde TenantContext en prePersist")
    void shouldAutoAssignOrganizationIdFromContext() {
        applyTenant(orgA.getId());

        Project autoProject = Project.builder()
                .name("Auto-tenant Project")
                .build();

        assertNull(autoProject.getOrganizationId());

        Project saved = projectRepository.save(autoProject);
        entityManager.flush();

        assertNotNull(saved.getOrganizationId());
        assertEquals(orgA.getId(), saved.getOrganizationId());
    }
}
