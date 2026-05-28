import { extractActionItems } from "@/lib/gemini";

// Gemini API calls use GEMINI_API_KEY from .env.local, so this route must run
// on the server where secrets are available.
export const runtime = "nodejs";

function jsonError(message, status = 500) {
  // Consistent JSON shape:
  // The frontend can safely call response.json() because both success and error
  // paths return JSON from this helper.
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
    // The frontend already uploaded the PDF and received extracted text. This
    // route receives only that text as JSON, then asks Gemini to find tasks,
    // deadlines, and responsibilities inside it.
    const body = await request.json();
    const documentText = body.documentText?.trim();

    if (!documentText) {
      return jsonError(
        "Please upload a PDF before extracting action items.",
        400,
      );
    }

    // Modular architecture:
    // The route handles HTTP details. The reusable Gemini utility handles prompt
    // design and the SDK request.
    const actionItems = await extractActionItems(documentText);

    return Response.json({
      success: true,
      actionItems,
    });
  } catch (error) {
    // Error handling:
    // This catches invalid JSON, missing environment variables, Gemini failures,
    // and other unexpected errors without exposing sensitive server details.
    console.error("Action item extraction failed:", error);

    return jsonError("Unable to extract action items right now.", 500);
  }
}
