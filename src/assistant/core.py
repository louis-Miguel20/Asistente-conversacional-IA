from dataclasses import dataclass, field
from typing import List
from .search import ProcedureAssistant

@dataclass
class Message:
    role: str
    content: str

@dataclass
class Conversation:
    history: List[Message] = field(default_factory=list)

    def add(self, role: str, content: str) -> None:
        self.history.append(Message(role=role, content=content))

    def last_user(self) -> str:
        for msg in reversed(self.history):
            if msg.role == "user":
                return msg.content
        return ""

class Assistant:
    def __init__(self, procedures_text: str):
        self.proc = ProcedureAssistant(procedures_text)
        self.conv = Conversation()

    def ask(self, user_msg: str) -> str:
        self.conv.add("user", user_msg)
        reply = self.proc.respond(user_msg)
        self.conv.add("assistant", reply)
        return reply
