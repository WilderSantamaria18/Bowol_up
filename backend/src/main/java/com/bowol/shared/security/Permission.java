package com.bowol.shared.security;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Permission {
    // Organization
    ORG_READ("organization.read"),
    ORG_UPDATE("organization.update"),
    ORG_DELETE("organization.delete"),
    ORG_MANAGE_BILLING("organization.manage_billing"),
    ORG_MANAGE_SETTINGS("organization.manage_settings"),

    // Members
    MEMBER_READ("member.read"),
    MEMBER_INVITE("member.invite"),
    MEMBER_UPDATE_ROLE("member.update_role"),
    MEMBER_REMOVE("member.remove"),

    // Business Profile
    BUSINESS_PROFILE_READ("business_profile.read"),
    BUSINESS_PROFILE_UPDATE("business_profile.update"),

    // Trends & Intelligence
    TREND_READ("trend.read"),
    TREND_SEARCH("trend.search"),
    TREND_MARK_RELEVANT("trend.mark_relevant"),
    TREND_DISMISS("trend.dismiss"),

    // Research
    RESEARCH_READ("research.read"),
    RESEARCH_CREATE("research.create"),
    RESEARCH_DELETE("research.delete"),

    // Strategy & SWOT
    SWOT_READ("swot.read"),
    SWOT_CREATE("swot.create"),
    SWOT_UPDATE("swot.update"),
    SWOT_DELETE("swot.delete"),

    // Opportunity
    OPPORTUNITY_READ("opportunity.read"),
    OPPORTUNITY_CREATE("opportunity.create"),
    OPPORTUNITY_UPDATE("opportunity.update"),
    OPPORTUNITY_DELETE("opportunity.delete"),
    OPPORTUNITY_CONVERT("opportunity.convert"),

    // Hypothesis & Experiment
    HYPOTHESIS_READ("hypothesis.read"),
    HYPOTHESIS_CREATE("hypothesis.create"),
    HYPOTHESIS_UPDATE("hypothesis.update"),
    HYPOTHESIS_DELETE("hypothesis.delete"),
    HYPOTHESIS_VALIDATE("hypothesis.validate"),

    EXPERIMENT_READ("experiment.read"),
    EXPERIMENT_CREATE("experiment.create"),
    EXPERIMENT_UPDATE("experiment.update"),
    EXPERIMENT_DELETE("experiment.delete"),

    // Execution
    PROJECT_READ("project.read"),
    PROJECT_CREATE("project.create"),
    PROJECT_UPDATE("project.update"),
    PROJECT_DELETE("project.delete"),
    PROJECT_MANAGE_MEMBERS("project.manage_members"),

    SPRINT_READ("sprint.read"),
    SPRINT_CREATE("sprint.create"),
    SPRINT_UPDATE("sprint.update"),
    SPRINT_DELETE("sprint.delete"),
    SPRINT_START("sprint.start"),
    SPRINT_COMPLETE("sprint.complete"),

    TASK_READ("task.read"),
    TASK_CREATE("task.create"),
    TASK_UPDATE("task.update"),
    TASK_DELETE("task.delete"),
    TASK_ASSIGN("task.assign"),
    TASK_REORDER("task.reorder"),

    // Integrations & Subscriptions
    INTEGRATION_READ("integration.read"),
    INTEGRATION_CONNECT("integration.connect"),
    INTEGRATION_DISCONNECT("integration.disconnect"),
    INTEGRATION_SYNC("integration.sync"),

    SUBSCRIPTION_READ("subscription.read"),
    SUBSCRIPTION_MANAGE("subscription.manage"),
    SUBSCRIPTION_CANCEL("subscription.cancel"),

    // Audit & AI
    AUDIT_LOG_READ("audit_log.read"),
    AI_USE("ai.use"),
    AI_VIEW_USAGE("ai.view_usage");

    private final String value;
}
