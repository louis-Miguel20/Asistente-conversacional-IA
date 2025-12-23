from typing import Dict, Any, List, Optional
import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import shutil
from uuid import uuid4
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from src.assistant.rag_pipeline import answer_question, RAGConfig

# Cargar variables de entorno
load_dotenv()

# Inicializar FastAPI
app = FastAPI(title="Asistente Conversacional RAG API")

# Montar carpeta estática para el frontend
# Asegúrate de que la carpeta existe antes de montar
static_path = Path("src/api/static")
static_path.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory="src/api/static"), name="static")


@app.get("/")
async def read_index():
    return FileResponse("src/api/static/index.html")


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Sube un archivo a la carpeta uploads para ser usado como contexto.
    """
    try:
        uploads_dir = Path("uploads")
        uploads_dir.mkdir(exist_ok=True)

        file_location = uploads_dir / file.filename
        with open(file_location, "wb") as f:
            shutil.copyfileobj(file.file, f)

        return {"filename": file.filename, "status": "uploaded"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al subir archivo: {str(e)}")


# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Modelo de entrada
class AskRequest(BaseModel):
    question: str
    filename: Optional[str] = None


@app.get("/health")
def health() -> Dict[str, str]:
    """
    Endpoint de verificación de salud del servicio.
    Devuelve {"status": "ok"} para verificar que el servicio corre.
    """
    return {"status": "ok"}


@app.post("/ask")
def ask(body: AskRequest) -> Dict[str, Any]:
    """
    Endpoint para realizar preguntas al asistente.

    - Recibe: {"question": "...", "filename": "doc.pdf"}
    - Si no se envía filename, se asume conversación general sin documento.
    """
    try:
        # 1. Determinar el documento a usar
        pdf_path = None
        text_path = None

        # Prioridad 1: Filename enviado explícitamente por el cliente
        if body.filename:
            uploads_dir = Path("uploads")
            file_path = uploads_dir / body.filename
            if file_path.exists():
                if file_path.suffix.lower() == ".pdf":
                    pdf_path = str(file_path)
                elif file_path.suffix.lower() == ".txt":
                    text_path = str(file_path)

        # Prioridad 2: Variables de entorno (solo si no se envió filename explícito)
        # Esto permite mantener retrocompatibilidad o configurar documentos fijos si se desea.
        if not pdf_path and not text_path and not body.filename:
            pdf_path = os.getenv("PROCEDURES_PDF_PATH")
            text_path = os.getenv("PROCEDURES_TEXT_PATH")

        # NOTA: Ya no buscamos automáticamente en "uploads/" al azar.
        # Si no hay documento, pdf_path y text_path serán None.
        # RAGConfig aceptará None, y answer_question manejará el modo "Charla General".

        # 2. Configurar el pipeline RAG
        cfg = RAGConfig(
            pdf_path=pdf_path,
            text_path=text_path,
            chunk_size=int(os.getenv("CHUNK_SIZE", "400")),
            chunk_overlap=int(os.getenv("CHUNK_OVERLAP", "80")),
            use_embeddings=os.getenv("USE_EMBEDDINGS", "true").lower() == "true",
        )

        # 3. Llamar a la lógica del agente
        if os.getenv("DISABLE_LLM", "false").lower() == "true":
            # Modo demo
            result = answer_question(
                body.question,
                cfg,
                llm=lambda p: "Respuesta simulada (LLM deshabilitado).",
            )
        else:
            result = answer_question(body.question, cfg)

        # 4. Retornar respuesta formateada
        return {
            "answer": result.get("answer", "No se pudo generar respuesta."),
            "context": result.get("context_used", []),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error interno del servidor: {str(e)}"
        )
