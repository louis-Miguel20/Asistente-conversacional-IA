"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Upload, File, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

/**
 * Componente para subir y procesar documentos (PDF, DOCX).
 * Maneja la selección de archivos, arrastrar y soltar (drag & drop),
 * y muestra el progreso de la carga.
 */
export function DocumentUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  // Manejador para selección de archivo mediante input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Manejador para soltar archivos (Drag & Drop)
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  /**
   * Procesa la subida del archivo al servidor para su ingestión.
   * Envía el archivo al endpoint /api/ingest.
   */
  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setProgress(10); // Iniciar barra de progreso

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Simulación de progreso visual mientras el servidor procesa
      const interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const res = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);
      setProgress(100);

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error uploading file");
      }

      toast({
        title: "Documento ingestado",
        description: `El archivo ${file.name} se ha procesado correctamente.`,
      });
      
      setFile(null);
      // Recargar la página para actualizar la lista de documentos
      window.location.reload(); 

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
      setProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" /> Subir Documento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
            className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-upload")?.click()}
        >
            <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                accept=".pdf,.docx" 
                onChange={handleFileChange}
            />
            
            {file ? (
                <div className="flex flex-col items-center gap-2">
                    <File className="w-10 h-10 text-primary" />
                    <span className="font-medium text-sm">{file.name}</span>
                    <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2 text-destructive hover:text-destructive"
                        onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                        }}
                    >
                        <X className="w-4 h-4 mr-1" /> Eliminar
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="w-10 h-10 mb-2" />
                    <span className="font-medium">Arrastra un PDF o Word aquí</span>
                    <span className="text-xs">o haz clic para seleccionar</span>
                </div>
            )}
        </div>

        {isUploading && (
            <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs">
                    <span>Procesando...</span>
                    <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>
        )}

        <Button 
            className="w-full mt-4" 
            disabled={!file || isUploading}
            onClick={handleUpload}
        >
            {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {isUploading ? "Ingestando..." : "Ingestar Documento"}
        </Button>
      </CardContent>
    </Card>
  );
}
