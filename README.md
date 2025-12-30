[![CI](https://github.com/louis-Miguel20/Asistente-conversacional-IA/actions/workflows/ci.yml/badge.svg)](https://github.com/louis-Miguel20/Asistente-conversacional-IA/actions/workflows/ci.yml)
# Asistente Conversacional RAG

Este proyecto implementa un asistente conversacional avanzado basado en RAG (Retrieval Augmented Generation), diseñado para responder preguntas precisas sobre documentos técnicos cargados por el usuario.

El sistema expone una API REST construida con **FastAPI** y ofrece una interfaz de usuario web moderna integrada.

---

## 🚀 Características Principales

*   **RAG Pipeline Robusto:** Ingesta, chunking inteligente, embeddings y recuperación vectorial.
*   **API RESTful:** Endpoints claros para integración con cualquier cliente (`/health`, `/upload`, `/ask`).
*   **Interfaz Web Integrada:** Frontend moderno en HTML/JS/CSS servido directamente por FastAPI.
*   **Soporte Multiformato:** Carga de documentos PDF y TXT.
*   **Gestión de Contexto:** Muestra las fuentes y fragmentos utilizados para generar cada respuesta.
*   **Arquitectura Modular:** Separación clara entre API, lógica de asistente y frontend.

---

## 🛠️ Arquitectura Técnica

### Backend (Python/FastAPI)
*   **FastAPI:** Framework principal para la API y servicio de archivos estáticos.
*   **LangChain & LangGraph:** Orquestación del flujo conversacional y lógica RAG.
*   **Embeddings:** `sentence-transformers/all-MiniLM-L6-v2` (HuggingFace) para búsqueda semántica local eficiente.
*   **Vector Store:** `FAISS` para indexación y recuperación de similitud.
*   **LLM:** Integración con OpenAI (`gpt-4o-mini`) para la generación de respuestas.

### Frontend (HTML/CSS/JS)
*   **Interfaz Nativa:** Sin frameworks pesados, solo HTML5, CSS3 moderno (Variables, Flexbox) y JavaScript ES6+.
*   **Responsive:** Diseño adaptable a móviles y  tambien a escritorio.
*   **Interacción Real-time:** Comunicación asíncrona con la API mediante `fetch`.

---

## 📦 Instalación y Uso

### Prerrequisitos
*   Python 3.10+
*   Clave de API de OpenAI (en archivo `.env`)

### Opción A: Usando Make (Recomendado para Linux/Mac/WSL)

**1. Configurar Entorno e Instalar**
```bash
make venv
# Activar entorno virtual: source .venv/bin/activate (Linux/Mac) o .venv\Scripts\activate (Win)
make install
```

**2. Ejecutar Aplicación**
```bash
make run
```

### Opción B: Manual / Windows (PowerShell/CMD)

Si no tienes `make` instalado, usa los siguientes comandos en tu terminal:

**1. Crear y Activar Entorno Virtual**
```powershell
python -m venv .venv
.venv\Scripts\activate
```

**2. Instalar Dependencias**
```powershell
pip install -r requirements.txt
```

**3. Configurar Variables de Entorno**
 Se debe crear un archivo `.env` en la raíz del proyecto:
```env
OPENAI_API_KEY=con_una_clave_aqui
OPENAI_MODEL=gpt-4o-mini
CHUNK_SIZE=400
CHUNK_OVERLAP=80
USE_EMBEDDINGS=true
```

**4. Ejecutar la Aplicación**
```powershell
python -m uvicorn src.api.main:app --host 0.0.0.0 --port 8000
```
La aplicación estará disponible en: **`http://localhost:8000`**

---

## 🔧 Comandos de Desarrollo Bash

| Acción | Make (Linux/Mac) | Windows / Manual |
| :--- | :--- | :--- |
| **Run (Prod)** | `make run` | `python -m uvicorn src.api.main:app --host 0.0.0.0 --port 8000` |
| **Run (Dev)** | `make dev` | `python -m uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000` |
| **Tests** | `make test` | `python -m pytest` |
| **Lint** | `make lint` | `pylint src tests && black --check src tests` |

---

## 📚 API Reference

| Método | Endpoint | Descripción | Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Verificar estado del servicio | - |
| `POST` | `/upload` | Subir documento de contexto | `multipart/form-data` |
| `POST` | `/ask` | Realizar pregunta al asistente | `{"question": "...", "filename": "doc.pdf"}` (filename opcional) |

---

## 🧩 Estructura del Proyecto

```
.
├── src/
│   ├── api/                # Capa de API y Frontend
│   │   ├── main.py         # Entrypoint FastAPI
│   │   └── static/         # Frontend (HTML/CSS/JS/Img)
│   ├── assistant/          # Lógica RAG y Grafos
│   │   ├── rag_pipeline.py # Pipeline principal
│   │   ├── graph.py        # Grafo de estado (LangGraph)
│   │   └── loader.py       # Procesamiento de documentos
├── tests/                  # Tests unitarios e integración
├── uploads/                # Almacenamiento temporal de docs
├── requirements.txt        # Dependencias
├── Makefile                # Comandos de utilidad
└── README.md               # Documentación
```
