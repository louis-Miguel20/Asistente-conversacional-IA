import axios from "axios";
import * as cheerio from "cheerio";

export async function parseURL(url: string): Promise<{ text: string; title: string }> {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $("script, style, nav, footer, header, aside, noscript, iframe").remove();

    // Extract title
    const title = $("title").text().trim() || url;

    // Extract main content
    let content = $("main").text() || $("article").text();
    if (!content) {
      content = $("body").text();
    }

    // Clean text: collapse multiple spaces and newlines
    const text = content
      .replace(/\s+/g, " ")
      .trim();

    return {
      text,
      title,
    };
  } catch (error) {
    console.error("Error parsing URL:", error);
    throw new Error("Failed to parse URL");
  }
}
