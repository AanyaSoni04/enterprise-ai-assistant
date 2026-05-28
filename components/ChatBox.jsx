"use client";

import { useState } from "react";

export default function ChatBox({ documentText = "" }) {
  // React state:
  // question stores what the user types.
  // documentText comes from the uploaded PDF and is passed in by the parent.
  // aiResponse stores the answer returned by the API.
  // isLoading controls the spinner and disables the button while waiting.
  // errorMessage stores friendly feedback if the request fails.
  const [question, setQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Event handling:
  // This function runs when the user submits the form by clicking Ask or
  // pressing Enter inside the textarea.
  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      setErrorMessage("Please enter a question before asking the assistant.");
      setAiResponse("");
      return;
    }

    if (!documentText.trim()) {
      setErrorMessage("Please upload a PDF before asking a question.");
      setAiResponse("");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setAiResponse("");

    try {
      // API communication:
      // This frontend component sends both pieces the backend needs:
      // 1. the user's question
      // 2. the extracted PDF text
      // The backend route uses Gemini to answer from the document text.
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: trimmedQuestion,
          documentText,
        }),
      });

      // Async flow:
      // response.json() is asynchronous because the browser needs to read the
      // response body before JavaScript can use it.
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "The assistant could not answer right now.");
      }

      setAiResponse(data.answer || "No answer was returned.");
    } catch (error) {
      // Error handling:
      // If the API route does not exist yet, the network fails, or the backend
      // returns an error, we show a clear message instead of breaking the UI.
      setErrorMessage(error.message);
    } finally {
      // Rendering flow:
      // Updating isLoading to false triggers React to re-render the component,
      // hide the spinner, and enable the Ask button again.
      setIsLoading(false);
    }
  };

  return (
    <section className="w-full rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      {/* Header rendering:
          This section explains the purpose of the chat area without mixing that
          copy into the event handling logic above. */}
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
          AI Assistant
        </p>
        <h2 className="mt-2 text-lg font-semibold text-slate-950">
          Ask a question
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Ask about uploaded document content. The question and extracted PDF
          text are sent to the Gemini backend API.
        </p>
      </header>

      {/* Form rendering:
          Tailwind utilities create spacing, borders, focus states, and responsive
          sizing without writing custom CSS. */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            className="mb-2 block text-sm font-medium text-slate-700"
            htmlFor="question"
          >
            Question
          </label>
          <textarea
            className="min-h-32 w-full resize-y rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
            disabled={isLoading}
            id="question"
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Example: What are the main risks mentioned in this document?"
            value={question}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            {documentText
              ? "Responses will be based on the uploaded PDF text."
              : "Upload a PDF first so the assistant has document text."}
          </p>

          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isLoading}
            type="submit"
          >
            {isLoading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            )}
            {isLoading ? "Asking" : "Ask AI"}
          </button>
        </div>
      </form>

      {/* Response rendering:
          React conditionally shows an error, an answer, or an empty placeholder
          based on the current state values. */}
      <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-700">AI response</p>

        {errorMessage && (
          <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm leading-6 text-red-700">
            {errorMessage}
          </p>
        )}

        {!errorMessage && aiResponse && (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {aiResponse}
          </p>
        )}

        {!errorMessage && !aiResponse && (
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Your answer will appear here after you ask a question.
          </p>
        )}
      </div>
    </section>
  );
}
