package com.bowol.ai.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIRequest {

    @Builder.Default
    private AIModel model = AIModel.GPT_4O_MINI;

    private String systemPrompt;

    @Builder.Default
    private List<AIMessage> messages = new ArrayList<>();

    @Builder.Default
    private Map<String, Object> variables = new HashMap<>();

    @Builder.Default
    private Double temperature = 0.7;

    @Builder.Default
    private Integer maxTokens = 2048;

    @Builder.Default
    private ResponseFormat format = ResponseFormat.TEXT;

    @Builder.Default
    private List<String> stopSequences = new ArrayList<>();
}
