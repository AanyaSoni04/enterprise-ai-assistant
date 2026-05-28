"use client";

import { useState } from "react";
import ChatBox from "@/components/ChatBox";
import UploadBox from "@/components/UploadBox";

export default function HomePage() {
  // Shared page state:
  // documentText stores the extracted PDF text returned by the upload API.
  // It lives in page.js because both child components need the same data flow:
  // UploadBox sets it, and ChatBox reads it.
  const [documentText, setDocumentText] = useState("");

  return (
    // Component rendering:
    // This App Router page renders the two main features directly:
    // 1. UploadBox for PDF upload and text extraction
    // 2. ChatBox for asking Gemini questions about that text
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      {/* Layout structure:
          The wrapper centers the dashboard, limits width on large screens,
          and uses gap-8 for clean enterprise-style spacing between sections. */}
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
            Enterprise Knowledge Assistant
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Upload documents for AI-powered analysis
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Add PDF files, extract their text, and ask AI questions based on
            the uploaded document.
          </p>
        </header>

        {/* Architecture:
            UploadBox receives setDocumentText so it can save extracted PDF text
            into this page's state after the backend upload API responds. */}
        <UploadBox setDocumentText={setDocumentText} />

        {/* Architecture:
            ChatBox receives documentText so it can send both the user's question
            and the extracted PDF text to the Gemini backend API. */}
        <ChatBox documentText={documentText} />
      </div>
    </main>
  );
}
