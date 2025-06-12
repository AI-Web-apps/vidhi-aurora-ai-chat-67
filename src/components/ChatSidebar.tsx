
import React from 'react';
import { Plus, MessageSquare, FileText, Settings, Trash2, Download, X } from 'lucide-react';
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

  const features = [
    { icon: FileText, label: 'Document Analysis', active: true },
    { icon: MessageSquare, label: 'Multi-turn Chat', active: true },
    { icon: Download, label: 'Export Chat', active: false },
    { icon: Settings, label: 'System Prompts', active: false },
  ];

  const handleNewConversation = () => {
    createNewConversation();
    if (onClose) onClose();
  };

  const handleConversationClick = (conversationId: string) => {
    switchConversation(conversationId);
    if (onClose) onClose();
  };

  return (
    <div className="w-80 h-screen glass border-r border-white/20 backdrop-blur-2xl flex flex-col">
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
          className="w-full glass-dark text-white rounded-xl h-10 glow-hover"
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
          <div className="space-y-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`p-3 glass-dark rounded-xl cursor-pointer glow-hover group ${
                  currentConversationId === conv.id ? 'aurora-accent-bg' : ''
                }`}
                onClick={() => handleConversationClick(conv.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">
                      {conv.title}
                    </h4>
                    <p className="text-xs text-white/50 mt-1">
                      {conv.updatedAt.toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3 text-white/50" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Features */}
      <div className="p-4 border-t border-white/10">
        <h3 className="text-sm font-medium text-white/70 mb-3">Features</h3>
        <div className="space-y-2">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 glass-dark rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <feature.icon className="w-4 h-4 text-white/70" />
                <span className="text-sm text-white/70">{feature.label}</span>
              </div>
              <div className={`w-2 h-2 rounded-full ${
                feature.active ? 'aurora-accent-bg glow' : 'bg-white/20'
              }`} />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <Button
          variant="ghost"
          className="w-full justify-start text-white/70 hover:text-white glass-dark rounded-xl"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  );
};

export default ChatSidebar;
