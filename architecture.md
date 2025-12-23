# Arquitectura del Sistema Asistente RAG

## Diagrama de Flujo Actualizado

```ascii
[Usuario (Navegador)]
    |
    v (HTTP/JS)
    |
+---+-------------------------------------------------------+
|   API Gateway / Servidor Estático (FastAPI) - Puerto 8000 |
+---+-------------------------------------------------------+
    |                  |                   |
    | (GET /)          | (POST /upload)    | (POST /ask)
    v                  v                   v
[Static Files]     [Upload Handler]    [Controller Logic]
(HTML/CSS/JS)      (Save to Disk)      (main.py)
                                           |
                                           v
                                   ¿Filename provided?
                                     /           \
                                   NO             YES
                                   |               |
                                   v               v
                           [General Chat]     [RAG Pipeline]
                           (OpenAI Prompt)         |
                                             +-----+-----+
                                             |           |
                                     [Loader/Split]  [Vector Search]
                                     (PDF/TXT)       (FAISS/Embeddings)
                                             |           |
                                             +-----+-----+
                                                   |
                                                   v
                                            [Contextualized LLM]
                                            (OpenAI GPT-4o-mini)
```

## Componentes Principales

### 1. Frontend Unificado (SPA)
*   **Tecnología:** HTML5, CSS3, JavaScript (Vanilla).
*   **Responsabilidad:** Interfaz de usuario para carga de archivos y chat. Gestiona el estado de la conversación localmente y se comunica con el backend vía `fetch`. Envía el nombre del archivo actual (`filename`) con cada pregunta.
*   **Ubicación:** `src/api/static/`

### 2. API Backend (FastAPI)
*   **Tecnología:** Python 3.10+, FastAPI, Uvicorn.
*   **Responsabilidad:**
    *   Servir la aplicación frontend (`/`).
    *   Gestionar la carga y almacenamiento de archivos (`/upload`).
    *   Exponer la lógica de negocio del asistente (`/ask`).
    *   Decidir entre flujo RAG (si hay archivo) o Charla General (si no).

### 3. Motor RAG (Retrieval Augmented Generation)
*   **Chunking:** División inteligente del texto para preservar contexto.
*   **Embeddings:** Generación de vectores usando `sentence-transformers` (local).
*   **Retrieval:** Búsqueda de similitud coseno usando FAISS.
*   **Generación:** Construcción de prompts enriquecidos con contexto y llamada a OpenAI.

## Flujo de Datos

1.  **Inicio:** El usuario carga la página. FastAPI sirve el `index.html`.
2.  **Carga (Opcional):** Usuario sube PDF. Frontend envía a `/upload`. Backend guarda en `uploads/`. Frontend recuerda el `filename`.
3.  **Pregunta:** Usuario envía texto. Frontend envía a `/ask` junto con el `filename` (si existe).
4.  **Procesamiento:**
    *   **Caso A (Sin archivo):** El sistema responde usando un prompt general de asistente amable.
    *   **Caso B (Con archivo):**
        *   Carga el documento específico.
        *   Genera embedding de la pregunta.
        *   Busca los K fragmentos más relevantes.
        *   Envía prompt (Contexto + Pregunta) a OpenAI.
5.  **Respuesta:** API devuelve JSON con respuesta y fuentes. Frontend renderiza.

## Decisiones de Diseño

*   **Monolito Modular:** Se optó por servir el frontend desde FastAPI para simplificar el despliegue (un solo contenedor/comando) y evitar problemas de CORS en desarrollo local.
*   **Embeddings Locales:** Uso de `sentence-transformers` para reducir latencia y dependencia externa en la fase de recuperación, manteniendo el costo bajo.
*   **Stateless:** El servidor no mantiene estado de la conversación en memoria entre requests; depende del `filename` enviado por el cliente para reconstruir el contexto RAG necesario.
