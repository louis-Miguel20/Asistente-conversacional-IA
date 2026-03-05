import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send, Mic } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Message } from "ai";

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  setInput: (value: string) => void;
  append?: (message: Message | Omit<Message, 'id'>) => Promise<string | null | undefined>;
}

export function ChatInput({ input, handleInputChange, handleSubmit, isLoading, setInput, append }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Se elimina la función handleKeyDown duplicada o se integra en una sola
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        const form = e.currentTarget.form;
        if (form) form.requestSubmit();
      }
    }
  };

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validar tipo de archivo
      const validExtensions = ['.pdf', '.txt', '.md', '.xls', '.xlsx'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        toast({
          title: "Tipo de archivo no soportado",
          description: "Por favor sube archivos PDF, Excel o de texto.",
          variant: "destructive"
        });
        return;
      }

      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/ingest", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Error en la subida");
        }

        const data = await response.json();
        toast({
          title: "Archivo subido correctamente",
          description: `Se procesó: ${file.name} (${data.message})`,
          variant: "default",
          className: "bg-[#0891b2] text-white border-none"
        });
        
        // Disparar evento para actualizar lista de documentos si es necesario
        window.dispatchEvent(new Event('document-uploaded'));
        
        // Notificar al chat que se ha subido un documento
        if (append) {
          append({
            role: 'user',
            content: `He subido el documento "${file.name}" a la base de conocimientos. Por favor, confírmame que lo has recibido y estás listo para responder preguntas sobre él.`
          });
        }

      } catch (error) {
        toast({
          title: "Error al subir archivo",
          description: error instanceof Error ? error.message : "Error desconocido",
          variant: "destructive"
        });
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 w-full">
      <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-[#1a1a1a]/90 backdrop-blur-md p-2 rounded-xl border border-[#2a2a2a] focus-within:border-[#0891b2]/50 transition-colors shadow-lg">
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange}
          accept=".pdf,.txt,.md,.xls,.xlsx"
          disabled={isUploading || isLoading}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 text-[#71717a] hover:text-[#f5f5f5] hover:bg-[#2a2a2a] h-10 w-10 rounded-lg disabled:opacity-50"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isLoading}
        >
          {isUploading ? (
            <div className="w-5 h-5 border-2 border-[#71717a] border-t-transparent rounded-full animate-spin" />
          ) : (
            <Paperclip className="w-5 h-5" />
          )}
        </Button>
        
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu mensaje..."
          className="min-h-[40px] max-h-[200px] bg-transparent border-0 focus-visible:ring-0 resize-none py-2 shadow-none text-[#f5f5f5] placeholder:text-[#71717a]"
          rows={1}
        />

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-[#71717a] hover:text-[#f5f5f5] hover:bg-[#2a2a2a] h-10 w-10 rounded-lg"
            onClick={() => {
                alert("Funcionalidad de dictado por voz en desarrollo.");
            }}
          >
            <Mic className="w-5 h-5" />
          </Button>

          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="shrink-0 rounded-lg h-10 w-10 bg-[#0891b2] hover:bg-[#0891b2]/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>
      <div className="text-center mt-2">
         <span className="text-[10px] text-[#71717a]">
            Nexus RAG puede cometer errores. Verifica la información importante.
         </span>
      </div>
    </div>
  );
}
