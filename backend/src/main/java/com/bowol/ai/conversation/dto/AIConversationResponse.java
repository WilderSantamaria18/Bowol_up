package com.bowol.ai.conversation.dto;

import com.bowol.ai.conversation.AIConversation;
import com.bowol.ai.conversation.ConversationContextType;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIConversationResponse {

    private UUID id;
    private UUID organizationId;
    private UUID userId;
    private ConversationContextType contextType;
    private UUID contextId;
    private String title;
    private Instant createdAt;
    private Instant updatedAt;
    private int messageCount;
    private String lastMessage;

    public static AIConversationResponse from(AIConversation conv) {
        if (conv == null) return null;
        int count = conv.getMessages() != null ? conv.getMessages().size() : 0;
        String last = null;
        if (conv.getMessages() != null && !conv.getMessages().isEmpty()) {
            last = conv.getMessages().get(conv.getMessages().size() - 1).getContent();
        }

        return AIConversationResponse.builder()
                .id(conv.getId())
                .organizationId(conv.getOrganizationId())
                .userId(conv.getUserId())
                .contextType(conv.getContextType())
                .contextId(conv.getContextId())
                .title(conv.getTitle())
                .createdAt(conv.getCreatedAt())
                .updatedAt(conv.getUpdatedAt())
                .messageCount(count)
                .lastMessage(last)
                .build();
    }
}
