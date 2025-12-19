from src.assistant.loader import load_procedures_text

def test_load_from_text():
    text = load_procedures_text(text_path="resources/sample_procedures.txt")
    assert "Objetivo" in text
    assert "Parte 2" in text
