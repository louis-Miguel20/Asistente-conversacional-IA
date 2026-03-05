import { Document } from "langchain/document";

export interface ContextResult {
  text: string;
  sources: string[];
}

/**
 * Formatea los documentos recuperados en un contexto claro para el LLM.
 * Sigue principios de Context Engineering para maximizar la atención del modelo.
 * Utiliza etiquetas XML para delimitar claramente cada documento y su contenido.
 * 
 * @param documents - Lista de documentos recuperados por el vector store.
 * @returns Objeto con el texto formateado y la lista de fuentes únicas.
 */
export function formatContext(documents: Document[]): ContextResult {
  if (!documents || documents.length === 0) {
    return { text: "", sources: [] };
  }

  // Extraer fuentes únicas para referencia
  const sources = Array.from(new Set(documents.map(d => d.metadata.source || "Unknown")));

  // Formatear cada documento con delimitadores claros
  const formattedDocs = documents.map((doc, index) => {
    const source = doc.metadata.source ? `Source: ${doc.metadata.source}` : "";
    const page = doc.metadata.page ? `Page: ${doc.metadata.page}` : "";
    const meta = [source, page].filter(Boolean).join(" | ");
    
    return `<document index="${index + 1}">
${meta ? `<metadata>${meta}</metadata>\n` : ""}<content>
${doc.pageContent}
</content>
</document>`;
  });

  return {
    text: formattedDocs.join("\n\n"),
    sources
  };
}

/**
 * Construye el prompt del sistema inyectando el contexto recuperado.
 * (Nota: Esta función puede no ser necesaria si se usa el patrón de "Tools" donde el contexto
 * se inyecta como resultado de una herramienta, pero es útil para RAG simple).
 */
export function buildSystemPrompt(context: string): string {
  return `Eres un asistente útil para el Sistema RAG Avanzado.
Usa el siguiente contexto para responder la pregunta del usuario.
Si la respuesta no está en el contexto, di que no lo sabes.

<context>
${context}
</context>

Responde la pregunta del usuario basándote SOLO en el contexto anterior.`;
}
