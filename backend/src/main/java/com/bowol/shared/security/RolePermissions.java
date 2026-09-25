package com.bowol.shared.security;

import com.bowol.organization.Role;

import java.util.*;
import java.util.stream.Collectors;

public final class RolePermissions {

    private static final Map<Role, Set<Permission>> MAP = new EnumMap<>(Role.class);

    static {
        // OWNER: acceso completo absoluto
        Set<Permission> ownerPerms = EnumSet.allOf(Permission.class);
        MAP.put(Role.OWNER, Collections.unmodifiableSet(ownerPerms));
        MAP.put(Role.PLATFORM_ADMIN, Collections.unmodifiableSet(ownerPerms));

        // ADMIN: administra todo excepto eliminar la org o cancelar billing directo
        Set<Permission> adminPerms = EnumSet.allOf(Permission.class);
        adminPerms.remove(Permission.ORG_DELETE);
        adminPerms.remove(Permission.ORG_MANAGE_BILLING);
        adminPerms.remove(Permission.SUBSCRIPTION_CANCEL);
        MAP.put(Role.ADMIN, Collections.unmodifiableSet(adminPerms));

        // MANAGER / STRATEGIST: lidera proyectos, investigación, hipótesis y sprints
        Set<Permission> managerPerms = EnumSet.of(
                Permission.ORG_READ,
                Permission.MEMBER_READ,
                Permission.BUSINESS_PROFILE_READ,
                Permission.TREND_READ, Permission.TREND_SEARCH, Permission.TREND_MARK_RELEVANT, Permission.TREND_DISMISS,
                Permission.RESEARCH_READ, Permission.RESEARCH_CREATE, Permission.RESEARCH_DELETE,
                Permission.SWOT_READ, Permission.SWOT_CREATE, Permission.SWOT_UPDATE, Permission.SWOT_DELETE,
                Permission.OPPORTUNITY_READ, Permission.OPPORTUNITY_CREATE, Permission.OPPORTUNITY_UPDATE, Permission.OPPORTUNITY_DELETE, Permission.OPPORTUNITY_CONVERT,
                Permission.HYPOTHESIS_READ, Permission.HYPOTHESIS_CREATE, Permission.HYPOTHESIS_UPDATE, Permission.HYPOTHESIS_DELETE, Permission.HYPOTHESIS_VALIDATE,
                Permission.EXPERIMENT_READ, Permission.EXPERIMENT_CREATE, Permission.EXPERIMENT_UPDATE, Permission.EXPERIMENT_DELETE,
                Permission.PROJECT_READ, Permission.PROJECT_CREATE, Permission.PROJECT_UPDATE, Permission.PROJECT_DELETE, Permission.PROJECT_MANAGE_MEMBERS,
                Permission.SPRINT_READ, Permission.SPRINT_CREATE, Permission.SPRINT_UPDATE, Permission.SPRINT_DELETE, Permission.SPRINT_START, Permission.SPRINT_COMPLETE,
                Permission.TASK_READ, Permission.TASK_CREATE, Permission.TASK_UPDATE, Permission.TASK_DELETE, Permission.TASK_ASSIGN, Permission.TASK_REORDER,
                Permission.INTEGRATION_READ,
                Permission.SUBSCRIPTION_READ,
                Permission.AUDIT_LOG_READ,
                Permission.AI_USE, Permission.AI_VIEW_USAGE
        );
        MAP.put(Role.MANAGER, Collections.unmodifiableSet(managerPerms));
        MAP.put(Role.STRATEGIST, Collections.unmodifiableSet(managerPerms));

        // MEMBER / EXECUTOR: colaborador en tareas y ejecución
        Set<Permission> memberPerms = EnumSet.of(
                Permission.ORG_READ,
                Permission.MEMBER_READ,
                Permission.BUSINESS_PROFILE_READ,
                Permission.TREND_READ, Permission.TREND_SEARCH, Permission.TREND_MARK_RELEVANT,
                Permission.RESEARCH_READ,
                Permission.SWOT_READ,
                Permission.OPPORTUNITY_READ,
                Permission.HYPOTHESIS_READ,
                Permission.EXPERIMENT_READ,
                Permission.PROJECT_READ,
                Permission.SPRINT_READ,
                Permission.TASK_READ, Permission.TASK_CREATE, Permission.TASK_UPDATE, Permission.TASK_REORDER,
                Permission.AI_USE
        );
        MAP.put(Role.MEMBER, Collections.unmodifiableSet(memberPerms));
        MAP.put(Role.EXECUTOR, Collections.unmodifiableSet(memberPerms));

        // VIEWER: solo lectura
        Set<Permission> viewerPerms = EnumSet.of(
                Permission.ORG_READ,
                Permission.MEMBER_READ,
                Permission.BUSINESS_PROFILE_READ,
                Permission.TREND_READ, Permission.TREND_SEARCH,
                Permission.RESEARCH_READ,
                Permission.SWOT_READ,
                Permission.OPPORTUNITY_READ,
                Permission.HYPOTHESIS_READ,
                Permission.EXPERIMENT_READ,
                Permission.PROJECT_READ,
                Permission.SPRINT_READ,
                Permission.TASK_READ
        );
        MAP.put(Role.VIEWER, Collections.unmodifiableSet(viewerPerms));
    }

    public static Set<Permission> getPermissions(Role role) {
        return MAP.getOrDefault(role, Collections.emptySet());
    }

    public static Set<String> getPermissionValues(Role role) {
        return getPermissions(role).stream()
                .map(Permission::getValue)
                .collect(Collectors.toSet());
    }

    private RolePermissions() {}
}
