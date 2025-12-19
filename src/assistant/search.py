import re
from typing import List

def split_paragraphs(text: str) -> List[str]:
    paras = [p.strip() for p in re.split(r"\n{2,}", text) if p.strip()]
    return paras or [text]

class ProcedureAssistant:
    def __init__(self, procedures_text: str):
        self.paragraphs = split_paragraphs(procedures_text)

    def respond(self, query: str) -> str:
        q = query.lower().strip()
        if not q:
            return "Por favor, indica tu consulta."
        # Búsqueda simple: puntuación por ocurrencias de palabras
        tokens = [t for t in re.findall(r"\w+", q) if len(t) > 2]
        scores = []
        for para in self.paragraphs:
            p_low = para.lower()
            score = sum(p_low.count(tok) for tok in tokens)
            # Boost por títulos o pasos
            if score > 0 and re.search(r"(paso|procedimiento|objetivo|parte)\s+\d+", p_low):
                score += 1
            scores.append(score)
        if scores and max(scores) > 0:
            best_idx = max(range(len(scores)), key=lambda i: scores[i])
            return self.paragraphs[best_idx]
        # Fallback: primer párrafo como introducción
        return self.paragraphs[0]
