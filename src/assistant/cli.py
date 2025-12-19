import argparse
import os
from rich.console import Console
from .loader import load_procedures_text, read_pdf_file
from .search import ProcedureAssistant
from .langchain_agent import answer_query, detect_chunk_params

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

def cmd_lc_chat(args: argparse.Namespace) -> int:
    pdf_path = args.pdf_path or os.getenv("PROCEDURES_PDF_PATH", DEFAULT_PDF)
    text_path = args.text_path
    text = load_procedures_text(pdf_path=pdf_path, text_path=text_path)
    cs = args.chunk_size
    co = args.chunk_overlap
    console.rule("[bold]Asistente Conversacional IA (LangChain)")
    auto_cs, auto_co = detect_chunk_params(text)
    if cs is None or co is None:
        console.print(f"[yellow]Parámetros chunk detectados: size={auto_cs}, overlap={auto_co}")
    try:
        while True:
            user = console.input("[bold cyan]Tú> ")
            reply = answer_query(text, user, chunk_size=cs or auto_cs, chunk_overlap=co or auto_co, use_embeddings=args.use_embeddings)
            console.print(f"[bold magenta]Asistente>[/]\n{reply}")
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

    p_lc_chat = sub.add_parser("lc-chat", help="Chat con LangChain y chunking")
    p_lc_chat.add_argument("--pdf-path", type=str, default=None)
    p_lc_chat.add_argument("--text-path", type=str, default=None)
    p_lc_chat.add_argument("--chunk-size", type=int, default=None)
    p_lc_chat.add_argument("--chunk-overlap", type=int, default=None)
    p_lc_chat.add_argument("--use-embeddings", action="store_true", help="Usa embeddings FAISS si disponibles")
    p_lc_chat.set_defaults(func=cmd_lc_chat)

    args = parser.parse_args()
    return args.func(args)

if __name__ == "__main__":
    raise SystemExit(app())
