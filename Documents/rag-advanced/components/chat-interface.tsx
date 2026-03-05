'use client';

import { useChat } from 'ai/react';
import { useRef, useEffect, useState } from 'react';
import { Paperclip, Send, Loader2 } from 'lucide-react';

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Autofocus effect
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading, messages]);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Falló la carga');
      }

      setUploadStatus({ type: 'success', message: '¡Documento ingestado!' });
      setTimeout(() => setUploadStatus(null), 3000);
      
      setMessages([
        ...messages,
        {
          id: Date.now().toString(),
          role: 'assistant', // Changed from 'system' to 'assistant' to be part of the conversation flow
          content: `✅ Documento subido correctamente: ${file.name}. \nPuedes preguntarme sobre su contenido.`
        }
      ]);

    } catch (error) {
      setUploadStatus({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Error al ingestar el documento.' 
      });
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-lg overflow-hidden bg-white shadow-sm relative text-sm">
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-4">
            <div className="bg-gray-100 p-4 rounded-full">
              <Paperclip className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Bienvenido al Asistente RAG</p>
              <p className="text-sm mt-1">Sube un documento PDF o texto para comenzar.</p>
            </div>
          </div>
        )}
        
        {messages.map(m => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : m.content.startsWith('✅')
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                  : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              <div className={`font-medium text-xs mb-1 ${
                m.role === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {m.role === 'user' ? 'Tú' : 'Asistente'}
              </div>
              <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 rounded-lg p-3 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Pensando...
            </div>
          </div>
        )}
        
        {uploadStatus && (
          <div className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full shadow-lg text-sm transition-all duration-500 ${
            uploadStatus.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {uploadStatus.message}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50 absolute bottom-0 left-0 right-0">
        <div className="flex gap-2 items-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".txt,.pdf"
          />
          <button
            type="button"
            onClick={handleFileClick}
            disabled={uploading || isLoading}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50"
            title="Adjuntar documento"
          >
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
          </button>
          
          <input
            ref={inputRef}
            className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={input}
            onChange={handleInputChange}
            placeholder={uploading ? "Subiendo archivo..." : "Haz una pregunta..."}
            disabled={isLoading || uploading}
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || uploading}
            className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
