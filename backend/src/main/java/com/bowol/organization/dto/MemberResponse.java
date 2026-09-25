package com.bowol.organization.dto;

import com.bowol.organization.MemberStatus;
import com.bowol.organization.OrganizationMember;
import com.bowol.organization.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberResponse {
    private Long id;
    private UUID userId;
    private String name;
    private String email;
    private String avatarUrl;
    private Role role;
    private MemberStatus status;
    private Instant joinedAt;

    public static MemberResponse from(OrganizationMember member) {
        return MemberResponse.builder()
                .id(member.getId())
                .userId(member.getUser().getId())
                .name(member.getUser().getName())
                .email(member.getUser().getEmail())
                .avatarUrl(member.getUser().getAvatarUrl())
                .role(member.getRole())
                .status(member.getStatus())
                .joinedAt(member.getJoinedAt())
                .build();
    }
}
