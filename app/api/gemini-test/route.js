import { GoogleGenAI } from "@google/genai";

// Gemini API calls use the official SDK on the server, so this route should run
// in the Node.js runtime where environment variables and server packages are available.
export const runtime = "nodejs";

export async function GET() {
  try {
    // Environment variable usage:
    // GEMINI_API_KEY should live in .env.local. We read it on the server with
    // process.env so the secret key is never exposed inside frontend code.
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        {
          success: false,
          error: "GEMINI_API_KEY is missing. Add it to .env.local.",
        },
        { status: 500 },
      );
    }

    // SDK setup:
    // GoogleGenAI is the official Gemini SDK client. It uses the API key to
    // authenticate this server route when it sends a request to Gemini.
    const ai = new GoogleGenAI({ apiKey });

    // Prompt:
    // This is the simple test message we send to confirm the API connection is
    // working before building the full document assistant workflow.
    const prompt = "Say hello from Gemini API";

    // Async API flow:
    // generateContent sends a network request to Gemini. await pauses this route
    // until Gemini returns a response, without blocking the whole server process.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    // JSON response:
    // We return only the AI text response and some safe metadata. We do not
    // return the API key or any private environment values.
    return Response.json({
      success: true,
      prompt,
      response: response.text || "",
    });
  } catch (error) {
    // Error handling:
    // If the API key is invalid, the network fails, or Gemini returns an error,
    // this block sends a clear JSON error instead of crashing the route.
    console.error("Gemini connectivity test failed:", error);

    return Response.json(
      {
        success: false,
        error: "Gemini API connectivity test failed.",
      },
      { status: 500 },
    );
  }
}
