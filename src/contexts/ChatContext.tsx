
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatContextType {
  conversations: Conversation[];
  currentConversationId: string | null;
  currentConversation: Conversation | null;
  createNewConversation: () => void;
  switchConversation: (conversationId: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  deleteConversation: (conversationId: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentConversation = conversations.find(conv => conv.id === currentConversationId) || null;

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [{
        id: Date.now().toString(),
        role: 'assistant',
        content: "Hello! I'm Vidhi, your AI assistant specialized in AI policy documents. I can help you understand complex policy frameworks, explain technical terms, and provide insights from various AI governance documents. How can I assist you today?",
        timestamp: new Date()
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
  };

  const switchConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
  };

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    if (!currentConversationId) return;

    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === currentConversationId) {
        const updatedConv = {
          ...conv,
          messages: [...conv.messages, newMessage],
          updatedAt: new Date()
        };

        // Update title based on first user message
        if (message.role === 'user' && conv.messages.length === 1) {
          updatedConv.title = message.content.length > 50 
            ? message.content.substring(0, 50) + '...'
            : message.content;
        }

        return updatedConv;
      }
      return conv;
    }));
  };

  const deleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    if (currentConversationId === conversationId) {
      const remaining = conversations.filter(conv => conv.id !== conversationId);
      setCurrentConversationId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Initialize with first conversation if none exist
  React.useEffect(() => {
    if (conversations.length === 0) {
      createNewConversation();
    }
  }, []);

  return (
    <ChatContext.Provider value={{
      conversations,
      currentConversationId,
      currentConversation,
      createNewConversation,
      switchConversation,
      addMessage,
      deleteConversation,
      isLoading,
      setIsLoading
    }}>
      {children}
    </ChatContext.Provider>
  );
};
