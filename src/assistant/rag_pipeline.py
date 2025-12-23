from typing import List, Optional, Dict, Callable
import os
from dataclasses import dataclass
from .loader import load_procedures_text
from .langchain_agent import build_splits, build_retriever, RetrievalConfig


@dataclass
class RAGConfig:
    """
    Configuración del pipeline RAG:
    - chunk_size/overlap: parámetros de chunking
    - use_embeddings: activa FAISS/HuggingFace
    - k: número de documentos relevantes
    - min_signal_tokens: umbral mínimo de coincidencias para evitar alucinaciones
    - pdf_path/text_path: rutas del documento
    """

    chunk_size: int = 400
    chunk_overlap: int = 80
    use_embeddings: bool = True
    k: int = 4
    min_signal_tokens: int = 1
    pdf_path: Optional[str] = None
    text_path: Optional[str] = None


def tokenize(s: str) -> List[str]:
    """
    Tokeniza una cadena en términos simples en minúsculas.
    """
    return [t.lower() for t in s.split() if len(t) > 2]


def score_signal(query: str, contexts: List[str]) -> int:
    """
    Calcula una señal de coincidencia entre query y contextos.
    """
    qt = tokenize(query)
    if not qt:
        return 0
    total = 0
    for c in contexts:
        cl = c.lower()
        for t in qt:
            total += cl.count(t)
    return total


def build_contexts(text: str, cfg: RAGConfig) -> List[str]:
    """
    Construye chunks sin recuperación (útil para depuración).
    """
    chunks = build_splits(
        text, chunk_size=cfg.chunk_size, chunk_overlap=cfg.chunk_overlap
    )
    retriever = build_retriever(chunks, None)
    retriever.k = cfg.k
    docs = retriever.get_relevant_documents(" ")
    return chunks


def retrieve(text: str, query: str, cfg: RAGConfig) -> List[str]:
    """
    Recupera los chunks más relevantes para una consulta dada.
    """
    chunks = build_splits(
        text, chunk_size=cfg.chunk_size, chunk_overlap=cfg.chunk_overlap
    )
    if not chunks:
        return []

    ret_cfg = RetrievalConfig(use_embeddings=cfg.use_embeddings, k=cfg.k)
    retriever = build_retriever(chunks, ret_cfg)

    if not retriever:
        # Alternativa si falla la creación del recuperador (ej. documentos vacíos)
        return chunks[: cfg.k]

    docs = retriever.get_relevant_documents(query)
    return [getattr(d, "page_content", str(d)) for d in docs]


def build_prompt(contexts: List[str], question: str) -> str:
    """
    Construye un prompt con contexto y la pregunta, guiando al LLM.
    """
    head = "Responde usando solo el contexto y evita alucinaciones.\n\n"
    ctx = "\n\n---\n\n".join(contexts)
    return f"{head}Contexto:\n{ctx}\n\nPregunta:\n{question}\n\nRespuesta:"


def call_llm_openai(prompt: str, model: str = "gpt-5-nano") -> str:
    """
    Invoca el modelo de OpenAI y devuelve el contenido textual de la respuesta.
    """
    key = os.getenv("OPENAI_API_KEY", "")
    if not key:
        return "No hay clave de OpenAI configurada."
    try:
        from openai import OpenAI

        client = OpenAI(api_key=key)
        mdl = os.getenv("OPENAI_MODEL", model)
        try:
            res = client.chat.completions.create(
                model=mdl,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
            )
        except Exception as e:
            fb = os.getenv("OPENAI_FALLBACK_MODEL", "gpt-4o-mini")
            try:
                res = client.chat.completions.create(
                    model=fb,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.2,
                )
            except Exception as e2:
                demo = os.getenv("LLM_FALLBACK_DEMO", "false").lower() == "true"
                return (
                    "Respuesta demo basada en contexto"
                    if demo
                    else f"Error al llamar al modelo: {str(e2) or str(e)}"
                )
        return res.choices[0].message.content or ""
    except Exception as e:
        return f"Error al llamar al modelo: {str(e)}"


def answer_question(
    query: str,
    cfg: Optional[RAGConfig] = None,
    llm: Optional[Callable[[str], str]] = None,
) -> Dict[str, object]:
    """
    Orquesta el pipeline RAG completo y retorna respuesta y contexto usado.
    """
    cfg = cfg or RAGConfig()
    try:
        text = load_procedures_text(pdf_path=cfg.pdf_path, text_path=cfg.text_path)
        if not text.strip():
            return {"answer": "El documento parece estar vacío.", "context_used": []}

        contexts = retrieve(text, query, cfg)

        # Si usamos embeddings, confiamos más en la recuperación semántica
        # y relajamos el chequeo de tokens exactos.
        sig = score_signal(query, contexts)
        threshold = cfg.min_signal_tokens if not cfg.use_embeddings else 0

        if not contexts or sig < threshold:
            # Fallback: intentamos responder igual si hay contexto,
            # dejando que el LLM juzgue, pero advertimos si está muy vacío.
            if not contexts:
                return {
                    "answer": "No encontré información relevante en el documento.",
                    "context_used": [],
                }

        prompt = build_prompt(contexts, query)
        if llm:
            ans = llm(prompt)
        else:
            ans = call_llm_openai(prompt)
        return {"answer": ans, "context_used": contexts}

    except FileNotFoundError:
        # Modo Conversación General (Sin Documento)
        prompt = (
            f"Eres un asistente útil y amable. El usuario NO ha cargado ningún documento. "
            f"Si te hace preguntas generales (saludos, chistes, conocimientos generales), respóndelas amablemente. "
            f"Si te pregunta sobre un documento específico, dile cortésmente que por favor lo suba primero para poder ayudarle.\n\n"
            f"Pregunta del usuario: {query}"
        )
        if llm:
            ans = llm(prompt)
        else:
            ans = call_llm_openai(prompt)
        return {"answer": ans, "context_used": []}

    except Exception as e:
        return {
            "answer": f"Ocurrió un error procesando la consulta: {str(e)}",
            "context_used": [],
        }
