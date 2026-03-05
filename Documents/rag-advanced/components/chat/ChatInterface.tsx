"use client";

import { useChat } from "ai/react";
import { useEffect, useRef } from "react";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";
import { useToast } from "@/hooks/use-toast";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { RightPanel, Source } from "./RightPanel";
import { Message } from "ai";
import { Pencil, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInterfaceProps {
  initialMessages?: Message[];
  id?: string;
}

export function ChatInterface({ initialMessages = [], id }: ChatInterfaceProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setInput, data, append } = useChat({
    api: "/api/chat",
    initialMessages,
    body: { conversationId: id },
    onFinish: () => {
        scrollToBottom();
    },
    onError: (err) => {
        toast({
            title: "Error",
            description: err.message,
            variant: "destructive"
        })
    }
  });

  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  interface RawSource {
    documentTitle?: string;
    title?: string;
    content?: string;
    similarity?: number;
    score?: number;
    page?: number;
    url?: string;
  }

  // Extraer fuentes y trazas del flujo de datos o mensajes
  let rawSources: RawSource[] = [];
  let traces: any[] = [];
  
  // 1. Intentar obtener fuentes y trazas desde StreamData (método preferido)
  if (data && data.length > 0) {
    const lastSourceData = [...data].reverse().find((item: any) => item && item.type === 'sources');
    if (lastSourceData) {
      rawSources = (lastSourceData as any).sources || [];
    }
    
    // Recopilar todas las trazas
    traces = data.filter((item: any) => item && item.type === 'trace').map((item: any) => item.trace);
  }

  // 2. Usar anotaciones como respaldo si el flujo de datos está vacío (para compatibilidad con versiones anteriores)
  if (rawSources.length === 0) {
    const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
    if (lastAssistantMessage) {
        const msg = lastAssistantMessage as Message & { sources?: RawSource[] };
        if (lastAssistantMessage.annotations && lastAssistantMessage.annotations.length > 0) {
            const annotation = lastAssistantMessage.annotations[0] as unknown as { sources: RawSource[] };
            if (annotation?.sources) rawSources = annotation.sources;
        }
        if (msg.sources) rawSources = msg.sources;
    }
  }
  
  // Filtrar fuentes válidas
  const currentSources: Source[] = rawSources
    .filter((s) => s.content)
    .map((s) => ({
      title: s.documentTitle || s.title || "Documento sin título",
      content: s.content || "",
      similarity: s.similarity || s.score,
      page: s.page,
      url: s.url
    }));

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden text-[#f5f5f5]">
      {/* Left Sidebar */}
      <AppSidebar />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative" style={{ background: 'radial-gradient(ellipse at 50% 0%, #0e2a3a 0%, #0a0a0a 60%)' }}>
        {/* Header */}
        <header className="h-14 border-b border-[#2a2a2a] flex items-center justify-between px-6 bg-[#0a0a0a]/80 backdrop-blur-sm shrink-0 z-10">
            <h2 className="text-[#f5f5f5] font-medium text-sm flex items-center gap-2">
                Nueva conversación
                <span className="text-[#71717a] text-xs font-normal ml-2">Hoy, 10:23 AM</span>
            </h2>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-[#71717a] hover:text-[#f5f5f5] hover:bg-[#2a2a2a]">
                    <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-[#71717a] hover:text-[#f5f5f5] hover:bg-[#2a2a2a]">
                    <MoreHorizontal className="w-4 h-4" />
                </Button>
            </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-4 scroll-smooth" ref={scrollRef}>
          <div className="max-w-3xl mx-auto w-full pt-4">
            <MessageList messages={messages} />
            {isLoading && <TypingIndicator />}
            {error && (
                <div className="p-4 rounded-lg bg-red-500/10 text-red-500 text-sm mt-4 text-center border border-red-500/20">
                    Error: {error.message}
                </div>
            )}
            {/* Spacer for bottom input */}
            <div className="h-4" />
          </div>
        </div>
        
        {/* Input Area */}
        <div className="p-4 bg-transparent shrink-0 z-10 border-t border-transparent">
          <ChatInput 
              input={input} 
              handleInputChange={handleInputChange} 
              handleSubmit={handleSubmit} 
              isLoading={isLoading}
              setInput={setInput}
              append={append}
          />
        </div>
      </div>

      {/* Right Panel */}
      <RightPanel sources={currentSources} traces={traces} />
    </div>
  );
}
