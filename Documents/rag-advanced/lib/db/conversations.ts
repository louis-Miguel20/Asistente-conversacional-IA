import { prisma } from "@/lib/db/prisma";
import { MessageRole } from "@prisma/client";

export async function createConversation(title?: string) {
  return prisma.conversation.create({
    data: {
      title: title || "Nueva conversación",
    },
  });
}

export async function getConversations() {
  return prisma.conversation.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        take: 1, // Preview
      },
    },
  });
}

export async function getConversation(id: string) {
  return prisma.conversation.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function addMessage(conversationId: string, role: MessageRole, content: string, sources?: object) {
  return prisma.message.create({
    data: {
      conversationId,
      role,
      content,
      sources: sources ? JSON.parse(JSON.stringify(sources)) : undefined,
    },
  });
}
