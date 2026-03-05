import { ChatInterface } from "@/components/chat/ChatInterface";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";

export default function ChatPage() {
  return (
    <div className="flex h-full w-full">
      <div className="hidden md:flex w-[260px] h-full border-r border-border flex-shrink-0">
        <ConversationSidebar className="w-full h-full" />
      </div>
      <div className="flex-1 h-full overflow-hidden relative">
        <ChatInterface />
      </div>
    </div>
  );
}
