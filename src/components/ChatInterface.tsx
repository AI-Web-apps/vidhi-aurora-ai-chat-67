
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Sparkles, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatContext } from '@/contexts/ChatContext';
import { geminiService } from '@/services/geminiService';

const ChatInterface = () => {
  const {
    currentConversation,
    addMessage,
    isLoading,
    setIsLoading
  } = useChatContext();

  const [inputValue, setInputValue] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentConversation) return;

    // Add user message
    addMessage({
      role: 'user',
      content: inputValue
    });

    const userMessage = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // Get AI response from Gemini
      const aiResponse = await geminiService.generateResponse(userMessage);
      
      addMessage({
        role: 'assistant',
        content: aiResponse
      });
    } catch (error) {
      console.error('Error getting AI response:', error);
      addMessage({
        role: 'assistant',
        content: "I apologize, but I encountered an error while processing your request. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [currentConversation?.messages]);

  if (!currentConversation) {
    return (
      <div className="h-screen flex items-center justify-center glass rounded-3xl border border-white/20 backdrop-blur-2xl shadow-2xl m-4">
        <div className="text-center">
          <Sparkles className="w-16 h-16 aurora-text mx-auto mb-4" />
          <h2 className="text-2xl font-bold aurora-text mb-2">Welcome to VidhiAI</h2>
          <p className="text-white/70">Start a new conversation to begin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col glass rounded-3xl border border-white/20 backdrop-blur-2xl shadow-2xl m-4 ml-20">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full aurora-bg flex items-center justify-center glow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold aurora-text">Vidhi</h1>
            <p className="text-sm text-white/70">AI Policy Assistant</p>
          </div>
        </div>
        <div className="text-xs text-white/50 glass px-3 py-1 rounded-full">
          VidhiAI Platform
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
        <div className="space-y-6">
          {currentConversation.messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === 'user' 
                  ? 'aurora-secondary-bg' 
                  : 'aurora-accent-bg'
              } glow`}>
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div
                className={`max-w-[70%] p-4 rounded-2xl glass-dark ${
                  message.role === 'user'
                    ? 'rounded-tr-sm'
                    : 'rounded-tl-sm'
                } glow-hover`}
              >
                <p className="text-white leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs text-white/50 mt-2">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full aurora-accent-bg flex items-center justify-center glow">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="glass-dark p-4 rounded-2xl rounded-tl-sm glow">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-6 border-t border-white/10">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="glass rounded-full w-10 h-10 p-0 glow-hover"
          >
            <Paperclip className="w-4 h-4 text-white" />
          </Button>
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about AI policies, regulations, or frameworks..."
              className="glass border-white/20 text-white placeholder:text-white/50 rounded-2xl pr-12 h-12 glow-hover"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 aurora-bg rounded-full w-8 h-8 p-0 glow-hover"
            >
              <Send className="w-4 h-4 text-white" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-white/40 mt-2 text-center">
          Vidhi can analyze PDF documents and provide insights on AI policies
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
