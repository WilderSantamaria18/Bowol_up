package com.bowol.organization.dto;

import com.bowol.organization.Organization;
import com.bowol.organization.OrganizationSize;
import com.bowol.organization.Role;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationResponse {
    private UUID id;
    private String name;
    private String slug;
    private String logoUrl;
    private String industry;
    private String country;
    private OrganizationSize size;
    private String website;
    private Integer memberCount;
    private Role role;
    private Instant createdAt;
    private Instant updatedAt;

    public static OrganizationResponse from(Organization org, Role role) {
        OrganizationResponse resp = new OrganizationResponse();
        resp.setId(org.getId());
        resp.setName(org.getName());
        resp.setSlug(org.getSlug());
        resp.setLogoUrl(org.getLogoUrl());
        resp.setIndustry(org.getIndustry());
        resp.setCountry(org.getCountry());
        resp.setSize(org.getSize());
        resp.setWebsite(org.getWebsite());
        resp.setMemberCount(org.getMemberCount());
        resp.setRole(role);
        resp.setCreatedAt(org.getCreatedAt());
        resp.setUpdatedAt(org.getUpdatedAt());
        return resp;
    }

    public static OrganizationResponse from(Organization org) {
        return from(org, null);
    }
}
