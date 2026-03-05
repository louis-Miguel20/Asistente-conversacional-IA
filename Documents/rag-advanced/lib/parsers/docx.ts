import mammoth from "mammoth";

export async function parseDOCX(buffer: Buffer): Promise<{ text: string }> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    // Normalize newlines and spaces
    const text = result.value
      .replace(/\r\n/g, "\n")
      .replace(/\n\s*\n/g, "\n\n") // Preserve paragraph breaks
      .replace(/ +/g, " ")
      .trim();

    return {
      text,
    };
  } catch (error) {
    console.error("Error parsing DOCX:", error);
    throw new Error("Failed to parse DOCX");
  }
}
