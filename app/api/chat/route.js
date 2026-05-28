import { answerQuestionFromDocument } from "@/lib/gemini";

// Gemini calls must happen on the server because they use a private API key
// from environment variables. The Node.js runtime is the right place for that.
export const runtime = "nodejs";

function jsonError(message, status = 500) {
  // Error response helper:
  // Keeping error responses in one helper makes sure the frontend always gets
  // JSON, even when validation or Gemini API calls fail.
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
    // The ChatBox frontend sends a POST request with JSON in the request body.
    // The body should contain:
    // - documentText: extracted PDF text
    // - question: the user's question about that text
    const body = await request.json();
    const documentText = body.documentText?.trim();
    const question = body.question?.trim();

    // Validation:
    // We check inputs before calling Gemini so the user gets clear feedback for
    // missing data instead of a vague server error.
    if (!documentText) {
      return jsonError("Please upload a PDF before asking a question.", 400);
    }

    if (!question) {
      return jsonError("Please enter a question.", 400);
    }

    // API architecture:
    // This route is intentionally thin. It handles HTTP concerns like reading
    // the request and returning JSON, while lib/gemini.js owns Gemini-specific
    // prompt construction and SDK calls.
    //
    // async/await:
    // Calling Gemini is a network request, so it returns a Promise. await pauses
    // this function until Gemini sends back the answer.
    const answer = await answerQuestionFromDocument({
      documentText,
      question,
    });

    return Response.json({
      success: true,
      answer,
    });
  } catch (error) {
    // Error handling:
    // This catches invalid JSON, missing environment variables, Gemini API
    // failures, or any unexpected server issue. We log the real error for
    // developers and return a safe message to the frontend.
    console.error("Document chat failed:", error);

    return jsonError("Unable to answer the question right now.", 500);
  }
}
