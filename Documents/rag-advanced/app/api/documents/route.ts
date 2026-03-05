import { NextRequest, NextResponse } from "next/server";
import { getDocuments, deleteDocument } from "@/lib/db/documents";

export async function GET() {
  try {
    const documents = await getDocuments();
    return NextResponse.json(documents);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error desconocido" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    
    await deleteDocument(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error desconocido" }, { status: 500 });
  }
}
