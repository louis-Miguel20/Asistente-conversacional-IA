import argparse
import os
from rich.console import Console
from .loader import load_procedures_text, read_pdf_file
from .search import ProcedureAssistant

console = Console()
DEFAULT_PDF = r"c:\Users\luisr\Asistente-conversacional-IA\PRUEBA TÉCNICA IA (1) (1).pdf"

def cmd_extract(args: argparse.Namespace) -> int:
    pdf_path = args.pdf_path or os.getenv("PROCEDURES_PDF_PATH", DEFAULT_PDF)
    out_text = args.out_text
    text = read_pdf_file(pdf_path)
    os.makedirs(os.path.dirname(out_text), exist_ok=True)
    with open(out_text, "w", encoding="utf-8") as f:
        f.write(text)
    console.print(f"[green]Procedimientos extraídos a: {out_text}")
    return 0

def cmd_chat(args: argparse.Namespace) -> int:
    pdf_path = args.pdf_path or os.getenv("PROCEDURES_PDF_PATH", DEFAULT_PDF)
    text_path = args.text_path
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
    return 0

def app() -> int:
    parser = argparse.ArgumentParser(prog="asistente")
    sub = parser.add_subparsers(dest="command", required=True)

    p_extract = sub.add_parser("extract", help="Extrae texto del PDF a un archivo")
    p_extract.add_argument("--pdf-path", type=str, default=None)
    p_extract.add_argument("--out-text", type=str, default="resources/procedures.txt")
    p_extract.set_defaults(func=cmd_extract)

    p_chat = sub.add_parser("chat", help="Inicia la sesión de chat")
    p_chat.add_argument("--pdf-path", type=str, default=None)
    p_chat.add_argument("--text-path", type=str, default=None)
    p_chat.set_defaults(func=cmd_chat)

    args = parser.parse_args()
    return args.func(args)

if __name__ == "__main__":
    raise SystemExit(app())
