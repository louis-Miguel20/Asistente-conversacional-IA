from typing import List, Optional, Tuple
import os
import re
from dataclasses import dataclass
from langchain_text_splitters import RecursiveCharacterTextSplitter, TokenTextSplitter
from langchain_community.retrievers import BM25Retriever
from langchain_community.vectorstores import FAISS


def detect_chunk_params(procedures_text: str) -> Tuple[int, int]:
    """
    Detecta parámetros de chunking (size y overlap) buscando pistas en el texto.
    """
    text = procedures_text.lower()
    size = None
    overlap = None
    m_size = re.search(
        r"(chunk[_\s-]?size|tamañ[o]?\s+de\s+chunk|tamaño\s+del\s+bloque)\D?(\d{2,5})",
        text,
    )
    m_overlap = re.search(r"(overlap|solapamiento)\D?(\d{1,4})", text)
    if m_size:
        try:
            size = int(m_size.group(2))
        except Exception:
            pass
    if m_overlap:
        try:
            overlap = int(m_overlap.group(2))
        except Exception:
            pass
    return (size or 800, overlap or 100)


def build_splits(
    procedures_text: str,
    chunk_size: Optional[int] = None,
    chunk_overlap: Optional[int] = None,
) -> List[str]:
    """
    Genera chunks del documento usando tokenización o separación por caracteres.
    """
    if chunk_size is None or chunk_overlap is None:
        auto_size, auto_overlap = detect_chunk_params(procedures_text)
        chunk_size = chunk_size or auto_size
        chunk_overlap = chunk_overlap or auto_overlap
    use_tokens = "token" in procedures_text.lower()
    if use_tokens:
        splitter = TokenTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    else:
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""],
        )
    return [c.page_content for c in splitter.create_documents([procedures_text])]


@dataclass
class RetrievalConfig:
    """
    Configuración para el mecanismo de recuperación.
    """

    use_embeddings: bool = False
    embeddings_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    k: int = 4


def build_retriever(chunks: List[str], config: Optional[RetrievalConfig] = None):
    """
    Construye un recuperador BM25 o FAISS según configuración.
    """
    if not chunks:
        # Evitar división por cero o errores de índice vacío
        return None

    config = config or RetrievalConfig()
    if config.use_embeddings:
        try:
            from langchain_community.embeddings import HuggingFaceEmbeddings

            embs = HuggingFaceEmbeddings(model_name=config.embeddings_model)
            docs = [{"page_content": c} for c in chunks]
            vs = FAISS.from_dicts(docs, embs, text_key="page_content")
            return vs.as_retriever(search_kwargs={"k": config.k})
        except Exception:
            # Alternativa a BM25 si fallan los embeddings
            pass

    try:
        retr = BM25Retriever.from_texts(chunks)
        retr.k = config.k
        return retr
    except Exception:
        return None


def answer_query(
    procedures_text: str,
    query: str,
    chunk_size: Optional[int] = None,
    chunk_overlap: Optional[int] = None,
    use_embeddings: bool = False,
) -> str:
    """
    Recupera los chunks más relevantes para la consulta y los concatena.
    """
    chunks = build_splits(procedures_text, chunk_size, chunk_overlap)
    retriever = build_retriever(chunks, RetrievalConfig(use_embeddings=use_embeddings))
    docs = retriever.get_relevant_documents(query)
    if not docs:
        return chunks[0] if chunks else procedures_text
    top = "\n\n---\n\n".join([getattr(d, "page_content", str(d)) for d in docs])
    return top
