import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileText } from "lucide-react";

/**
 * Estructura de una fuente/cita recuperada por el sistema RAG
 */
interface Source {
  /** Título del documento de origen */
  documentTitle: string;
  /** Fragmento de texto recuperado */
  content: string;
  /** Puntuación de similitud semántica (0-1) */
  similarity: number;
  /** Índice del chunk dentro del documento original */
  chunkIndex: number;
}

interface SourceCitationsProps {
  /** Lista de fuentes a mostrar */
  sources: Source[];
}

/**
 * Componente que muestra las fuentes consultadas en un acordeón desplegable.
 * Útil para dar transparencia sobre de dónde obtuvo la información la IA.
 */
export function SourceCitations({ sources }: SourceCitationsProps) {
  // Si no hay fuentes, no renderizar nada
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-2 w-full max-w-full">
      {/* Acordeón para ocultar/mostrar las fuentes y no saturar la UI */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="sources" className="border rounded-lg px-3 py-1 bg-background/50">
          {/* Encabezado del acordeón con el número de fuentes */}
          <AccordionTrigger className="text-xs py-2 text-muted-foreground hover:no-underline">
            <div className="flex items-center gap-2">
              <FileText className="w-3 h-3" />
              <span>{sources.length} fuentes consultadas</span>
            </div>
          </AccordionTrigger>
          
          {/* Contenido detallado de cada fuente */}
          <AccordionContent>
            <div className="space-y-3 pt-2 pb-3">
              {sources.map((source, idx) => (
                <div key={idx} className="text-xs border-l-2 border-primary/20 pl-3">
                  <div className="font-semibold text-foreground mb-1">
                    {source.documentTitle} <span className="text-muted-foreground font-normal">(Chunk {source.chunkIndex})</span>
                  </div>
                  {/* Fragmento de texto citado */}
                  <div className="text-muted-foreground line-clamp-3 italic">
                    &quot;{source.content}&quot;
                  </div>
                  {/* Indicador de relevancia/similitud */}
                  <div className="mt-1 text-[10px] text-muted-foreground">
                    Relevancia: {Math.round(source.similarity * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
