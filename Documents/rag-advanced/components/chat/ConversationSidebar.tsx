"use client";

import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
}

export function ConversationSidebar({ className, currentId }: { className?: string, currentId?: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    fetch("/api/conversations")
      .then(res => res.json())
      .then(data => {
          if (Array.isArray(data)) {
            setConversations(data);
          }
      });
  }, [currentId]);

  return (
    <div className={cn("flex flex-col bg-secondary/5 h-full", className)}>
      <div className="p-4 border-b border-border">
        <Button asChild className="w-full justify-start gap-2 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20" variant="outline">
            <Link href="/chat">
                <Plus className="w-4 h-4" /> Nueva conversación
            </Link>
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <div className="text-xs font-medium text-muted-foreground px-2 py-2 mb-2 uppercase tracking-wider">
            Historial
        </div>
        {conversations.length === 0 && (
            <div className="px-4 py-8 text-center text-xs text-muted-foreground italic">
                No hay conversaciones
            </div>
        )}
        {conversations.map((conv) => (
            <Link 
                key={conv.id} 
                href={`/chat/${conv.id}`}
                className={cn(
                    "flex flex-col gap-1 px-3 py-3 rounded-lg text-sm transition-all border border-transparent",
                    currentId === conv.id 
                        ? "bg-secondary/80 text-foreground border-border shadow-sm" 
                        : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                )}
            >
                <div className="font-medium truncate">{conv.title}</div>
                <div className="text-[10px] opacity-60">
                    {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true, locale: es })}
                </div>
            </Link>
        ))}
      </div>
    </div>
  );
}
