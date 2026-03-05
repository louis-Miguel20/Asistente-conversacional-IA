-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable
CREATE TABLE "documents" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "embedding" vector(1536),

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- Grant permissions to raguser if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'raguser') THEN
    GRANT USAGE ON SCHEMA public TO raguser;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO raguser;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO raguser;
  END IF;
END
$$;
