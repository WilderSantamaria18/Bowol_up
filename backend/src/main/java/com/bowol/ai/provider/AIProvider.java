package com.bowol.ai.provider;

import com.bowol.ai.model.*;

import java.util.List;
import java.util.stream.Stream;

public interface AIProvider {

    AIResponse complete(AIRequest request);

    Stream<AIChunk> stream(AIRequest request);

    List<Float> embed(String text);

    String name();

    boolean supports(AIModel model);

    boolean isAvailable();
}
