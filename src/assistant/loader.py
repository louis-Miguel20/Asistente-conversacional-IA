from typing import Optional
import os

def read_text_file(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def read_pdf_file(path: str) -> str:
    try:
        from PyPDF2 import PdfReader
    except Exception as e:
        raise RuntimeError("PyPDF2 no está instalado") from e
    reader = PdfReader(path)
    pages = []
    for p in reader.pages:
        pages.append(p.extract_text() or "")
    return "\n\n".join(pages)

def load_procedures_text(pdf_path: Optional[str] = None, text_path: Optional[str] = None) -> str:
    if text_path and os.path.exists(text_path):
        return read_text_file(text_path)
    if pdf_path and os.path.exists(pdf_path):
        return read_pdf_file(pdf_path)
    raise FileNotFoundError("No se encontró archivo de procedimientos (PDF o texto).")
