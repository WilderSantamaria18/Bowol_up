package com.bowol.businessprofile;

import com.bowol.businessprofile.dto.GoalItem;
import com.bowol.organization.OrganizationSize;
import com.bowol.shared.persistence.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "business_profiles", uniqueConstraints = {
    @UniqueConstraint(name = "uq_business_profiles_org", columnNames = {"organization_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessProfile extends BaseTenantEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "industry")
    private String industry;

    @Enumerated(EnumType.STRING)
    @Column(name = "size", length = 20)
    private OrganizationSize size;

    @Column(name = "market")
    private String market;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "goals")
    @Builder.Default
    private List<GoalItem> goals = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "problems")
    @Builder.Default
    private List<String> problems = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "tools")
    @Builder.Default
    private List<String> tools = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "competitors")
    @Builder.Default
    private List<String> competitors = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "channels")
    @Builder.Default
    private List<String> channels = new ArrayList<>();

    @Column(name = "digital_maturity")
    private Integer digitalMaturity;

    @Column(name = "ai_maturity")
    private Integer aiMaturity;

    @Column(name = "onboarding_completed_at")
    private Instant onboardingCompletedAt;
}
