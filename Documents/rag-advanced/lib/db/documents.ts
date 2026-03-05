import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export interface Document {
  id: string;
  name: string;
  chunkCount: number;
  createdAt: Date;
}

/**
 * Obtiene la lista de documentos únicos basándose en los metadatos almacenados.
 * Agrupa por la clave 'source' en el metadata.
 */
export async function getDocuments(): Promise<Document[]> {
  const client = await pool.connect();
  try {
    // Consulta para agrupar documentos por nombre de archivo (source)
    const result = await client.query(`
      SELECT 
        metadata->>'source' as name,
        COUNT(*) as "chunkCount",
        MIN(metadata->>'uploadedAt') as "createdAt"
      FROM documents
      WHERE metadata->>'source' IS NOT NULL
      GROUP BY metadata->>'source'
      ORDER BY "createdAt" DESC
    `);

    return result.rows.map((row, index) => ({
      id: row.name, // Usamos el nombre como ID temporalmente
      name: row.name,
      chunkCount: parseInt(row.chunkCount),
      createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
    }));
  } catch (error) {
    console.error("Error al obtener documentos:", error);
    return [];
  } finally {
    client.release();
  }
}

/**
 * Elimina un documento (todos sus fragmentos) basado en su nombre de fuente.
 */
export async function deleteDocument(id: string): Promise<void> {
  const client = await pool.connect();
  try {
    // El ID aquí es el nombre del archivo (source)
    await client.query(`
      DELETE FROM documents
      WHERE metadata->>'source' = $1
    `, [id]);
  } catch (error) {
    console.error("Error al eliminar documento:", error);
    throw error;
  } finally {
    client.release();
  }
}

// Funciones legacy eliminadas para evitar confusión con el esquema simple actual
export async function createDocument(data: any) { console.warn("Legacy createDocument called but ignored"); return null; }
export async function updateDocumentStatus(id: string, status: any) { console.warn("Legacy updateDocumentStatus called but ignored"); return null; }
export async function createDocumentChunk(data: any) { console.warn("Legacy createDocumentChunk called but ignored"); return null; }
