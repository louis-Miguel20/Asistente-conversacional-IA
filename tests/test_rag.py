import pytest
from unittest.mock import MagicMock, patch
from src.assistant.rag_pipeline import (
    answer_question,
    RAGConfig,
    retrieve,
    score_signal,
)


@pytest.fixture
def mock_text():
    return "El sol es una estrella. La luna es un satélite. Marte es rojo."


@pytest.fixture
def rag_config():
    return RAGConfig(
        use_embeddings=False, chunk_size=50, chunk_overlap=10, k=2, min_signal_tokens=1
    )


def test_score_signal():
    query = "sol estrella"
    context = ["El sol es una estrella"]
    score = score_signal(query, context)
    assert score > 0

    query_irrelevant = "computadora"
    score_irrelevant = score_signal(query_irrelevant, context)
    assert score_irrelevant == 0


def test_retrieve(mock_text, rag_config):
    # Prueba recuperación simple sin embeddings (usando BM25 implícitamente vía lógica o separador simple)
    # Nota: build_retriever usa BM25 si use_embeddings es False
    chunks = retrieve(mock_text, "luna", rag_config)
    assert len(chunks) > 0
    assert any("luna" in c.lower() for c in chunks)


@patch("src.assistant.rag_pipeline.load_procedures_text")
@patch("src.assistant.rag_pipeline.retrieve")
def test_answer_question_success(mock_retrieve, mock_load, rag_config):
    mock_load.return_value = "Contenido del documento"
    mock_retrieve.return_value = ["Contenido relevante 1", "Contenido relevante 2"]

    # Simular LLM
    mock_llm = MagicMock(return_value="Respuesta generada")

    # Usar una consulta que comparta tokens con el contexto para pasar la verificación de señal
    result = answer_question("relevante", rag_config, llm=mock_llm)

    assert result["answer"] == "Respuesta generada"
    assert len(result["context_used"]) == 2


@patch("src.assistant.rag_pipeline.load_procedures_text")
@patch("src.assistant.rag_pipeline.retrieve")
def test_answer_question_fallback(mock_retrieve, mock_load, rag_config):
    mock_load.return_value = "Contenido"
    # Retornar contexto vacío o irrelevante
    mock_retrieve.return_value = []

    result = answer_question("pregunta dificil", rag_config)

    assert "No encontré información relevante en el documento" in result["answer"]
