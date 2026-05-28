import { GoogleGenAI } from "@google/genai";

// Model choice:
// gemini-2.5-flash is a strong default for document workflows because it is
// fast, cost-conscious, and good at summarization, Q&A, and extraction tasks.
// Keeping it in one constant makes it easy to change later.
const GEMINI_MODEL = "gemini-2.5-flash";

function getGeminiClient() {
  // Environment variables:
  // API keys must stay on the server. In Next.js, files inside lib/ can be used
  // by API routes and server code, so this key should never be sent to React
  // client components. Add this to .env.local:
  //
  // GEMINI_API_KEY=your_api_key_here
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable.");
  }

  // The GoogleGenAI client is the official Gemini SDK client. It knows how to
  // send requests to Gemini when we provide a valid API key.
  return new GoogleGenAI({ apiKey });
}

async function generateGeminiText(prompt) {
  const ai = getGeminiClient();

  // Async API flow:
  // Calling Gemini requires a network request. await pauses this function until
  // Gemini responds, then gives us the response object.
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
  });

  // response.text contains Gemini's plain text answer. The fallback keeps the
  // rest of the app from receiving undefined if the model returns no text.
  return response.text || "";
}

function requireDocumentText(documentText) {
  // Shared validation:
  // All three workflows need extracted document text. This helper gives a clear
  // error if another API route calls the Gemini utility incorrectly.
  if (!documentText || typeof documentText !== "string") {
    throw new Error("documentText must be a non-empty string.");
  }
}

export async function answerQuestionFromDocument({ documentText, question }) {
  requireDocumentText(documentText);

  if (!question || typeof question !== "string") {
    throw new Error("question must be a non-empty string.");
  }

  // Prompt explanation:
  // A prompt is the instruction we send to Gemini. Here we tell Gemini to answer
  // only from the provided document text so it behaves like a knowledge assistant
  // instead of guessing from general knowledge.
  const prompt = `
You are an enterprise AI knowledge assistant.

Answer the user's question using only the document text below.
If the answer is not present in the document, say: "I could not find that in the uploaded document."

Question:
${question}

Document text:
${documentText}
`;

  return generateGeminiText(prompt);
}

export async function summarizeDocument(documentText) {
  requireDocumentText(documentText);

  // Prompt explanation:
  // This prompt asks for a business-friendly summary. The structure makes the
  // output easier to display later in dashboard cards or report sections.
  const prompt = `
You are an enterprise AI knowledge assistant.

Summarize the document text below for a busy business user.
Use this format:
- Executive summary
- Key points
- Important risks or decisions

Document text:
${documentText}
`;

  return generateGeminiText(prompt);
}

export async function extractActionItems(documentText) {
  requireDocumentText(documentText);

  // Prompt explanation:
  // Action item extraction is different from summarization. We ask Gemini to look
  // specifically for tasks, owners, due dates, and missing information.
  const prompt = `
You are an enterprise AI knowledge assistant.

Extract action items from the document text below.
Return a clear bullet list. For each action item, include:
- Task
- Owner, if mentioned
- Due date, if mentioned
- Source context in one short sentence

If there are no action items, say: "No action items found in the uploaded document."

Document text:
${documentText}
`;

  return generateGeminiText(prompt);
}
