from typing import Dict, List, Annotated, TypedDict, Union
import operator
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage


# Definir el estado del grafo
class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    context: str
    current_doc_path: str


# Nodo: Verificar Documento
def check_document(state: AgentState) -> Dict:
    """Verifica si hay un documento cargado."""
    doc_path = state.get("current_doc_path")
    if not doc_path:
        # Retornar actualización de mensajes si falla la verificación
        return {
            "messages": [
                AIMessage(
                    content="⚠️ **Atención:** Para poder responder a tus preguntas, primero debes cargar un documento (PDF o TXT) en la barra lateral."
                )
            ]
        }

    # Para evitar el error "Must write to at least one of...", actualizamos context con su mismo valor
    # o simplemente no retornamos nada útil pero satisfacemos la validación.
    # Una opción segura es re-escribir el contexto actual (no-op).
    return {"context": state.get("context", "")}


# Nodo: Generar Respuesta RAG
def generate_rag_response(state: AgentState) -> Dict:
    """Genera respuesta usando RAG si hay documento."""
    from src.assistant.rag_pipeline import answer_question, RAGConfig

    last_message = state["messages"][-1]
    if not isinstance(last_message, HumanMessage):
        # Si el último mensaje no es humano, no generamos nada nuevo,
        # pero retornamos un dict vacío para cumplir el contrato.
        # Ojo: LangGraph puede quejarse si no hay updates.
        # En este flujo lineal, siempre debería ser humano al llegar aquí.
        return {"messages": []}

    query = last_message.content
    doc_path = state["current_doc_path"]

    is_pdf = doc_path.lower().endswith(".pdf")
    cfg = RAGConfig(
        pdf_path=doc_path if is_pdf else None,
        text_path=doc_path if not is_pdf else None,
        chunk_size=400,
        chunk_overlap=80,
        use_embeddings=True,
    )

    # Aquí podríamos inyectar el historial de mensajes en el prompt si quisiéramos
    # Por ahora, usamos la pregunta directa
    result = answer_question(query, cfg)

    response_text = result.get("answer", "No se pudo generar una respuesta.")
    context_used = result.get("context_used", [])

    # Formatear contexto para mostrarlo
    if context_used:
        ctx_str = "\n\n".join([f"> {c}" for c in context_used])
        # Guardamos el contexto en el estado por si se necesita después
        return {"messages": [AIMessage(content=response_text)], "context": ctx_str}

    return {"messages": [AIMessage(content=response_text)]}


# Construir el grafo
workflow = StateGraph(AgentState)

workflow.add_node("check_doc", check_document)
workflow.add_node("rag", generate_rag_response)


# Lógica condicional
def route_check(state: AgentState):
    if not state.get("current_doc_path"):
        return END
    return "rag"


workflow.set_entry_point("check_doc")
workflow.add_conditional_edges("check_doc", route_check, {END: END, "rag": "rag"})
workflow.add_edge("rag", END)

graph = workflow.compile()
