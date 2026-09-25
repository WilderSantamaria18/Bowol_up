package com.bowol.task;

import com.bowol.shared.security.UserPrincipal;
import com.bowol.task.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getTasks(
            @RequestParam UUID projectId,
            @RequestParam(required = false) UUID sprintId,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) UUID assigneeId,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<TaskResponse> response = taskService.getTasks(projectId, sprintId, status, assigneeId, principal);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/board")
    public ResponseEntity<Map<String, List<TaskResponse>>> getBoard(
            @RequestParam UUID projectId,
            @RequestParam(required = false) UUID sprintId,
            @AuthenticationPrincipal UserPrincipal principal) {
        Map<String, List<TaskResponse>> response = taskService.getBoard(projectId, sprintId, principal);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        TaskResponse response = taskService.getTaskById(id, principal);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @Valid @RequestBody CreateTaskRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        TaskResponse response = taskService.createTask(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable UUID id,
            @RequestBody UpdateTaskRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        TaskResponse response = taskService.updateTask(id, request, principal);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskResponse> updateTaskStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTaskStatusRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        TaskResponse response = taskService.updateTaskStatus(id, request, principal);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<TaskResponse> assignTask(
            @PathVariable UUID id,
            @RequestBody AssignTaskRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        TaskResponse response = taskService.assignTask(id, request, principal);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reorder")
    public ResponseEntity<Void> reorderTasks(
            @Valid @RequestBody ReorderTasksRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        taskService.reorderTasks(request, principal);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/decompose/{projectId}")
    public ResponseEntity<DecomposeProjectResponse> decomposeProject(
            @PathVariable UUID projectId,
            @AuthenticationPrincipal UserPrincipal principal) {
        DecomposeProjectResponse response = taskService.decomposeProject(projectId, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        taskService.deleteTask(id, principal);
        return ResponseEntity.noContent().build();
    }
}
