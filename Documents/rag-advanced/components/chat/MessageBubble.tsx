import { Message } from "ai";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BrainCircuit, Search, ArrowUpDown, Sparkles } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  
  // Logic to extract sources (kept for CoT logic)
  interface MessageSource {
    title: string;
    url?: string;
    page?: number;
    score?: number;
    documentTitle: string;
    content: string;
    similarity: number;
    chunkIndex: number;
  }
  
  let sources: MessageSource[] = [];
  
  if (!isUser) {
    const messageWithSources = message as Message & { sources?: MessageSource[] };
    if (message.annotations && message.annotations.length > 0) {
      const annotation = message.annotations[0] as unknown as { sources: MessageSource[] };
      if (annotation && annotation.sources) {
        sources = annotation.sources;
      }
    }
    if (messageWithSources.sources) {
      sources = messageWithSources.sources;
    }
  }

  const validSources = sources.filter(s => s.documentTitle && s.content);
  const showCoT = !isUser && validSources.length > 0;

  return (
    <div className={cn("flex w-full gap-4 mb-6", isUser ? "justify-end" : "justify-start")}>
      
      {/* Assistant Avatar */}
      {!isUser && (
        <Avatar className="w-8 h-8 border border-[#0891b2]/30 bg-[#0891b2]/10 mt-1">
          <AvatarFallback className="bg-transparent text-[#0891b2]">
            <BrainCircuit className="w-5 h-5" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn("flex flex-col gap-2 max-w-[85%]", isUser ? "items-end" : "items-start")}>
        
        {/* User Bubble */}
        {isUser ? (
           <div className="bg-[#0891b2] text-white px-5 py-3 rounded-2xl rounded-tr-sm shadow-md">
             <div className="prose prose-invert max-w-none text-sm leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                </ReactMarkdown>
             </div>
           </div>
        ) : (
          /* Assistant Response */
          <div className="w-full space-y-2">
            
            {/* Chain of Thought Accordion */}
            {showCoT && (
              <Accordion type="single" collapsible className="w-full mb-2">
                <AccordionItem value="cot" className="border border-[#2a2a2a] rounded-lg bg-[#1a1a1a] px-0">
                  <AccordionTrigger className="px-4 py-2 hover:no-underline text-xs text-[#71717a] hover:text-[#f5f5f5] data-[state=open]:text-[#0891b2]">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-3 h-3" />
                      Cadena de pensamiento y traza de recuperación
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-1">
                    <div className="space-y-3 pl-1 relative border-l border-[#2a2a2a] ml-1.5 mt-1">
                      {/* Step 1 */}
                      <div className="pl-4 relative">
                        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
                          <div className="w-1 h-1 rounded-full bg-[#71717a]"></div>
                        </div>
                        <div className="text-xs font-medium text-[#f5f5f5] flex items-center gap-2">
                          Reformulación de consulta
                        </div>
                        <p className="text-[10px] text-[#71717a] mt-0.5">Optimizando búsqueda semántica...</p>
                      </div>

                      {/* Step 2 */}
                      <div className="pl-4 relative">
                        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
                          <div className="w-1 h-1 rounded-full bg-[#0891b2]"></div>
                        </div>
                        <div className="text-xs font-medium text-[#f5f5f5] flex items-center gap-2">
                          <Search className="w-3 h-3 text-[#0891b2]" />
                          Recuperación de base de conocimiento
                        </div>
                        <p className="text-[10px] text-[#71717a] mt-0.5">{validSources.length} fragmentos encontrados</p>
                      </div>

                      {/* Step 3 */}
                      <div className="pl-4 relative">
                        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
                          <div className="w-1 h-1 rounded-full bg-[#0891b2]"></div>
                        </div>
                        <div className="text-xs font-medium text-[#f5f5f5] flex items-center gap-2">
                          <ArrowUpDown className="w-3 h-3 text-[#0891b2]" />
                          Re-clasificación por relevancia
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div className="pl-4 relative">
                        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
                          <div className="w-1 h-1 rounded-full bg-[#22c55e]"></div>
                        </div>
                        <div className="text-xs font-medium text-[#f5f5f5] flex items-center gap-2">
                          <BrainCircuit className="w-3 h-3 text-[#22c55e]" />
                          Síntesis de conocimiento
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}

            {/* Message Content */}
            <div className="text-sm text-[#f5f5f5] leading-relaxed prose prose-invert max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  // Style citations [1] etc if they appear as links or distinct text
                  a: ({...props}) => <span className="text-[#0891b2] cursor-pointer hover:underline font-medium" {...props} />
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
