
import React from 'react';
import ChatSidebar from '@/components/ChatSidebar';
import ChatInterface from '@/components/ChatInterface';
import DocumentUpload from '@/components/DocumentUpload';

const Index = () => {
  return (
    <div className="min-h-screen flex w-full overflow-hidden">
      <ChatSidebar />
      <div className="flex-1 flex flex-col">
        <ChatInterface />
      </div>
      <DocumentUpload />
    </div>
  );
};

export default Index;
