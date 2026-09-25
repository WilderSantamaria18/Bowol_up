package com.bowol.ai.conversation.dto;

import com.bowol.ai.conversation.AIConversation;
import lombok.*;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDetailResponse {

    private AIConversationResponse conversation;
    private List<ConversationMessageResponse> messages;

    public static ConversationDetailResponse from(AIConversation conv) {
        if (conv == null) return null;
        List<ConversationMessageResponse> messageList = conv.getMessages() != null
                ? conv.getMessages().stream().map(ConversationMessageResponse::from).collect(Collectors.toList())
                : Collections.emptyList();

        return ConversationDetailResponse.builder()
                .conversation(AIConversationResponse.from(conv))
                .messages(messageList)
                .build();
    }
}
