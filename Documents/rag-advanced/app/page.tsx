import React from 'react';
import { ChatInterface } from '@/components/chat/ChatInterface';

export default function Home() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-[#0a0a0a] font-sans">
      <ChatInterface />
    </main>
  );
}
