export async function GET() {
  // Environment variable check:
  // process.env.GEMINI_API_KEY reads the value from .env.local on the server.
  // We only check whether it exists. Never return the actual API key to the
  // browser because API keys are private secrets.
  const hasGeminiApiKey = Boolean(process.env.GEMINI_API_KEY);

  if (!hasGeminiApiKey) {
    // Simple JSON error response:
    // status 500 means the server is missing required configuration.
    return Response.json(
      {
        success: false,
        message: "GEMINI_API_KEY is missing. Add it to .env.local.",
      },
      { status: 500 },
    );
  }

  // Simple JSON success response:
  // This confirms the key is loaded without revealing the key itself.
  return Response.json({
    success: true,
    message: "GEMINI_API_KEY is loaded correctly.",
  });
}
