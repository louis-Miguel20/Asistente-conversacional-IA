import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDB() {
  const client = await pool.connect();
  try {
    console.log("Iniciando configuración de la base de datos...");

    // 1. Habilitar extensión vector
    await client.query('CREATE EXTENSION IF NOT EXISTS vector');
    console.log("✅ Extensión 'vector' habilitada.");

    // 2. Crear tabla documents si no existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        metadata JSONB,
        embedding vector(1536)
      );
    `);
    console.log("✅ Tabla 'documents' verificada.");

    // 3. Crear índice HNSW para búsquedas rápidas (opcional pero recomendado)
    // Nota: Requiere datos para ser efectivo, pero se puede crear vacío.
    // Usamos IF NOT EXISTS para evitar errores.
    await client.query(`
      CREATE INDEX IF NOT EXISTS documents_embedding_idx 
      ON documents 
      USING hnsw (embedding vector_cosine_ops);
    `);
    console.log("✅ Índice HNSW creado.");

  } catch (error) {
    console.error("❌ Error inicializando la base de datos:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

initDB();
