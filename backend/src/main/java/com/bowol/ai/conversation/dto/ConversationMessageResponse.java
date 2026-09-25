package com.bowol.ai.conversation.dto;

import com.bowol.ai.conversation.ConversationMessage;
import com.bowol.ai.model.AIMessageRole;
import lombok.*;

import java.time.Instant;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationMessageResponse {

    private Long id;
    private AIMessageRole role;
    private String content;
    private Integer tokensUsed;
    private Map<String, Object> metadata;
    private Instant createdAt;

    public static ConversationMessageResponse from(ConversationMessage msg) {
        if (msg == null) return null;
        return ConversationMessageResponse.builder()
                .id(msg.getId())
                .role(msg.getRole())
                .content(msg.getContent())
                .tokensUsed(msg.getTokensUsed())
                .metadata(msg.getMetadata())
                .createdAt(msg.getCreatedAt())
                .build();
    }
}
