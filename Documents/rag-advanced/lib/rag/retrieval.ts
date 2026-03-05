import { Pool } from 'pg';
import { getEmbeddings } from './embeddings';
import { Document } from "langchain/document";

// Configuración de conexión a PostgreSQL
// Se asume que la extensión 'vector' ya está habilitada en la DB
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased timeout to avoid cold start issues
});

// Force UTF-8 client encoding for Windows environments
pool.on('connect', async (client) => {
  await client.query("SET client_encoding = 'UTF8'");
});

interface SearchResult {
  id: number;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

export class VectorStore {
  private tableName = 'documents';

  /**
   * Realiza una búsqueda semántica en la base de datos utilizando pgvector.
   * Convierte la consulta en un vector y busca los documentos más cercanos (similitud coseno).
   * 
   * @param query - Texto de la consulta del usuario.
   * @param k - Número máximo de resultados a recuperar (default: 5).
   * @returns Lista de documentos LangChain con su contenido y metadatos.
   */
  async search(query: string, k: number = 5): Promise<Document[]> {
    try {
      const embedding = await getEmbeddings(query);
      const vectorStr = `[${embedding.join(',')}]`;

      // Consulta optimizada usando operador <=> (distancia coseno)
      // Requiere índice HNSW o IVFFlat para rendimiento en producción
      const sql = `
        SELECT id, content, metadata, 1 - (embedding <=> $1) as similarity
        FROM ${this.tableName}
        ORDER BY embedding <=> $1
        LIMIT $2
      `;

      const { rows } = await pool.query(sql, [vectorStr, k]);

      return rows.map((row: SearchResult) => new Document({
        pageContent: row.content,
        metadata: {
          ...row.metadata,
          id: row.id,
          similarity: row.similarity
        }
      }));

    } catch (error) {
      console.error("Error in vector search:", error);
      throw new Error("Failed to perform vector search");
    }
  }

  /**
   * Inserta nuevos documentos en la base de datos, generando sus embeddings en lotes.
   * Utiliza una transacción para asegurar consistencia.
   * 
   * @param documents - Lista de documentos a indexar.
   */
  async addDocuments(documents: Document[]): Promise<void> {
    if (documents.length === 0) return;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Procesamiento por lotes para evitar timeouts y mejorar eficiencia
      const BATCH_SIZE = 20;
      for (let i = 0; i < documents.length; i += BATCH_SIZE) {
        const batch = documents.slice(i, i + BATCH_SIZE);
        
        // Generar embeddings en paralelo para el lote actual
        const embeddingsPromises = batch.map(doc => getEmbeddings(doc.pageContent));
        const embeddings = await Promise.all(embeddingsPromises);

        for (let j = 0; j < batch.length; j++) {
          const doc = batch[j];
          const embedding = embeddings[j];
          const vectorStr = `[${embedding.join(',')}]`;
          
          const sql = `
            INSERT INTO ${this.tableName} (content, metadata, embedding)
            VALUES ($1, $2, $3)
          `;
          
          await client.query(sql, [doc.pageContent, doc.metadata, vectorStr]);
        }
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error("Error adding documents:", error);
      throw error;
    } finally {
      client.release();
    }
  }
}

export const vectorStore = new VectorStore();
