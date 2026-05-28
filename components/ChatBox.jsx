"use client";

import { useState } from "react";

export default function ChatBox({ documentText = "" }) {
  // React state:
  // question stores what the user types.
  // documentText comes from the uploaded PDF and is passed in by the parent.
  // aiResponse stores the answer returned by the API.
  // summary stores the generated document summary.
  // actionItems stores the task/deadline/responsibility text returned by Gemini.
  // isLoading controls the Ask AI spinner while waiting for a question answer.
  // isSummaryLoading controls the Generate Summary spinner separately.
  // isActionItemsLoading controls the Extract Action Items spinner separately.
  // errorMessage stores friendly feedback if the request fails.
  const [question, setQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [summary, setSummary] = useState("");
  const [actionItems, setActionItems] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isActionItemsLoading, setIsActionItemsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Rendering helper:
  // Gemini returns action items as text. This helper turns that text into a
  // simple array so React can render each item as its own enterprise-style card.
  const actionItemCards = actionItems
    .split("\n")
    .map((item) => item.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);

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
      const response = await fetch("/api/chat", {
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

  // Button click flow:
  // This handler runs when the user clicks "Generate Summary". It sends only
  // the extracted PDF text to the summary API because no question is needed.
  const handleGenerateSummary = async () => {
    if (!documentText.trim()) {
      setErrorMessage("Please upload a PDF before generating a summary.");
      setSummary("");
      return;
    }

    // React state updates:
    // These updates clear old messages and trigger a re-render with a loading
    // spinner while the API request is running.
    setIsSummaryLoading(true);
    setErrorMessage("");
    setSummary("");

    try {
      // API request:
      // fetch sends a POST request to our summary route. We send JSON because
      // the backend only needs text, not a file upload.
      const response = await fetch("/api/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documentText }),
      });

      // Async flow:
      // response.json() waits for the backend to finish reading and formatting
      // the Gemini response before React can display it.
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "The summary could not be generated.");
      }

      setSummary(data.summary || "No summary was returned.");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      // This final state update hides the summary spinner no matter whether the
      // request succeeded or failed.
      setIsSummaryLoading(false);
    }
  };

  // Button click flow:
  // This handler runs when the user clicks "Extract Action Items". It sends the
  // extracted PDF text to the backend and asks Gemini to find tasks, deadlines,
  // and responsibilities.
  const handleExtractActionItems = async () => {
    if (!documentText.trim()) {
      setErrorMessage("Please upload a PDF before extracting action items.");
      setActionItems("");
      return;
    }

    // React state updates:
    // Clear old results, clear old errors, and show a dedicated loading spinner
    // for this action-item workflow.
    setIsActionItemsLoading(true);
    setErrorMessage("");
    setActionItems("");

    try {
      // API request:
      // We send JSON because the PDF was already converted into text by the
      // upload route. The action-items route then calls Gemini on the server.
      const response = await fetch("/api/action-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documentText }),
      });

      // Async flow:
      // await waits for the backend response, then waits again while the JSON
      // body is parsed into a normal JavaScript object.
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Action items could not be extracted.");
      }

      setActionItems(data.actionItems || "No action items were returned.");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsActionItemsLoading(false);
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

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSummaryLoading || isLoading || isActionItemsLoading}
              onClick={handleGenerateSummary}
              type="button"
            >
              {isSummaryLoading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
              )}
              {isSummaryLoading ? "Summarizing" : "Generate Summary"}
            </button>

            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isActionItemsLoading || isLoading || isSummaryLoading}
              onClick={handleExtractActionItems}
              type="button"
            >
              {isActionItemsLoading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
              )}
              {isActionItemsLoading ? "Extracting" : "Extract Actions"}
            </button>

            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isLoading || isSummaryLoading || isActionItemsLoading}
              type="submit"
            >
              {isLoading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}
              {isLoading ? "Asking" : "Ask AI"}
            </button>
          </div>
        </div>
      </form>

      {/* Summary rendering:
          When summary state has text, React displays this enterprise-style card.
          whitespace-pre-wrap preserves Gemini's line breaks and bullets. */}
      {summary && (
        <div className="mt-5 rounded-lg border border-sky-200 bg-sky-50 p-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-sky-950">
                Document summary
              </p>
              <p className="text-xs text-sky-700">
                Generated from the uploaded PDF text
              </p>
            </div>
            <span className="mt-2 inline-flex w-fit rounded-full bg-white px-2.5 py-1 text-xs font-medium text-sky-700 ring-1 ring-inset ring-sky-200 sm:mt-0">
              Gemini
            </span>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {summary}
          </p>
        </div>
      )}

      {/* Action item rendering:
          Each extracted task line becomes a separate card. This makes deadlines
          and responsibilities easier to scan in an enterprise dashboard. */}
      {actionItemCards.length > 0 && (
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-950">
                Action items
              </p>
              <p className="text-xs text-amber-700">
                Tasks, deadlines, and responsibilities found by Gemini
              </p>
            </div>
            <span className="mt-2 inline-flex w-fit rounded-full bg-white px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200 sm:mt-0">
              Extracted
            </span>
          </div>

          <div className="mt-4 grid gap-3">
            {actionItemCards.map((item, index) => (
              <article
                className="rounded-md border border-amber-200 bg-white p-4 shadow-sm"
                key={`${item}-${index}`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
                  Action {index + 1}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {item}
                </p>
              </article>
            ))}
          </div>
        </div>
      )}

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
