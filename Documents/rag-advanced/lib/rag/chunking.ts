import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";

// Configuración optimizada para RAG general
// Chunk size 1000 es un buen punto de partida para mantener contexto
// Overlap 200 (20%) ayuda a evitar cortar frases importantes en los bordes
const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_CHUNK_OVERLAP = 200;

/**
 * Instancia del divisor de texto (Text Splitter) de LangChain.
 * Utiliza división recursiva por caracteres para mantener la coherencia semántica.
 * Intenta dividir primero por párrafos, luego por líneas, luego oraciones, etc.
 */
export const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: DEFAULT_CHUNK_SIZE,
  chunkOverlap: DEFAULT_CHUNK_OVERLAP,
  separators: ["\n\n", "\n", ". ", " ", ""], // Jerarquía de separación
});

/**
 * Función para dividir un texto largo en múltiples documentos más pequeños (chunks).
 * 
 * @param text - El texto completo a dividir.
 * @param metadata - Metadatos opcionales para asociar a cada chunk (origen, fecha, etc.).
 * @returns Promesa que resuelve a un array de documentos LangChain.
 */
export async function splitDocument(text: string, metadata: Record<string, unknown> = {}): Promise<Document[]> {
  try {
    const docs = await splitter.createDocuments([text], [metadata]);
    return docs;
  } catch (error) {
    console.error("Error splitting document:", error);
    throw new Error("Failed to split document");
  }
}
