
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Sparkles, Bot, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatContext } from '@/contexts/ChatContext';
import { geminiService } from '@/services/geminiService';
import { useToast } from '@/hooks/use-toast';

const ChatInterface = () => {
  const {
    currentConversation,
    addMessage,
    isLoading,
    setIsLoading
  } = useChatContext();

  const [inputValue, setInputValue] = useState('');
  const [showPdfOptions, setShowPdfOptions] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Pre-loaded AI policy document URLs for quick access
  const policyDocuments = [
    {
      name: "EU AI Act",
      url: "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:32021R0106"
    },
    {
      name: "OECD AI Principles", 
      url: "https://www.oecd.org/going-digital/ai/principles/"
    }
  ];

  const handleSendMessage = async (withPdf = false, selectedPdfUrl = '') => {
    if (!inputValue.trim() || !currentConversation) return;

    // Add user message
    addMessage({
      role: 'user',
      content: inputValue
    });

    const userMessage = inputValue;
    const pdfToUse = withPdf ? (selectedPdfUrl || pdfUrl) : '';
    setInputValue('');
    setPdfUrl('');
    setShowPdfOptions(false);
    setIsLoading(true);

    try {
      let aiResponse;
      
      if (pdfToUse) {
        // Use PDF-enhanced response
        const pdfName = pdfToUse.split('/').pop() || 'Policy Document';
        aiResponse = await geminiService.generateResponseWithPDF(userMessage, pdfToUse, pdfName);
        
        toast({
          title: "Document analyzed",
          description: `Response generated using ${pdfName}`,
        });
      } else {
        // Regular response
        aiResponse = await geminiService.generateResponse(userMessage);
      }
      
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
      <div className="h-screen flex items-center justify-center enhanced-glass rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl m-4">
        <div className="text-center">
          <Sparkles className="w-16 h-16 aurora-text mx-auto mb-4 premium-glow" />
          <h2 className="text-2xl font-bold aurora-text mb-2">Welcome to VidhiAI</h2>
          <p className="text-white/70">Start a new conversation to begin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col enhanced-glass rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl m-4 ml-20">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full aurora-bg flex items-center justify-center premium-glow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold aurora-text">Vidhi</h1>
            <p className="text-sm text-white/70">AI Policy Assistant</p>
          </div>
        </div>
        <div className="text-xs text-white/50 premium-glass px-3 py-1 rounded-full">
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
              } premium-glow`}>
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div
                className={`max-w-[70%] p-4 rounded-2xl enhanced-glass ${
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
              <div className="w-8 h-8 rounded-full aurora-accent-bg flex items-center justify-center premium-glow">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="enhanced-glass p-4 rounded-2xl rounded-tl-sm glow">
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

      {/* PDF Options Panel */}
      {showPdfOptions && (
        <div className="p-4 border-t border-white/10 glass-dark">
          <h4 className="text-sm font-medium text-white/70 mb-3">Analyze with Document</h4>
          
          {/* Quick Access Policy Documents */}
          <div className="grid grid-cols-1 gap-2 mb-4">
            {policyDocuments.map((doc, index) => (
              <Button
                key={index}
                onClick={() => handleSendMessage(true, doc.url)}
                disabled={isLoading || !inputValue.trim()}
                className="justify-start text-left h-auto p-3 premium-glass border border-white/20 rounded-xl glow-hover"
              >
                <FileText className="w-4 h-4 mr-2 text-white/70" />
                <div>
                  <div className="text-sm text-white">{doc.name}</div>
                  <div className="text-xs text-white/50 truncate">{doc.url}</div>
                </div>
              </Button>
            ))}
          </div>

          {/* Custom URL Input */}
          <div className="flex space-x-2">
            <Input
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              placeholder="Enter PDF URL..."
              className="premium-glass border-white/20 text-white placeholder:text-white/50 rounded-xl flex-1"
            />
            <Button
              onClick={() => handleSendMessage(true)}
              disabled={isLoading || !inputValue.trim() || !pdfUrl.trim()}
              className="aurora-bg rounded-xl glow-hover"
            >
              Analyze
            </Button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-6 border-t border-white/10">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="premium-glass rounded-full w-10 h-10 p-0 glow-hover"
            onClick={() => setShowPdfOptions(!showPdfOptions)}
          >
            <Paperclip className="w-4 h-4 text-white" />
          </Button>
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about AI policies, regulations, or frameworks..."
              className="premium-glass border-white/20 text-white placeholder:text-white/50 rounded-2xl pr-12 h-12 glow-hover"
              disabled={isLoading}
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputValue.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 aurora-bg rounded-full w-8 h-8 p-0 glow-hover"
            >
              <Send className="w-4 h-4 text-white" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-white/40 mt-2 text-center">
          {showPdfOptions ? "Select a document to analyze with your question" : "Click the paperclip to analyze PDF documents"}
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
