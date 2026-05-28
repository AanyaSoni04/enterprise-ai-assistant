import { summarizeDocument } from "@/lib/gemini";

// Gemini uses a private API key from .env.local, so this route must run on the
// server. Node.js runtime is the right fit for server-side API calls.
export const runtime = "nodejs";

function jsonError(message, status = 500) {
  // Consistent JSON errors:
  // The frontend expects JSON from this API. This helper makes validation and
  // unexpected failures use the same response shape.
  return Response.json(
    {
      success: false,
      error: message,
    },
    { status },
  );
}

export async function POST(request) {
  try {
    // Request flow:
    // The frontend sends extracted PDF text as JSON. This route does not receive
    // the PDF file directly; the upload route already handled text extraction.
    const body = await request.json();
    const documentText = body.documentText?.trim();

    if (!documentText) {
      return jsonError("Please upload a PDF before generating a summary.", 400);
    }

    // Async Gemini flow:
    // summarizeDocument builds the prompt and sends a network request to Gemini.
    // await pauses this route until Gemini returns the generated summary.
    const summary = await summarizeDocument(documentText);

    return Response.json({
      success: true,
      summary,
    });
  } catch (error) {
    // Error handling:
    // This catches invalid JSON, missing GEMINI_API_KEY, Gemini API failures, or
    // unexpected server errors, then returns a safe JSON message to the UI.
    console.error("Document summary failed:", error);

    return jsonError("Unable to generate a summary right now.", 500);
  }
}
