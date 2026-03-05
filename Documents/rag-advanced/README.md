# Sistema RAG Avanzado

Este proyecto es un sistema completo de Generación Aumentada por Recuperación (RAG) construido con tecnologías modernas como Next.js, Python (FastAPI), PostgreSQL (pgvector) y MLflow. Está diseñado para ofrecer una experiencia robusta y escalable para la ingestión y consulta de documentos mediante inteligencia artificial.

## 🚀 Características Principales

- **Chat Interactivo Inteligente**: Interfaz de usuario moderna y responsiva con respuestas en tiempo real (streaming), historial de conversación y citación precisa de fuentes.
- **Ingesta de Documentos Flexible**: Capacidad para procesar y almacenar información desde archivos de texto y documentos (extensible a PDF, DOCX).
- **RAG Híbrido y Optimizado**: Utiliza búsqueda semántica avanzada con `pgvector` y embeddings de OpenAI (`text-embedding-3-small`) para una recuperación de información precisa.
- **Seguimiento de Experimentos (MLflow)**: Sistema integrado para monitorear, registrar y evaluar el rendimiento del modelo y la retroalimentación del usuario.
- **Infraestructura Contenerizada**: Configuración lista para usar con Docker Compose para servicios de base de datos (PostgreSQL con vector) y MLflow.
- **Pipeline CI/CD**: Flujos de trabajo de GitHub Actions configurados para integración continua (Linting, Type Checking, Build).

## 🛠️ Stack Tecnológico

### Frontend y API Gateway
- **Framework**: Next.js 15 (App Router)
- **Estilos**: Tailwind CSS
- **IA Integration**: Vercel AI SDK
- **Lenguaje**: TypeScript

### Backend y Machine Learning
- **API ML**: FastAPI (Python)
- **Tracking**: MLflow
- **Base de Datos**: PostgreSQL 16 + extensión `pgvector`
- **ORM**: Consultas directas optimizadas con `pg` (Node.js)

### Inteligencia Artificial
- **Modelos de Chat**: OpenAI GPT-4o
- **Embeddings**: OpenAI text-embedding-3-small
- **Orquestación**: LangChain

## 📦 Guía de Instalación

### 1. Prerrequisitos
Asegúrate de tener instalado lo siguiente en tu sistema:
- **Node.js**: v20 o superior
- **Python**: 3.11 o superior
- **Docker Desktop**: Para ejecutar servicios de infraestructura
- **Git**: Para control de versiones

### 2. Configuración del Entorno
1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/rag-advanced.git
   cd rag-advanced
   ```

2. Configura las variables de entorno:
   - Crea un archivo `.env.local` en la raíz (basado en `.env.example`).
   - Define tus claves de API (OpenAI) y configuración de base de datos.

### 3. Instalación de Dependencias

**Frontend (Node.js):**
```bash
npm install
```

**Backend ML (Python):**
```bash
pip install -r ml/requirements.txt
```

### 4. Despliegue de Servicios (Docker)
Inicia la base de datos PostgreSQL y el servidor MLflow:
```bash
docker compose -f docker/docker-compose.yml up -d
```
*Esto levantará PostgreSQL en el puerto 5432 y MLflow en el puerto 5000.*

### 5. Configuración de Base de Datos
Asegúrate de que la extensión `vector` esté habilitada en tu base de datos PostgreSQL (el contenedor de Docker ya lo hace automáticamente).

## 🏃‍♂️ Ejecución del Proyecto

### Iniciar Frontend (Next.js)
El servidor de desarrollo correrá en el puerto 3000.
```bash
npm run dev
```
🔗 Accede a la aplicación: [http://localhost:3000](http://localhost:3000)

### Iniciar Backend ML (FastAPI)
El servicio de ML correrá en el puerto 8000.
```bash
cd ml
uvicorn main:app --reload --port 8000
```
🔗 Documentación API (Swagger): [http://localhost:8000/docs](http://localhost:8000/docs)

## 🧪 Pruebas y Calidad de Código

**Ejecutar Linter y Type Check (Frontend):**
```bash
npm run lint
npx tsc --noEmit
```

**Ejecutar Tests (cuando estén implementados):**
```bash
npm test
pytest ml/tests/
```

## 📂 Estructura del Proyecto

- `/app`: Rutas y páginas de Next.js (Frontend y API Routes).
- `/components`: Componentes React reutilizables (Chat, Upload).
- `/lib`: Lógica de negocio (RAG, Embeddings, Base de Datos).
- `/ml`: Servicio de Machine Learning con FastAPI.
- `/docker`: Configuración de Docker Compose.
- `/.github`: Flujos de trabajo CI/CD.

## 🤝 Contribución
Las contribuciones son bienvenidas. Por favor, abre un issue o envía un Pull Request para mejoras.
