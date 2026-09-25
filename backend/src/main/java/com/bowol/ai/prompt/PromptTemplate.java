package com.bowol.ai.prompt;

import com.bowol.ai.model.AIModel;
import com.bowol.ai.model.ResponseFormat;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PromptTemplate {

    private String id;
    private int version;
    private AIModel model;
    private ResponseFormat responseFormat;
    private double temperature;
    private String content;

    public String getKey() {
        return id + "-v" + version;
    }
}
