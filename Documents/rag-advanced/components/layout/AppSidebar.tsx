"use client";

import { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  Plus, 
  Database, 
  Brain, 
  LayoutGrid,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AppSidebar() {
  const [topK, setTopK] = useState(5);
  const [creativity, setCreativity] = useState(0.7);
  const [documents, setDocuments] = useState<{id: string, name: string}[]>([]);

  // Efecto para cargar documentos al inicio
  useEffect(() => {
    fetchDocuments();
    
    // Escuchar evento de actualización si se implementa
    window.addEventListener('document-uploaded', fetchDocuments);
    return () => window.removeEventListener('document-uploaded', fetchDocuments);
  }, []);

  async function fetchDocuments() {
    try {
      const res = await fetch('/api/documents');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  }

  return (
    <div className="w-[280px] bg-[#111111] border-r border-[#2a2a2a] flex flex-col h-full text-[#f5f5f5] shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-[#2a2a2a] flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-[#0891b2] to-[#06b6d4] flex items-center justify-center shadow-lg shadow-[#0891b2]/20">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight">Nexus RAG</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          
          {/* Espacio de Trabajo */}
          <section>
            <h3 className="text-xs font-semibold text-[#71717a] uppercase tracking-wider mb-3 px-1">
              Espacio de Trabajo
            </h3>
            <Button variant="outline" className="w-full justify-between bg-[#1a1a1a] border-[#2a2a2a] text-[#f5f5f5] hover:bg-[#2a2a2a] hover:text-white font-normal">
              <span className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-[#0891b2]" />
                Mi Espacio
              </span>
              <ChevronDown className="w-4 h-4 opacity-50" />
            </Button>
          </section>

          {/* Bases de Conocimiento */}
          <section>
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-xs font-semibold text-[#71717a] uppercase tracking-wider">
                Bases de Conocimiento
              </h3>
            </div>
            <div className="space-y-1 mb-3">
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-[#1a1a1a] cursor-pointer transition-colors text-[#71717a] hover:text-[#f5f5f5]">
                    <div className="flex items-center gap-2 truncate">
                      <Database className="w-4 h-4 shrink-0" />
                      <span className="text-sm truncate" title={doc.name}>{doc.name}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-[#71717a] italic">
                  No hay documentos
                </div>
              )}
            </div>
            <Button variant="ghost" className="w-full justify-start text-[#0891b2] hover:text-[#0891b2] hover:bg-[#0891b2]/10 h-8 text-xs font-medium px-2" onClick={() => {
                const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                if (fileInput) fileInput.click();
            }}>
              <Plus className="w-3 h-3 mr-2" />
              Agregar nueva fuente
            </Button>
          </section>

          {/* Configuración RAG */}
          <section className="space-y-4 pt-4 border-t border-[#2a2a2a]">
            <h3 className="text-xs font-semibold text-[#71717a] uppercase tracking-wider px-1">
              Configuración RAG
            </h3>
            
            {/* Top-K Slider */}
            <div className="space-y-3 px-1">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#d4d4d8]">Top-K</span>
                <span className="font-mono text-[#0891b2] bg-[#0891b2]/10 px-1.5 rounded text-xs">{topK}</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="20" 
                value={topK}
                onChange={(e) => setTopK(parseInt(e.target.value))}
                className="w-full h-1.5 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-[#22c55e]"
                style={{accentColor: '#22c55e'}}
              />
            </div>

            {/* Creatividad Slider */}
            <div className="space-y-3 px-1">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#d4d4d8]">Creatividad</span>
                <span className="font-mono text-[#0891b2] bg-[#0891b2]/10 px-1.5 rounded text-xs">{creativity}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1"
                value={creativity}
                onChange={(e) => setCreativity(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-[#22c55e]"
                style={{accentColor: '#22c55e'}}
              />
            </div>

            {/* Dropdowns */}
            <div className="space-y-3 px-1">
              <div className="space-y-1.5">
                <label className="text-xs text-[#71717a]">Modelo</label>
                <Button variant="outline" className="w-full justify-between bg-[#1a1a1a] border-[#2a2a2a] text-[#f5f5f5] h-9 text-xs font-normal hover:bg-[#2a2a2a] hover:text-white">
                  <span>GPT-4o</span>
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </Button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#71717a]">Estrategia de búsqueda</label>
                <Button variant="outline" className="w-full justify-between bg-[#1a1a1a] border-[#2a2a2a] text-[#f5f5f5] h-9 text-xs font-normal hover:bg-[#2a2a2a] hover:text-white">
                  <span className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-[#eab308]" />
                    Híbrida
                  </span>
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </Button>
              </div>
            </div>
          </section>

        </div>
      </ScrollArea>
    </div>
  );
}
