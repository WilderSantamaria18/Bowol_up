package com.bowol.project;

import com.bowol.project.dto.*;
import com.bowol.shared.dto.PageResponse;
import com.bowol.shared.security.UserPrincipal;
import com.bowol.sprint.SprintService;
import com.bowol.sprint.dto.CreateSprintRequest;
import com.bowol.sprint.dto.SprintResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final SprintService sprintService;
    private final com.bowol.sprint.AgileMetricsService agileMetricsService;
    private final com.bowol.task.TaskService taskService;

    @PostMapping("/{projectId}/decompose")
    public ResponseEntity<com.bowol.task.dto.DecomposeProjectResponse> decomposeProject(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal UserPrincipal principal) {
        com.bowol.task.dto.DecomposeProjectResponse response = taskService.decomposeProject(projectId, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<PageResponse<ProjectResponse>> getProjects(
            @RequestParam(required = false) ProjectStatus status,
            @PageableDefault(size = 20) Pageable pageable,
            @AuthenticationPrincipal UserPrincipal principal) {
        PageResponse<ProjectResponse> response = projectService.getProjects(principal, status, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProjectById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        ProjectResponse response = projectService.getProjectById(id, principal);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(
            @Valid @RequestBody CreateProjectRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ProjectResponse response = projectService.createProject(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable UUID id,
            @RequestBody UpdateProjectRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ProjectResponse response = projectService.updateProject(id, request, principal);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        projectService.deleteProject(id, principal);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<ProjectMemberResponse>> getProjectMembers(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<ProjectMemberResponse> response = projectService.getProjectMembers(id, principal);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<ProjectMemberResponse> addProjectMember(
            @PathVariable UUID id,
            @Valid @RequestBody AddProjectMemberRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ProjectMemberResponse response = projectService.addProjectMember(id, request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<Void> removeProjectMember(
            @PathVariable UUID id,
            @PathVariable UUID userId,
            @AuthenticationPrincipal UserPrincipal principal) {
        projectService.removeProjectMember(id, userId, principal);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{projectId}/sprints")
    public ResponseEntity<List<SprintResponse>> getProjectSprints(
            @PathVariable UUID projectId,
            @RequestParam(required = false) com.bowol.sprint.SprintStatus status,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<SprintResponse> response = sprintService.getSprintsByProject(projectId, status, principal);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{projectId}/sprints")
    public ResponseEntity<SprintResponse> createProjectSprint(
            @PathVariable UUID projectId,
            @Valid @RequestBody CreateSprintRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        SprintResponse response = sprintService.createSprint(projectId, request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{projectId}/sprints/ai-plan")
    public ResponseEntity<com.bowol.sprint.dto.AiSprintPlanResponse> planSprintWithAi(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal UserPrincipal principal) {
        com.bowol.sprint.dto.AiSprintPlanResponse response = sprintService.planSprintWithAi(projectId, principal);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/velocity")
    public ResponseEntity<com.bowol.sprint.dto.ProjectVelocityResponse> getProjectVelocity(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        com.bowol.sprint.dto.ProjectVelocityResponse response = agileMetricsService.getProjectVelocity(id, principal);
        return ResponseEntity.ok(response);
    }
}
