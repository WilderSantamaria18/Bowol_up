package com.bowol.organization.dto;

import com.bowol.organization.OrganizationSize;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOrganizationRequest {

    @Size(min = 2, max = 100, message = "El nombre de la organización debe tener entre 2 y 100 caracteres")
    private String name;

    private String logoUrl;

    @Size(max = 100, message = "La industria no puede exceder 100 caracteres")
    private String industry;

    @Size(min = 2, max = 2, message = "El código de país debe tener exactamente 2 caracteres ISO")
    private String country;

    private OrganizationSize size;

    private String website;
}
