import React from 'react';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  Database,
  TrendingUp,
  Lightbulb,
} from 'lucide-react';
import { ConversationMessage } from '../types';

interface MessageItemProps {
  message: ConversationMessage;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.role === 'USER';

  const renderStructuredContent = (content: string) => {
    const hasStructuredBlocks =
      content.includes('### DATO') ||
      content.includes('### ANÁLISIS') ||
      content.includes('### HIPÓTESIS') ||
      content.includes('### RECOMENDACIÓN');

    if (!hasStructuredBlocks) {
      return (
        <div className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      );
    }

    // Split by ###
    const sections = content.split(/###\s+/).filter(Boolean);

    return (
      <div className="space-y-3 mt-2">
        {sections.map((sec, idx) => {
          const lines = sec.trim().split('\n');
          const title = lines[0].trim().toUpperCase();
          const body = lines.slice(1).join('\n').trim();

          if (title.startsWith('DATO')) {
            return (
              <div
                key={idx}
                className="p-3 rounded-xl bg-blue-500/[0.07] border border-blue-500/20 text-xs text-blue-200"
              >
                <div className="flex items-center gap-1.5 font-semibold text-blue-400 mb-1 tracking-wide uppercase text-[10px]">
                  <Database className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>Dato Observable</span>
                </div>
                <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{body}</p>
              </div>
            );
          }

          if (title.startsWith('ANÁLISIS') || title.startsWith('ANALISIS')) {
            return (
              <div
                key={idx}
                className="p-3 rounded-xl bg-orange-500/[0.07] border border-orange-500/20 text-xs text-orange-200"
              >
                <div className="flex items-center gap-1.5 font-semibold text-orange-400 mb-1 tracking-wide uppercase text-[10px]">
                  <TrendingUp className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>Análisis Estratégico</span>
                </div>
                <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{body}</p>
              </div>
            );
          }

          if (title.startsWith('HIPÓTESIS') || title.startsWith('HIPOTESIS')) {
            return (
              <div
                key={idx}
                className="p-3 rounded-xl bg-purple-500/[0.07] border border-purple-500/20 text-xs text-purple-200"
              >
                <div className="flex items-center gap-1.5 font-semibold text-purple-400 mb-1 tracking-wide uppercase text-[10px]">
                  <Lightbulb className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>Hipótesis Proyectada</span>
                </div>
                <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{body}</p>
              </div>
            );
          }

          if (title.startsWith('RECOMENDACIÓN') || title.startsWith('RECOMENDACION')) {
            return (
              <div
                key={idx}
                className="p-3 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 text-xs text-emerald-200"
              >
                <div className="flex items-center gap-1.5 font-semibold text-emerald-400 mb-1 tracking-wide uppercase text-[10px]">
                  <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>Recomendación Táctica (1-4 semanas)</span>
                </div>
                <p className="text-zinc-200 leading-relaxed whitespace-pre-wrap font-medium">{body}</p>
              </div>
            );
          }

          return (
            <div key={idx} className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {sec}
            </div>
          );
        })}
      </div>
    );
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-orange-600/15 border border-orange-500/30 p-3.5 text-zinc-100 shadow-md">
          <div className="flex items-center justify-between gap-3 mb-1">
            <span className="text-[10px] font-semibold text-orange-400 uppercase tracking-wider">
              Tú
            </span>
            <span className="text-[9px] text-zinc-500 font-mono">
              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <p className="text-xs leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="max-w-[92%] w-full rounded-2xl rounded-tl-sm bg-[#121318] border border-white/[0.08] p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 pb-2 mb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Sparkles className="w-3 h-3" strokeWidth={1.5} />
            </div>
            <span className="text-xs font-bold text-zinc-200 tracking-tight">
              BOWOL Copilot
            </span>
          </div>

          <div className="flex items-center gap-2">
            {message.tokensUsed && (
              <span className="flex items-center gap-1 text-[10px] font-mono text-zinc-500 bg-white/[0.02] px-2 py-0.5 rounded border border-white/[0.04]">
                <Zap className="w-3 h-3 text-orange-400" strokeWidth={1.5} />
                {message.tokensUsed} tokens
              </span>
            )}
            <span className="text-[9px] text-zinc-500 font-mono">
              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {renderStructuredContent(message.content)}
      </div>
    </div>
  );
};
