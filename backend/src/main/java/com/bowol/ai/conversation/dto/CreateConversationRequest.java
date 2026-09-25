package com.bowol.ai.conversation.dto;

import com.bowol.ai.conversation.ConversationContextType;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateConversationRequest {

    private ConversationContextType contextType;
    private UUID contextId;
    private String title;
    private String initialMessage;
}
