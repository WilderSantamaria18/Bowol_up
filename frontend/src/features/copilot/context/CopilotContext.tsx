import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ConversationContextType } from '../types';

export interface OpenCopilotOptions {
  contextType?: ConversationContextType;
  contextId?: string;
  title?: string;
  initialMessage?: string;
}

interface CopilotContextType {
  isOpen: boolean;
  activeConversationId: string | null;
  activeContext: OpenCopilotOptions | null;
  openCopilot: (options?: OpenCopilotOptions) => void;
  closeCopilot: () => void;
  setActiveConversationId: (id: string | null) => void;
}

const CopilotContext = createContext<CopilotContextType | undefined>(undefined);

export const CopilotProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeContext, setActiveContext] = useState<OpenCopilotOptions | null>(null);

  const openCopilot = (options?: OpenCopilotOptions) => {
    if (options) {
      setActiveContext(options);
    }
    setIsOpen(true);
  };

  const closeCopilot = () => {
    setIsOpen(false);
  };

  return (
    <CopilotContext.Provider
      value={{
        isOpen,
        activeConversationId,
        activeContext,
        openCopilot,
        closeCopilot,
        setActiveConversationId,
      }}
    >
      {children}
    </CopilotContext.Provider>
  );
};

export const useCopilot = (): CopilotContextType => {
  const context = useContext(CopilotContext);
  if (!context) {
    return {
      isOpen: false,
      activeConversationId: null,
      activeContext: null,
      openCopilot: () => {},
      closeCopilot: () => {},
      setActiveConversationId: () => {},
    };
  }
  return context;
};
