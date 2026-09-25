package com.bowol.ai.conversation;

import com.bowol.ai.conversation.dto.*;
import com.bowol.shared.dto.PageResponse;
import com.bowol.shared.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ai/conversations")
@RequiredArgsConstructor
public class AIConversationController {

    private final AIConversationService conversationService;

    @PostMapping
    public ResponseEntity<AIConversationResponse> createConversation(
            @Valid @RequestBody(required = false) CreateConversationRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        CreateConversationRequest req = request != null ? request : new CreateConversationRequest();
        AIConversationResponse response = conversationService.createConversation(principal, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<PageResponse<AIConversationResponse>> getConversations(
            @RequestParam(required = false) ConversationContextType contextType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal principal) {

        PageResponse<AIConversationResponse> response = conversationService.getConversations(principal, contextType, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConversationDetailResponse> getConversationDetail(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {

        ConversationDetailResponse response = conversationService.getConversationDetail(id, principal);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<ConversationMessageResponse> sendMessage(
            @PathVariable UUID id,
            @Valid @RequestBody SendMessageRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        ConversationMessageResponse response = conversationService.sendMessage(id, request, principal);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConversation(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {

        conversationService.deleteConversation(id, principal);
        return ResponseEntity.noContent().build();
    }
}
