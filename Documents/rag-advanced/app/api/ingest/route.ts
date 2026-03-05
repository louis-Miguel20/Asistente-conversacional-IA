import { NextRequest, NextResponse } from "next/server";
import { splitter } from "@/lib/rag/chunking";
import { vectorStore } from "@/lib/rag/retrieval";
import pdf from "pdf-parse";
import * as XLSX from "xlsx";

/**
 * Ruta de ingestión de documentos (POST).
 * Recibe archivos (PDF, Excel, texto) o texto plano, extrae el contenido,
 * lo divide en fragmentos (chunks) y los almacena en la base de vectores.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const text = formData.get("text") as string;

    // Validación básica de entrada
    if (!file && !text) {
      return NextResponse.json(
        { error: "No se proporcionó archivo ni texto" },
        { status: 400 }
      );
    }

    let content = "";
    let source = "entrada-texto";

    // Procesamiento de archivo si existe
    if (file) {
      source = file.name;
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      // Extracción de texto específica para PDFs
      if (file.type === "application/pdf" || fileExtension === "pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const data = await pdf(buffer);
        content = data.text;
      } 
      // Extracción de texto para Excel
      else if (fileExtension === "xls" || fileExtension === "xlsx") {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const workbook = XLSX.read(buffer, { type: "buffer" });
        
        // Iterar sobre todas las hojas y extraer texto
        content = workbook.SheetNames.map(sheetName => {
          const sheet = workbook.Sheets[sheetName];
          return `--- Hoja: ${sheetName} ---\n` + XLSX.utils.sheet_to_csv(sheet);
        }).join("\n\n");
      }
      else {
        // Manejo básico para archivos de texto plano (.txt, .md, etc.)
        content = await file.text();
      }
    } else {
      content = text;
    }

    // Validación de contenido extraído
    if (!content || content.trim().length === 0) {
       return NextResponse.json(
        { error: "El contenido del archivo está vacío o no se pudo leer." },
        { status: 400 }
      );
    }

    // 1. Chunking: División del texto en fragmentos manejables
    const docs = await splitter.createDocuments(
      [content],
      [{ source, uploadedAt: new Date().toISOString() }]
    );

    // 2. Indexación: Generación de embeddings y almacenamiento en vector store
    await vectorStore.addDocuments(docs);

    return NextResponse.json({
      success: true,
      message: `Se ingestaron ${docs.length} fragmentos desde ${source}`,
      source: source,
    });

  } catch (error) {
    console.error("Error de ingestión:", error);
    return NextResponse.json(
      { error: "Falló la ingestión del documento: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
