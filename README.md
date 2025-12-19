Asistente Conversacional IA

Objetivo
- Implementar un asistente conversacional que siga los procedimientos definidos en un PDF local.
- Incluir entorno virtual (`venv`), `Makefile`, pruebas con `pytest` y pipeline de CI en YAML.

Estructura
- `src/assistant`: núcleo del asistente y utilidades de carga/búsqueda.
- `resources`: recursos (PDF/texto) de procedimientos.
- `tests`: pruebas unitarias con `pytest`.

Requisitos
- Python 3.11+
- Windows (probado), funciona también en Linux/Ubuntu en CI.

Instalación rápida
- Crear entorno: `python -m venv .venv`
- Instalar deps: `.venv\\Scripts\\python -m pip install -r requirements.txt` (Windows)
- Ejecutar CLI: `.venv\\Scripts\\python run.py chat --help`

Variables de entorno
- `PROCEDURES_PDF_PATH`: ruta al PDF con los procedimientos. Por defecto apunta al PDF indicado por el usuario.

Notas
- El asistente puede operar con procedimientos extraídos de PDF o de texto plano. En CI y pruebas se usa un archivo de ejemplo para garantizar reproducibilidad.
