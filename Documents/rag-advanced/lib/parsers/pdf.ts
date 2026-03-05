import pdf from "pdf-parse";

export async function parsePDF(buffer: Buffer): Promise<{ text: string; pageCount: number }> {
  try {
    const data = await pdf(buffer);
    // Normalize newlines and spaces
    const text = data.text
      .replace(/\r\n/g, "\n")
      .replace(/\n\s*\n/g, "\n\n") // Preserve paragraph breaks
      .replace(/ +/g, " ")
      .trim();
      
    return {
      text,
      pageCount: data.numpages,
    };
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("Failed to parse PDF");
  }
}
