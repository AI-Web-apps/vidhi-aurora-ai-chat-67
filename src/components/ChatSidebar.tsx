
import React from 'react';
import { Plus, MessageSquare, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatContext } from '@/contexts/ChatContext';

interface ChatSidebarProps {
  onClose?: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ onClose }) => {
  const {
    conversations,
    currentConversationId,
    createNewConversation,
    switchConversation,
    deleteConversation
  } = useChatContext();

  const handleNewConversation = () => {
    createNewConversation();
    if (onClose) onClose();
  };

  const handleConversationClick = (conversationId: string) => {
    switchConversation(conversationId);
    if (onClose) onClose();
  };

  return (
    <div className="w-80 h-screen enhanced-glass border-r border-white/10 backdrop-blur-2xl flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold aurora-text">VidhiAI</h2>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleNewConversation}
              className="aurora-bg rounded-full w-8 h-8 p-0 glow-hover"
            >
              <Plus className="w-4 h-4 text-white" />
            </Button>
            {onClose && (
              <Button
                onClick={onClose}
                variant="ghost"
                className="w-8 h-8 p-0 rounded-full text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <Button
          onClick={handleNewConversation}
          className="w-full premium-glass text-white rounded-xl h-10 glow-hover border border-white/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Conversation
        </Button>
      </div>

      {/* Conversations */}
      <div className="flex-1 flex flex-col">
        <div className="p-4">
          <h3 className="text-sm font-medium text-white/70 mb-3">Recent Conversations</h3>
        </div>
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-3">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`p-4 enhanced-glass rounded-2xl cursor-pointer glow-hover group transition-all duration-200 border ${
                  currentConversationId === conv.id 
                    ? 'aurora-accent-bg border-blue-400/50 shadow-lg shadow-blue-500/20' 
                    : 'border-white/20 hover:border-white/30'
                }`}
                onClick={() => handleConversationClick(conv.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 mr-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-white/60 flex-shrink-0" />
                      <h4 className="text-sm font-medium text-white truncate">
                        {conv.title}
                      </h4>
                    </div>
                    <p className="text-xs text-white/50">
                      {conv.updatedAt.toLocaleDateString()} • {conv.messages.length} messages
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 p-0 hover:bg-red-500/20 hover:text-red-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                {currentConversationId === conv.id && (
                  <div className="mt-2 w-full h-1 aurora-bg rounded-full opacity-60"></div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="text-center">
          <p className="text-xs text-white/50 mb-2">VidhiAI Policy Assistant</p>
          <div className="w-full h-px aurora-bg opacity-30"></div>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
