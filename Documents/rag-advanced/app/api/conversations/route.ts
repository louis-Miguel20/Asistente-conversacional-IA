import { NextRequest, NextResponse } from "next/server";
import { getConversations, createConversation } from "@/lib/db/conversations";

export async function GET() {
  try {
    const conversations = await getConversations();
    return NextResponse.json(conversations);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error desconocido" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const title = body.title || "Nueva conversación";
    const conversation = await createConversation(title);
    return NextResponse.json(conversation);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error desconocido" }, { status: 500 });
  }
}
