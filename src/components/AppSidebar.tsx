
import React, { useState } from 'react';
import { Plus, MessageSquare, FileText, Settings, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

interface Conversation {
  id: string;
  title: string;
  date: string;
}

const AppSidebar = () => {
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: '1', title: 'EU AI Act Risk Classification', date: '2 hours ago' },
    { id: '2', title: 'OECD AI Principles Overview', date: '1 day ago' },
    { id: '3', title: 'India AI Strategy Analysis', date: '3 days ago' },
    { id: '4', title: 'NITI Aayog Discussion Paper', date: '1 week ago' },
  ]);

  const [activeConversation, setActiveConversation] = useState<string>('1');

  const features = [
    { icon: FileText, label: 'Document Analysis', active: true },
    { icon: MessageSquare, label: 'Multi-turn Chat', active: true },
    { icon: Download, label: 'Export Chat', active: false },
    { icon: Settings, label: 'System Prompts', active: false },
  ];

  const handleNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      date: 'Just now'
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversation(newConversation.id);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    if (activeConversation === id && conversations.length > 1) {
      const remainingConversations = conversations.filter(conv => conv.id !== id);
      setActiveConversation(remainingConversations[0]?.id || '');
    }
  };

  return (
    <Sidebar className="glass border-r border-white/20 backdrop-blur-2xl">
      <SidebarHeader className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold aurora-text">VidhiAI</h2>
          <Button 
            onClick={handleNewConversation}
            className="aurora-bg rounded-full w-8 h-8 p-0 glow-hover"
          >
            <Plus className="w-4 h-4 text-white" />
          </Button>
        </div>
        <Button 
          onClick={handleNewConversation}
          className="w-full glass-dark text-white rounded-xl h-10 glow-hover"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Conversation
        </Button>
      </SidebarHeader>

      <SidebarContent className="flex-1 flex flex-col">
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/70 mb-3">Recent Conversations</SidebarGroupLabel>
          <SidebarGroupContent>
            <ScrollArea className="flex-1">
              <SidebarMenu>
                {conversations.map((conv) => (
                  <SidebarMenuItem key={conv.id}>
                    <SidebarMenuButton 
                      isActive={activeConversation === conv.id}
                      onClick={() => setActiveConversation(conv.id)}
                      className="p-3 glass-dark rounded-xl cursor-pointer glow-hover group w-full"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">
                            {conv.title}
                          </h4>
                          <p className="text-xs text-white/50 mt-1">{conv.date}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(conv.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0"
                        >
                          <Trash2 className="w-3 h-3 text-white/50" />
                        </Button>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className="text-white/70 mb-3">Features</SidebarGroupLabel>
          <SidebarGroupContent>
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
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-white/10">
        <Button
          variant="ghost"
          className="w-full justify-start text-white/70 hover:text-white glass-dark rounded-xl"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
