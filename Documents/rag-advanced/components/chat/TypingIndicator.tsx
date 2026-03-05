import { BrainCircuit } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function TypingIndicator() {
  return (
    <div className="flex w-full gap-4 flex-row mt-4 max-w-3xl mx-auto">
      <Avatar className="w-8 h-8 border border-[#0891b2]/30 bg-[#0891b2]/10 mt-1">
        <AvatarFallback className="bg-transparent text-[#0891b2]">
          <BrainCircuit className="w-5 h-5" />
        </AvatarFallback>
      </Avatar>
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl rounded-tl-none px-4 py-3 flex items-center">
        <div className="flex space-x-1">
          <div className="w-1.5 h-1.5 bg-[#71717a] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1.5 h-1.5 bg-[#71717a] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1.5 h-1.5 bg-[#71717a] rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}
