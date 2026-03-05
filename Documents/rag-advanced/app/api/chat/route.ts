import { openai } from "@ai-sdk/openai";
import { streamText, tool, StreamData } from "ai";
import { z } from "zod";
import { vectorStore } from "@/lib/rag/retrieval";
import { formatContext } from "@/lib/rag/context";

// Configuración de tiempo máximo de ejecución para streaming (30 segundos)
export const maxDuration = 30;

/**
 * Endpoint POST principal para el chat RAG.
 * Maneja la comunicación entre el frontend y el modelo de IA (OpenAI).
 * Implementa el patrón "Tool Calling" para permitir que el modelo decida cuándo buscar información.
 */
export async function POST(req: Request) {
  // Extraer el historial de mensajes de la solicitud
  const { messages } = await req.json();

  // Inicializar StreamData para enviar metadatos adicionales (fuentes) al frontend
  const data = new StreamData();

  // Iniciar el streaming de texto con el modelo configurado
  const result = streamText({
    model: openai("gpt-4o"), // Modelo de lenguaje a utilizar
    messages, // Historial de conversación
    // Prompt del sistema que define la personalidad y restricciones del asistente
    system: `Eres un experto analista de documentos. Tu objetivo es ayudar al usuario a entender la información contenida en sus documentos.
    
    INSTRUCCIONES:
    1. Tienes acceso a una base de conocimientos mediante la herramienta 'retrieveInformation'.
    2. SIEMPRE usa 'retrieveInformation' cuando el usuario haga una pregunta, incluso si parece general.
    3. Responde basándote EXCLUSIVAMENTE en la información recuperada.
    4. Si la información recuperada no contiene la respuesta, di claramente: "No encuentro esa información en los documentos proporcionados."
    5. No inventes respuestas. No uses tu conocimiento general si contradice o no está en el documento.
    6. Sé conciso y directo.
    
    IMPORTANTE: Si el usuario te saluda o hace preguntas triviales (como "hola", "¿qué puedes hacer?"), responde amablemente explicando tu capacidad para analizar sus documentos, pero NO intentes inventar información.
    `,
    maxSteps: 5, // Permitir ejecución de múltiples pasos (Modelo -> Herramienta -> Modelo)
    tools: {
      // Definición de la herramienta de recuperación (RAG)
      retrieveInformation: tool({
        description: "Recuperar información relevante de la base de conocimientos para responder la pregunta del usuario.",
        parameters: z.object({
          query: z.string().describe("La consulta de búsqueda para encontrar documentos relevantes."),
        }),
        // Lógica de ejecución de la herramienta
        execute: async ({ query }) => {
          try {
            console.log(`Buscando: ${query}`);
            const startTime = Date.now();
            // Búsqueda semántica en la base de vectores
            const docs = await vectorStore.search(query);
            const duration = Date.now() - startTime;
            
            // Enviar los documentos recuperados al frontend a través del StreamData
            // Esto permite mostrar las fuentes en la UI
            if (docs && docs.length > 0) {
              data.append({
                type: 'sources',
                sources: docs.map(doc => ({
                  documentTitle: doc.metadata.source || "Documento sin título",
                  title: doc.metadata.source || "Documento sin título",
                  content: doc.pageContent,
                  similarity: doc.metadata.similarity,
                  page: doc.metadata.page,
                  url: doc.metadata.url
                }))
              });
            }

            // Enviar traza de ejecución
            data.append({
              type: 'trace',
              trace: {
                step: 'retrieval',
                query: query,
                latency: duration,
                resultCount: docs.length,
                timestamp: new Date().toISOString()
              }
            });

            // Formateo de los documentos recuperados para el contexto del LLM
            const formatted = formatContext(docs);
            return formatted.text || "No se encontró información relevante.";
          } catch (error) {
            console.error("Error de recuperación:", error);
            return "Error al recuperar información.";
          }
        },
      }),
    },
    onFinish: () => {
      data.close();
    },
  });

  // Devolver la respuesta como un flujo de datos (stream) compatible con Vercel AI SDK
  return result.toDataStreamResponse({ data });
}
