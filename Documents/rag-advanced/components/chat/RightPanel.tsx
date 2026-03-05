"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Source {
  title: string;
  page?: number;
  content: string;
  similarity?: number; // 0-1
  url?: string;
}

interface Trace {
  step: string;
  query: string;
  latency: number;
  resultCount: number;
  timestamp: string;
}

interface RightPanelProps {
  sources: Source[];
  traces?: Trace[];
}

export function RightPanel({ sources = [], traces = [] }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<'sources' | 'traces'>('sources');

  // Las trazas actualmente no se usan pero se mantienen para implementación futura
  // console.log(traces);

  return (
    <div className="w-[320px] bg-[#111111] border-l border-[#2a2a2a] flex flex-col h-full shrink-0">
      <div className="flex border-b border-[#2a2a2a]">
        <button
          onClick={() => setActiveTab('sources')}
          className={cn(
            "flex-1 py-3 text-sm font-medium transition-colors border-b-2",
            activeTab === 'sources' 
              ? "border-[#0891b2] text-[#f5f5f5]" 
              : "border-transparent text-[#71717a] hover:text-[#f5f5f5]"
          )}
        >
          FUENTES
        </button>
        <button
          onClick={() => setActiveTab('traces')}
          className={cn(
            "flex-1 py-3 text-sm font-medium transition-colors border-b-2",
            activeTab === 'traces' 
              ? "border-[#0891b2] text-[#f5f5f5]" 
              : "border-transparent text-[#71717a] hover:text-[#f5f5f5]"
          )}
        >
          TRAZAS
        </button>
      </div>

      <ScrollArea className="flex-1 p-4">
        {activeTab === 'sources' ? (
          <div className="space-y-4">
            {sources.length === 0 ? (
              <div className="text-center text-[#71717a] py-8 text-sm">
                No hay fuentes recuperadas para mostrar.
              </div>
            ) : (
              sources.map((source, index) => (
                <Card key={index} className="bg-[#1a1a1a] border-[#2a2a2a] text-[#f5f5f5]">
                  <CardHeader className="p-3 pb-2 space-y-0">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-sm font-medium leading-none flex items-center gap-2 text-[#f5f5f5]">
                        <FileText className="w-3 h-3 text-[#0891b2]" />
                        <span className="truncate max-w-[140px]" title={source.title}>{source.title}</span>
                        {source.page && <span className="text-[#71717a] text-xs whitespace-nowrap">pág. {source.page}</span>}
                      </CardTitle>
                      {source.similarity !== undefined && (
                        <span className="bg-[#0891b2]/20 text-[#0891b2] text-[10px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap border border-[#0891b2]/30">
                          {Math.round(source.similarity * 100)}% Coincidencia
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-2">
                    <p className="text-xs text-[#a1a1aa] line-clamp-3 mb-2 font-mono bg-black/30 p-1.5 rounded">
                      {source.content}
                    </p>
                    <Button 
                      variant="link" 
                      className="h-auto p-0 text-[#0891b2] text-xs hover:text-[#0891b2]/80"
                      onClick={() => source.url && window.open(source.url, '_blank')}
                      disabled={!source.url}
                    >
                      Ver documento completo <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {traces.length === 0 ? (
              <div className="text-center text-[#71717a] py-8 text-sm">
                No hay trazas disponibles.
              </div>
            ) : (
              traces.map((trace: any, index: number) => (
                <Card key={index} className="bg-[#1a1a1a] border-[#2a2a2a] text-[#f5f5f5]">
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="text-sm font-medium text-[#0891b2] flex justify-between">
                      <span>Paso: {trace.step}</span>
                      <span className="text-[#71717a] text-xs">{new Date(trace.timestamp).toLocaleTimeString()}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 text-xs space-y-2">
                    <div>
                      <span className="text-[#71717a]">Query:</span>
                      <p className="font-mono bg-black/30 p-1 rounded mt-1">{trace.query}</p>
                    </div>
                    <div className="flex justify-between text-[#a1a1aa]">
                      <span>Resultados: {trace.resultCount}</span>
                      <span>Latencia: {trace.latency}ms</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
