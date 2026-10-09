package com.bowol.planning.dto;

import com.bowol.planning.CapacityMemberAllocation;
import com.bowol.planning.CapacityPlan;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CapacityPlanDto {
    private UUID id;
    private String periodLabel;
    private BigDecimal bufferPercentage;
    @Builder.Default
    private List<MemberAllocationDto> members = new ArrayList<>();

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MemberAllocationDto {
        private String id;
        private UUID userId;
        private String name;
        private String role;
        private BigDecimal availableHours;
        private BigDecimal assignedHours;

        public static MemberAllocationDto from(CapacityMemberAllocation alloc) {
            if (alloc == null) return null;
            return MemberAllocationDto.builder()
                    .id(String.valueOf(alloc.getId()))
                    .userId(alloc.getUserId())
                    .name(alloc.getMemberName())
                    .role(alloc.getMemberRole())
                    .availableHours(alloc.getAvailableHours())
                    .assignedHours(alloc.getAssignedHours())
                    .build();
        }
    }

    public static CapacityPlanDto from(CapacityPlan plan) {
        if (plan == null) return null;
        List<MemberAllocationDto> memberDtos = plan.getMemberAllocations() != null
                ? plan.getMemberAllocations().stream().map(MemberAllocationDto::from).collect(Collectors.toList())
                : new ArrayList<>();

        return CapacityPlanDto.builder()
                .id(plan.getId())
                .periodLabel(plan.getPeriodLabel())
                .bufferPercentage(plan.getBufferPercentage())
                .members(memberDtos)
                .build();
    }
}
