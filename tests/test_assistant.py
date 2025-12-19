from src.assistant.search import ProcedureAssistant
from src.assistant.loader import read_text_file

def test_procedure_assistant_keyword_match():
    text = read_text_file("resources/sample_procedures.txt")
    assistant = ProcedureAssistant(text)
    reply = assistant.respond("¿Cómo ejecutar pruebas?")
    assert "Pruebas" in reply or "pytest" in reply

def test_procedure_assistant_fallback():
    text = read_text_file("resources/sample_procedures.txt")
    assistant = ProcedureAssistant(text)
    reply = assistant.respond("zzzzzz tema no existente")
    assert "Objetivo" in reply
