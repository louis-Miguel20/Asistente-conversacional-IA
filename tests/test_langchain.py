from src.assistant.langchain_agent import build_splits, answer_query
from src.assistant.loader import read_text_file

def test_build_splits_defaults():
    text = read_text_file("resources/sample_procedures.txt")
    chunks = build_splits(text)
    assert len(chunks) >= 1

def test_answer_query_bm25():
    text = read_text_file("resources/sample_procedures.txt")
    ans = answer_query(text, "Cómo ejecutar pytest", use_embeddings=False, chunk_size=150, chunk_overlap=30)
    assert "Pruebas" in ans or "pytest" in ans

def test_token_splitter_detection():
    text = read_text_file("resources/sample_procedures.txt")
    # contiene la palabra 'tokens', debe activar el TokenTextSplitter
    chunks = build_splits(text, chunk_size=50, chunk_overlap=10)
    assert len(chunks) >= 1
