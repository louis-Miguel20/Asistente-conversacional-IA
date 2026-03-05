import { Message } from "ai";
import { MessageBubble } from "./MessageBubble";
import { Brain } from "lucide-react";

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-center text-[#71717a] p-8 mt-20">
              <div className="w-16 h-16 bg-[#0891b2]/10 rounded-2xl flex items-center justify-center mb-4 text-[#0891b2] shadow-[0_0_15px_rgba(8,145,178,0.2)]">
                  <Brain className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-[#f5f5f5]">Bienvenido a Nexus RAG</h2>
              <p className="max-w-md text-sm">
                  Comienza una conversación haciendo preguntas sobre tus bases de conocimiento.
              </p>
          </div>
      );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto w-full">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
}
