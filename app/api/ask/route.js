import { answerQuestionFromDocument } from "@/lib/gemini";

export const runtime = "nodejs";

function jsonError(message, status = 500) {
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
    // Request handling:
    // ChatBox sends JSON, not FormData. request.json() reads that JSON body and
    // gives us the question plus the extracted PDF text.
    const body = await request.json();
    const question = body.question?.trim();
    const documentText = body.documentText?.trim();

    if (!question) {
      return jsonError("Please send a question.", 400);
    }

    if (!documentText) {
      return jsonError("Please upload a PDF before asking a question.", 400);
    }

    // Gemini API flow:
    // answerQuestionFromDocument builds a document-focused prompt and sends it
    // to Gemini using the reusable utility in lib/gemini.js.
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
    // If JSON parsing, validation, environment variables, or Gemini fails, this
    // route still returns JSON so the frontend can display a friendly message.
    console.error("Gemini question answering failed:", error);

    return jsonError("Unable to answer the question right now.", 500);
  }
}
