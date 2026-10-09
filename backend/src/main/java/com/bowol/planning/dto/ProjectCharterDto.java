package com.bowol.planning.dto;

import com.bowol.planning.ProjectCharter;
import lombok.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectCharterDto {
    private UUID id;
    private UUID projectId;
    private String problemAddressed;
    private String smartObjective;
    private String measurableKpi;
    private String baselineValue;
    private String baselineUnit;
    private LocalDate baselineDate;
    private Boolean baselineIsProvisional;
    private String targetValue;
    private String targetUnit;
    private LocalDate targetDeadline;
    private String measurementSource;
    private Boolean ownerDecisionRequired;
    private String ownerDecisionDetails;
    private List<String> technicalDeliverables;
    private String expectedCommercialResult;
    private List<String> inScope;
    private List<String> outOfScope;
    private List<String> restrictions;
    private String updatedAt;

    public static ProjectCharterDto from(ProjectCharter charter) {
        if (charter == null) return null;
        return ProjectCharterDto.builder()
                .id(charter.getId())
                .projectId(charter.getProjectId())
                .problemAddressed(charter.getProblemAddressed())
                .smartObjective(charter.getSmartObjective())
                .measurableKpi(charter.getMeasurableKpi())
                .baselineValue(charter.getBaselineValue())
                .baselineUnit(charter.getBaselineUnit())
                .baselineDate(charter.getBaselineDate())
                .baselineIsProvisional(charter.getBaselineIsProvisional())
                .targetValue(charter.getTargetValue())
                .targetUnit(charter.getTargetUnit())
                .targetDeadline(charter.getTargetDeadline())
                .measurementSource(charter.getMeasurementSource())
                .ownerDecisionRequired(charter.getOwnerDecisionRequired())
                .ownerDecisionDetails(charter.getOwnerDecisionDetails())
                .technicalDeliverables(charter.getTechnicalDeliverables())
                .expectedCommercialResult(charter.getExpectedCommercialResult())
                .inScope(charter.getInScope())
                .outOfScope(charter.getOutOfScope())
                .restrictions(charter.getRestrictions())
                .updatedAt(charter.getUpdatedAt() != null ? charter.getUpdatedAt().toString() : (charter.getCreatedAt() != null ? charter.getCreatedAt().toString() : null))
                .build();
    }
}
