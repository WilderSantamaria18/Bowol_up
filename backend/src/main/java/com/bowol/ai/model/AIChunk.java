package com.bowol.ai.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIChunk {

    private String delta;
    private boolean isLast;
    private Integer tokensUsed;
}
