from typer import Typer, Option
from rich.console import Console
from .loader import load_procedures_text
from .search import ProcedureAssistant
import os

app = Typer(add_completion=False)
console = Console()

DEFAULT_PDF = r"c:\Users\luisr\Asistente-conversacional-IA\PRUEBA TÉCNICA IA (1) (1).pdf"

@app.command()
def chat(
    pdf_path: str = Option(
        os.getenv("PROCEDURES_PDF_PATH", DEFAULT_PDF),
        help="Ruta al PDF con los procedimientos",
    ),
    text_path: str = Option(
        None, help="Ruta a archivo de texto plano con procedimientos (opcional)"
    ),
):
    console.rule("[bold]Asistente Conversacional IA")
    text = load_procedures_text(pdf_path=pdf_path, text_path=text_path)
    assistant = ProcedureAssistant(text)
    console.print("[green]Escribe tu consulta. Ctrl+C para salir.")
    try:
        while True:
            user = console.input("[bold cyan]Tú> ")
            reply = assistant.respond(user)
            console.print(f"[bold magenta]Asistente>[/] {reply}")
    except KeyboardInterrupt:
        console.print("\n[yellow]Sesión finalizada.")

if __name__ == "__main__":
    app()
