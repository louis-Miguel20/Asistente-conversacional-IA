"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Globe, Link as LinkIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function UrlIngester() {
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleIngest = async () => {
    if (!url) return;
    
    // Basic validation
    try {
        new URL(url);
    } catch {
        toast({
            title: "Error",
            description: "URL inválida",
            variant: "destructive"
        });
        return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("url", url);

      const res = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error ingesting URL");
      }

      toast({
        title: "URL ingestada",
        description: `La página ${url} se ha procesado correctamente.`,
      });
      
      setUrl("");
      window.location.reload();

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" /> Ingestar URL
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
            <div className="relative">
                <LinkIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                    placeholder="https://ejemplo.com/articulo" 
                    className="pl-9"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isProcessing}
                />
            </div>
            <p className="text-xs text-muted-foreground">
                Extraeremos el contenido principal de la página web.
            </p>
        </div>

        <Button 
            className="w-full" 
            disabled={!url || isProcessing}
            onClick={handleIngest}
        >
            {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {isProcessing ? "Procesando URL..." : "Ingestar URL"}
        </Button>
      </CardContent>
    </Card>
  );
}
