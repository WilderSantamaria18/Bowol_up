package com.bowol.businessprofile.dto;

import com.bowol.businessprofile.BusinessProfile;
import com.bowol.organization.OrganizationSize;
import lombok.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessProfileResponse {
    private UUID id;
    private UUID organizationId;
    private String industry;
    private OrganizationSize size;
    private String market;
    private List<GoalItem> goals;
    private List<String> problems;
    private List<String> tools;
    private List<String> competitors;
    private List<String> channels;
    private Integer digitalMaturity;
    private Integer aiMaturity;
    private Instant onboardingCompletedAt;
    private Instant createdAt;
    private Instant updatedAt;

    public static BusinessProfileResponse from(BusinessProfile profile) {
        return BusinessProfileResponse.builder()
                .id(profile.getId())
                .organizationId(profile.getOrganizationId())
                .industry(profile.getIndustry())
                .size(profile.getSize())
                .market(profile.getMarket())
                .goals(profile.getGoals() != null ? profile.getGoals() : List.of())
                .problems(profile.getProblems() != null ? profile.getProblems() : List.of())
                .tools(profile.getTools() != null ? profile.getTools() : List.of())
                .competitors(profile.getCompetitors() != null ? profile.getCompetitors() : List.of())
                .channels(profile.getChannels() != null ? profile.getChannels() : List.of())
                .digitalMaturity(profile.getDigitalMaturity())
                .aiMaturity(profile.getAiMaturity())
                .onboardingCompletedAt(profile.getOnboardingCompletedAt())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
}
