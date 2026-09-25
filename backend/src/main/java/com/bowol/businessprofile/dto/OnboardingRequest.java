package com.bowol.businessprofile.dto;

import com.bowol.organization.OrganizationSize;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OnboardingRequest {

    @NotBlank(message = "La industria es obligatoria en el proceso de onboarding")
    private String industry;

    private OrganizationSize size;

    private String market;

    private List<GoalItem> goals;

    private List<String> problems;

    private List<String> tools;

    private List<String> competitors;

    private List<String> channels;

    @Min(value = 0, message = "La madurez digital debe ser entre 0 y 100")
    @Max(value = 100, message = "La madurez digital debe ser entre 0 y 100")
    private Integer digitalMaturity;

    @Min(value = 0, message = "La madurez de IA debe ser entre 0 y 100")
    @Max(value = 100, message = "La madurez de IA debe ser entre 0 y 100")
    private Integer aiMaturity;
}
