from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from src.api.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@patch("src.api.main.answer_question")
@patch("pathlib.Path.exists")
def test_ask_endpoint(mock_exists, mock_answer_question):
    # Simular comprobaciones de existencia de archivos
    mock_exists.return_value = True

    # Simular respuesta RAG
    mock_answer_question.return_value = {
        "answer": "Respuesta de prueba",
        "context_used": ["ctx1", "ctx2"],
    }

    payload = {"question": "¿Qué es esto?"}
    response = client.post("/ask", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["answer"] == "Respuesta de prueba"
    assert data["context"] == ["ctx1", "ctx2"]


@patch("src.api.main.answer_question")
@patch("pathlib.Path.exists")
def test_ask_endpoint_error(mock_exists, mock_answer_question):
    mock_exists.return_value = True
    mock_answer_question.side_effect = Exception("Fallo interno")

    payload = {"question": "Error?"}
    response = client.post("/ask", json=payload)

    assert response.status_code == 500
    assert "Fallo interno" in response.json()["detail"]
