from typing import Optional
import os
from pathlib import Path


def read_text_file(path: str) -> str:
    """
    Lee un archivo de texto plano en UTF-8.
    """
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(f"No existe: {path}")
    return p.read_text(encoding="utf-8")


def read_pdf_file(path: str) -> str:
    """
    Extrae texto de un PDF. Intenta PyPDF2 y, si falla o devuelve vacío,
    usa pdfminer.six como alternativa.
    """
    # Intento con PyPDF2
    try:
        from PyPDF2 import PdfReader

        reader = PdfReader(path)
        pages = []
        for p in reader.pages:
            pages.append(p.extract_text() or "")
        text = "\n\n".join(pages).strip()
        if text:
            return text
    except Exception:
        pass
    # Fallback con pdfminer.six
    try:
        from pdfminer.high_level import extract_text

        text = extract_text(path) or ""
        return text
    except Exception as e:
        raise RuntimeError("No fue posible extraer texto del PDF") from e


def load_procedures_text(
    pdf_path: Optional[str] = None, text_path: Optional[str] = None
) -> str:
    """
    Carga el texto de procedimientos desde PDF o TXT según parámetros.
    Prioriza `text_path` si está definido y existe; si no, intenta `pdf_path`.
    """
    if text_path and os.path.exists(text_path):
        return read_text_file(text_path)
    if pdf_path and os.path.exists(pdf_path):
        return read_pdf_file(pdf_path)
    raise FileNotFoundError("No se encontró archivo de procedimientos (PDF o texto).")
