
import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatProvider } from '@/contexts/ChatContext';
import ChatSidebar from '@/components/ChatSidebar';
import ChatInterface from '@/components/ChatInterface';
import DocumentUpload from '@/components/DocumentUpload';

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ChatProvider>
      <div className="min-h-screen flex w-full overflow-hidden relative">
        {/* Enhanced background with multiple gradient layers */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 via-transparent to-purple-800/30"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/50 to-black"></div>
        </div>

        {/* Sidebar Toggle Button - Fixed position */}
        <Button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 left-4 z-50 w-10 h-10 p-0 premium-glass rounded-full glow-hover"
        >
          <Menu className="w-5 h-5 text-white" />
        </Button>

        {/* Sidebar */}
        <div className={`transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed left-0 top-0 z-40`}>
          <ChatSidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <ChatInterface />
        </div>

        {/* Document Upload */}
        <DocumentUpload />
      </div>
    </ChatProvider>
  );
};

export default Index;
