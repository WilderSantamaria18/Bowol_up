import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X,
  Send,
  Sparkles,
  PlusCircle,
  MessageSquare,
  Compass,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCopilot } from '../context/CopilotContext';
import { copilotService } from '../services/copilotService';
import { MessageItem } from './MessageItem';
import { AIConversation, ConversationContextType } from '../types';

export const CopilotDrawer: React.FC = () => {
  const {
    isOpen,
    closeCopilot,
    activeConversationId,
    setActiveConversationId,
    activeContext,
  } = useCopilot();

  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [inputMessage, setInputMessage] = useState<string>('');
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // 1. Fetch conversations list
  const { data: convsPage } = useQuery({
    queryKey: ['ai-conversations'],
    queryFn: () => copilotService.getConversations(undefined, 0, 30),
    enabled: isOpen,
  });

  const conversations: AIConversation[] = convsPage?.items || [];

  // 2. Fetch current conversation detail
  const {
    data: activeConvDetail,
    isLoading: isLoadingMessages,
    refetch: refetchActiveConv,
  } = useQuery({
    queryKey: ['ai-conversation', activeConversationId],
    queryFn: () => (activeConversationId ? copilotService.getConversation(activeConversationId) : null),
    enabled: isOpen && !!activeConversationId,
  });

  // 3. Create conversation mutation
  const createMutation = useMutation({
    mutationFn: (payload: {
      contextType?: ConversationContextType;
      contextId?: string;
      title?: string;
      initialMessage?: string;
    }) => copilotService.createConversation(payload),
    onSuccess: (newConv) => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      if (newConv?.id) {
        setActiveConversationId(newConv.id);
      }
    },
  });

  // 4. Send message mutation
  const sendMutation = useMutation({
    mutationFn: ({ convId, content }: { convId: string; content: string }) =>
      copilotService.sendMessage(convId, { content }),
    onSuccess: () => {
      refetchActiveConv();
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
    },
  });

  // 5. Delete conversation mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => copilotService.deleteConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      setActiveConversationId(null);
    },
  });

  // Automatically select or create conversation when opened
  useEffect(() => {
    if (isOpen) {
      if (activeContext?.contextId && !activeConversationId) {
        createMutation.mutate({
          contextType: activeContext.contextType || 'GENERAL',
          contextId: activeContext.contextId,
          title: activeContext.title,
          initialMessage: activeContext.initialMessage,
        });
      } else if (!activeConversationId && conversations.length > 0) {
        setActiveConversationId(conversations[0].id);
      }
    }
  }, [isOpen, activeContext, conversations, activeConversationId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConvDetail?.messages, sendMutation.isPending]);

  if (!isOpen) return null;

  const handleStartNewConversation = () => {
    createMutation.mutate({
      contextType: 'GENERAL',
      title: 'Nueva Conversación',
    });
    setShowHistory(false);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    if (!activeConversationId) {
      // Create first and send
      await createMutation.mutateAsync({
        contextType: activeContext?.contextType || 'GENERAL',
        contextId: activeContext?.contextId,
        title: activeContext?.title,
        initialMessage: text,
      });
      setInputMessage('');
      return;
    }

    setInputMessage('');
    sendMutation.mutate({ convId: activeConversationId, content: text });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const currentConv = activeConvDetail?.conversation;
  const messages = activeConvDetail?.messages || [];

  const suggestionPrompts = [
    'Evaluar viabilidad técnica para mi empresa',
    '¿Qué oportunidades de automatización detectas?',
    'Diseñar hipótesis de experimento para el próximo sprint',
    'Analizar amenazas competitivas y barreras de entrada',
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl h-full bg-[#0D0E12] border-l border-white/[0.08] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-white/[0.08] bg-[#0A0A0C]/90 backdrop-blur-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
              <Sparkles className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight truncate">
                  {currentConv?.title || 'BOWOL Strategic Copilot'}
                </h3>
                {currentConv?.contextType && (
                  <Badge variant="brand" className="text-[9px] uppercase py-0 px-1.5 font-bold">
                    {currentConv.contextType}
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 truncate">
                Consultoría estratégica guiada por datos de mercado
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs text-zinc-300 hover:text-white"
              title="Historial de conversaciones"
              leftIcon={MessageSquare}
            >
              Hilos
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleStartNewConversation}
              className="text-zinc-300 hover:text-orange-400"
              title="Nueva conversación"
              aria-label="Nueva conversación"
            >
              <PlusCircle className="w-4 h-4" strokeWidth={1.5} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={closeCopilot}
              className="text-zinc-400 hover:text-white"
              aria-label="Cerrar Copilot"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </Button>
          </div>
        </div>

        {/* Conversation Switcher Drawer (if history open) */}
        {showHistory && (
          <div className="p-3 bg-zinc-950/95 border-b border-white/[0.08] max-h-56 overflow-y-auto space-y-1.5 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1 pb-1">
              <span className="font-semibold uppercase tracking-wider">Conversaciones Guardadas</span>
              <span>{conversations.length} hilos</span>
            </div>
            {conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setActiveConversationId(c.id);
                  setShowHistory(false);
                }}
                className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between text-xs ${
                  activeConversationId === c.id
                    ? 'bg-orange-500/10 border border-orange-500/30 text-orange-200'
                    : 'bg-white/[0.02] border border-white/[0.04] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'
                }`}
              >
                <div className="truncate pr-2">
                  <p className="font-medium text-zinc-200 truncate">{c.title}</p>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                    {new Date(c.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMutation.mutate(c.id);
                  }}
                  className="text-zinc-500 hover:text-rose-400 p-1 rounded"
                  title="Eliminar conversación"
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoadingMessages ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-3">
              <Sparkles className="w-6 h-6 animate-pulse text-orange-400" strokeWidth={1.5} />
              <p className="text-xs">Cargando contexto estratégico...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-3 shadow-lg">
                <Compass className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">
                ¿En qué reto estratégico trabajamos hoy?
              </h4>
              <p className="text-xs text-zinc-400 max-w-sm mb-6 leading-relaxed">
                El Copilot de BOWOL analiza las señales tecnológicas y tu perfil empresarial para formular hipótesis y recomendaciones accionables.
              </p>

              {/* Suggestions */}
              <div className="w-full space-y-2 text-left">
                {suggestionPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(prompt)}
                    className="w-full text-xs p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-orange-500/30 text-zinc-300 hover:text-white flex items-center justify-between transition-all group"
                  >
                    <span>{prompt}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-orange-400 transition-colors" strokeWidth={1.5} />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <MessageItem key={msg.id} message={msg} />
              ))}
            </>
          )}

          {/* Thinking indicator */}
          {sendMutation.isPending && (
            <div className="flex justify-start mb-4 animate-in fade-in">
              <div className="p-3.5 rounded-2xl bg-orange-950/20 border border-orange-500/20 flex items-center gap-2.5 text-xs text-orange-300">
                <Sparkles className="w-4 h-4 animate-spin text-orange-400" strokeWidth={1.5} />
                <span>Razonando con el perfil empresarial y señales de mercado...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Footer Input */}
        <div className="p-3.5 border-t border-white/[0.08] bg-[#0A0A0C]/90 backdrop-blur-md">
          <div className="relative rounded-xl bg-white/[0.03] border border-white/[0.08] focus-within:border-orange-500/50 transition-colors">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Haz una pregunta estratégica o profundiza en una hipótesis..."
              rows={2}
              className="w-full resize-none bg-transparent p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
            />
            <div className="flex items-center justify-between px-3 pb-2.5">
              <span className="text-[10px] text-zinc-500 font-mono">
                Enter para enviar · Shift+Enter para salto de línea
              </span>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || sendMutation.isPending}
                isLoading={sendMutation.isPending}
                className="h-7 px-2.5 text-xs"
                aria-label="Enviar mensaje"
              >
                <Send className="w-3.5 h-3.5" strokeWidth={1.5} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
