"use client";

import { useEffect, useState } from "react";
import { DocumentStatusBadge } from "./DocumentStatusBadge";
import { Button } from "@/components/ui/button";
import { Trash2, FileText, Globe } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface Document {
  id: string;
  title: string;
  sourceType: string;
  chunkCount: number;
  status: string;
  createdAt: string;
}

/**
 * Componente que muestra la lista de documentos ingestados en el sistema.
 * Permite visualizar el estado y eliminar documentos.
 */
export function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Cargar documentos al montar el componente
  useEffect(() => {
    fetchDocuments();
  }, []);

  /**
   * Obtiene la lista de documentos desde la API.
   */
  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setDocuments(data);
    } catch (error) {
      console.error("Failed to fetch documents", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Elimina un documento por su ID.
   * Solicita confirmación antes de proceder.
   * @param id ID del documento a eliminar
   */
  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este documento?")) return;
    
    try {
      const res = await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      
      // Actualizar estado local eliminando el documento borrado
      setDocuments(documents.filter(d => d.id !== id));
      toast({
        title: "Documento eliminado",
        description: "El documento ha sido eliminado correctamente."
      });
    } catch {
        toast({
            title: "Error",
            description: "Error al eliminar documento",
            variant: "destructive"
        });
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center py-10 text-muted-foreground">
            <span className="animate-pulse">Cargando documentos...</span>
        </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground font-medium border-b border-border">
            <tr>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Chunks</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
            {documents.length === 0 ? (
                <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                        <FileText className="w-8 h-8 opacity-20" />
                        <p>No hay documentos ingestados aún.</p>
                    </div>
                </td>
                </tr>
            ) : (
                documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-secondary/30 transition-colors group">
                    <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-3">
                            {doc.sourceType === "URL" ? (
                                <div className="p-2 bg-blue-500/10 rounded-md text-blue-500">
                                    <Globe className="w-4 h-4" />
                                </div>
                            ) : (
                                <div className="p-2 bg-orange-500/10 rounded-md text-orange-500">
                                    <FileText className="w-4 h-4" />
                                </div>
                            )}
                            <div className="flex flex-col">
                                <span className="truncate max-w-[200px] font-medium" title={doc.title}>{doc.title}</span>
                                <span className="text-[10px] text-muted-foreground uppercase">{doc.sourceType}</span>
                            </div>
                        </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{doc.sourceType}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                        <span className="bg-secondary px-2 py-0.5 rounded text-xs">{doc.chunkCount}</span>
                    </td>
                    <td className="px-4 py-3">
                        <DocumentStatusBadge status={doc.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {format(new Date(doc.createdAt), "d MMM, HH:mm", { locale: es })}
                    </td>
                    <td className="px-4 py-3 text-right">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                            onClick={() => handleDelete(doc.id)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </td>
                </tr>
                ))
            )}
            </tbody>
        </table>
      </div>
    </div>
  );
}
