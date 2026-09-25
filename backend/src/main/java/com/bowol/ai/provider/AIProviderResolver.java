package com.bowol.ai.provider;

import com.bowol.ai.config.AIProperties;
import com.bowol.ai.model.AIModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class AIProviderResolver {

    private final List<AIProvider> providers;
    private final AIProperties aiProperties;

    public AIProvider resolve(AIModel model) {
        Map<String, AIProvider> providerMap = providers.stream()
                .collect(Collectors.toMap(AIProvider::name, Function.identity(), (p1, p2) -> p1));

        // 1. Check if model's native provider is available and supports the model
        if (model != null && model.getProvider() != null) {
            AIProvider nativeProvider = providerMap.get(model.getProvider().toLowerCase());
            if (nativeProvider != null && nativeProvider.isAvailable() && nativeProvider.supports(model)) {
                log.debug("AIProviderResolver: Seleccionado proveedor nativo '{}' para modelo '{}'", nativeProvider.name(), model.getCode());
                return nativeProvider;
            }
        }

        // 2. Check default provider from properties
        String defaultName = aiProperties.getDefaultProvider() != null ? aiProperties.getDefaultProvider().toLowerCase() : "mock";
        AIProvider defaultProvider = providerMap.get(defaultName);
        if (defaultProvider != null && defaultProvider.isAvailable()) {
            log.debug("AIProviderResolver: Seleccionado proveedor por defecto '{}'", defaultProvider.name());
            return defaultProvider;
        }

        // 3. Fallback to any available provider that supports the model
        Optional<AIProvider> availableSupporting = providers.stream()
                .filter(AIProvider::isAvailable)
                .filter(p -> p.supports(model))
                .findFirst();

        if (availableSupporting.isPresent()) {
            return availableSupporting.get();
        }

        // 4. Safe fallback to Mock provider
        AIProvider mock = providerMap.get("mock");
        if (mock != null) {
            log.warn("AIProviderResolver: Proveedores externos no disponibles. Fallback automático a MockAIProvider.");
            return mock;
        }

        throw new IllegalStateException("No hay ningún AIProvider disponible configurado en el sistema");
    }
}
