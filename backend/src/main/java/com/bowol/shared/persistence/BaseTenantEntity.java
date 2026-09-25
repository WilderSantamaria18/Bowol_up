package com.bowol.shared.persistence;

import com.bowol.shared.multitenancy.TenantContext;
import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;

import java.util.UUID;

@Getter
@Setter
@MappedSuperclass
@FilterDef(
        name = "tenantFilter",
        parameters = @ParamDef(name = "tenantId", type = UUID.class)
)
@Filter(name = "tenantFilter", condition = "organization_id = :tenantId")
public abstract class BaseTenantEntity extends BaseEntity {

    @Column(name = "organization_id", nullable = false, updatable = false)
    private UUID organizationId;

    @PrePersist
    public void prePersistTenant() {
        if (this.organizationId == null) {
            UUID currentTenant = TenantContext.getTenantId();
            if (currentTenant != null) {
                this.organizationId = currentTenant;
            }
        }
    }
}
