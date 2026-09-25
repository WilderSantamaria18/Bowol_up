package com.bowol.ai.conversation;

import com.bowol.ai.audit.AIAuditService;
import com.bowol.ai.context.StrategicContextService;
import com.bowol.ai.conversation.dto.*;
import com.bowol.ai.model.*;
import com.bowol.ai.provider.AIProvider;
import com.bowol.ai.provider.AIProviderResolver;
import com.bowol.shared.dto.PageResponse;
import com.bowol.shared.exception.ForbiddenException;
import com.bowol.shared.exception.NotFoundException;
import com.bowol.shared.multitenancy.TenantContext;
import com.bowol.shared.security.UserPrincipal;
import com.bowol.trend.Trend;
import com.bowol.trend.TrendRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIConversationService {

    private final AIConversationRepository conversationRepository;
    private final ConversationMessageRepository messageRepository;
    private final StrategicContextService strategicContextService;
    private final AIProviderResolver aiProviderResolver;
    private final AIAuditService aiAuditService;
    private final TrendRepository trendRepository;

    @Transactional
    public AIConversationResponse createConversation(UserPrincipal principal, CreateConversationRequest request) {
        UUID orgId = resolveOrganizationId(principal);
        UUID userId = resolveUserId(principal);

        ConversationContextType contextType = request.getContextType() != null
                ? request.getContextType()
                : ConversationContextType.GENERAL;

        String title = request.getTitle();
        if (title == null || title.isBlank()) {
            if (contextType == ConversationContextType.TREND && request.getContextId() != null) {
                Optional<Trend> trendOpt = trendRepository.findById(request.getContextId());
                title = trendOpt.map(t -> "Estrategia: " + t.getTitle()).orElse("Análisis de Tendencia");
            } else {
                title = "Nueva Conversación";
            }
        }

        AIConversation conversation = AIConversation.builder()
                .organizationId(orgId)
                .userId(userId)
                .contextType(contextType)
                .contextId(request.getContextId())
                .title(title)
                .build();

        AIConversation saved = conversationRepository.save(conversation);
        log.info("Conversación IA creada: id={}, org={}, contextType={}", saved.getId(), orgId, contextType);

        if (request.getInitialMessage() != null && !request.getInitialMessage().isBlank()) {
            sendMessage(saved.getId(), new SendMessageRequest(request.getInitialMessage()), principal);
            // Refresh to reflect initial message
            saved = conversationRepository.findById(saved.getId()).orElse(saved);
        }

        return AIConversationResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<AIConversationResponse> getConversations(
            UserPrincipal principal,
            ConversationContextType contextType,
            int page,
            int size) {

        UUID orgId = resolveOrganizationId(principal);
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("updatedAt").descending());

        Page<AIConversation> pageResult;
        if (contextType != null) {
            pageResult = conversationRepository.findByOrganizationIdAndContextTypeOrderByUpdatedAtDesc(orgId, contextType, pageRequest);
        } else {
            pageResult = conversationRepository.findByOrganizationIdOrderByUpdatedAtDesc(orgId, pageRequest);
        }

        List<AIConversationResponse> dtoList = pageResult.getContent().stream()
                .map(AIConversationResponse::from)
                .collect(Collectors.toList());

        Page<AIConversationResponse> dtoPage = new PageImpl<>(dtoList, pageRequest, pageResult.getTotalElements());
        return PageResponse.of(dtoPage);
    }

    @Transactional(readOnly = true)
    public ConversationDetailResponse getConversationDetail(UUID conversationId, UserPrincipal principal) {
        UUID orgId = resolveOrganizationId(principal);

        AIConversation conversation = conversationRepository.findByIdAndOrganizationId(conversationId, orgId)
                .orElseThrow(() -> new NotFoundException("CONVERSACION_NO_ENCONTRADA", "No se encontró la conversación solicitada"));

        List<ConversationMessage> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        conversation.setMessages(messages);

        return ConversationDetailResponse.from(conversation);
    }

    @Transactional
    public ConversationMessageResponse sendMessage(UUID conversationId, SendMessageRequest request, UserPrincipal principal) {
        UUID orgId = resolveOrganizationId(principal);
        UUID userId = resolveUserId(principal);

        AIConversation conversation = conversationRepository.findByIdAndOrganizationId(conversationId, orgId)
                .orElseThrow(() -> new NotFoundException("CONVERSACION_NO_ENCONTRADA", "No se encontró la conversación solicitada"));

        // 1. Persist User Message
        ConversationMessage userMsg = ConversationMessage.builder()
                .conversation(conversation)
                .role(AIMessageRole.USER)
                .content(request.getContent().trim())
                .metadata(new HashMap<>())
                .build();
        messageRepository.save(userMsg);

        // 2. Build Grounded Context
        Trend trend = null;
        if (conversation.getContextType() == ConversationContextType.TREND && conversation.getContextId() != null) {
            trend = trendRepository.findById(conversation.getContextId()).orElse(null);
        }

        String systemPrompt = strategicContextService.buildConversationSystemPrompt(orgId, conversation.getContextType(), trend);

        // 3. Assemble message history (up to last 10 messages)
        List<ConversationMessage> allMessages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        int fromIndex = Math.max(0, allMessages.size() - 10);
        List<ConversationMessage> recentMessages = allMessages.subList(fromIndex, allMessages.size());

        List<AIMessage> promptMessages = new ArrayList<>();
        for (ConversationMessage msg : recentMessages) {
            if (msg.getRole() == AIMessageRole.USER) {
                promptMessages.add(AIMessage.user(msg.getContent()));
            } else if (msg.getRole() == AIMessageRole.ASSISTANT) {
                promptMessages.add(AIMessage.assistant(msg.getContent()));
            } else if (msg.getRole() == AIMessageRole.SYSTEM) {
                promptMessages.add(AIMessage.system(msg.getContent()));
            }
        }

        // 4. Resolve Provider & Complete
        AIModel model = AIModel.GPT_4O_MINI;
        AIRequest aiRequest = AIRequest.builder()
                .model(model)
                .systemPrompt(systemPrompt)
                .messages(promptMessages)
                .temperature(0.5)
                .format(ResponseFormat.TEXT)
                .build();

        AIProvider provider = aiProviderResolver.resolve(model);
        AIResponse aiResponse = provider.complete(aiRequest);

        int promptTokens = aiResponse.getPromptTokens() != null ? aiResponse.getPromptTokens() : 0;
        int completionTokens = aiResponse.getCompletionTokens() != null ? aiResponse.getCompletionTokens() : 0;
        int totalTokens = promptTokens + completionTokens;

        // 5. Audit AI Usage
        Map<String, Object> auditMetadata = new HashMap<>();
        auditMetadata.put("conversation_id", conversationId.toString());
        auditMetadata.put("context_type", conversation.getContextType().name());
        if (conversation.getContextId() != null) {
            auditMetadata.put("context_id", conversation.getContextId().toString());
        }
        aiAuditService.logUsage(orgId, userId, "AI_CONVERSATION_MESSAGE", aiResponse, auditMetadata);

        // 6. Persist Assistant Message
        Map<String, Object> messageMeta = new HashMap<>();
        messageMeta.put("provider", aiResponse.getProvider());
        messageMeta.put("model", aiResponse.getModel());
        if (aiResponse.getCostUsd() != null) {
            messageMeta.put("cost_usd", aiResponse.getCostUsd().toPlainString());
        }

        ConversationMessage assistantMsg = ConversationMessage.builder()
                .conversation(conversation)
                .role(AIMessageRole.ASSISTANT)
                .content(aiResponse.getContent())
                .tokensUsed(totalTokens)
                .metadata(messageMeta)
                .build();

        ConversationMessage savedAssistant = messageRepository.save(assistantMsg);

        // 7. Update conversation title if generic or empty
        if (conversation.getTitle() == null || conversation.getTitle().equalsIgnoreCase("Nueva Conversación")) {
            String trimmed = request.getContent().trim();
            String autoTitle = trimmed.length() > 50 ? trimmed.substring(0, 47) + "..." : trimmed;
            conversation.setTitle(autoTitle);
        }
        conversation.setUpdatedAt(Instant.now());
        conversationRepository.save(conversation);

        return ConversationMessageResponse.from(savedAssistant);
    }

    @Transactional
    public void deleteConversation(UUID conversationId, UserPrincipal principal) {
        UUID orgId = resolveOrganizationId(principal);
        AIConversation conversation = conversationRepository.findByIdAndOrganizationId(conversationId, orgId)
                .orElseThrow(() -> new NotFoundException("CONVERSACION_NO_ENCONTRADA", "No se encontró la conversación solicitada"));

        conversationRepository.delete(conversation);
        log.info("Conversación IA eliminada: id={}, org={}", conversationId, orgId);
    }

    private UUID resolveOrganizationId(UserPrincipal principal) {
        if (principal != null && principal.getOrganizationId() != null) {
            return principal.getOrganizationId();
        }
        UUID tenantId = TenantContext.getTenantId();
        if (tenantId != null) {
            return tenantId;
        }
        throw new ForbiddenException("TENANT_REQUERIDO", "Se requiere una organización activa para gestionar conversaciones");
    }

    private UUID resolveUserId(UserPrincipal principal) {
        if (principal != null && principal.getId() != null) {
            return principal.getId();
        }
        throw new ForbiddenException("USUARIO_REQUERIDO", "Se requiere un usuario autenticado para interactuar con el asistente");
    }
}
