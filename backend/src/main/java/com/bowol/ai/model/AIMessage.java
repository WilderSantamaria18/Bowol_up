package com.bowol.ai.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIMessage {

    private AIMessageRole role;
    private String content;

    public static AIMessage system(String content) {
        return new AIMessage(AIMessageRole.SYSTEM, content);
    }

    public static AIMessage user(String content) {
        return new AIMessage(AIMessageRole.USER, content);
    }

    public static AIMessage assistant(String content) {
        return new AIMessage(AIMessageRole.ASSISTANT, content);
    }
}
