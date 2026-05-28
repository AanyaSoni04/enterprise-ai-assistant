"use client";

import { useRef, useState } from "react";

export default function UploadBox() {
  // State management:
  // - selectedFile stores the PDF the user picked.
  // - errorMessage stores validation feedback, such as "PDF only".
  // - isDragging lets us highlight the drop area while a file is over it.
  // - isLoading shows a spinner during the fake upload step.
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // The hidden file input is controlled through this ref so the styled button
  // can open the native file picker without showing the browser default input.
  const fileInputRef = useRef(null);

  // File validation:
  // This function keeps all PDF checks in one place. For now, the frontend only
  // accepts files whose MIME type is application/pdf or whose name ends in .pdf.
  const validatePdfFile = (file) => {
    if (!file) {
      return "Please choose a PDF file.";
    }

    const isPdfType = file.type === "application/pdf";
    const isPdfName = file.name.toLowerCase().endsWith(".pdf");

    if (!isPdfType && !isPdfName) {
      return "Only PDF files are accepted.";
    }

    return "";
  };

  // Event handler:
  // This function runs after a file is selected or dropped. It validates the
  // file, updates state, and shows a short loading state for frontend feedback.
  const handleFile = (file) => {
    const validationError = validatePdfFile(file);

    if (validationError) {
      setSelectedFile(null);
      setErrorMessage(validationError);
      setIsLoading(false);
      return;
    }

    setSelectedFile(file);
    setErrorMessage("");
    setIsLoading(true);

    // No backend logic yet. This timeout only demonstrates loading UI while the
    // real upload API is still future work.
    window.setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  // Event handler:
  // Opens the hidden file input when the visible upload button is clicked.
  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Event handler:
  // Reads the selected file from the browser's file picker.
  const handleInputChange = (event) => {
    const file = event.target.files?.[0];
    handleFile(file);

    // Clearing the value lets the user pick the same file again if needed.
    event.target.value = "";
  };

  // Event handler:
  // Prevents the browser from opening the dragged file and highlights the box.
  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  // Event handler:
  // Removes the active drag styling when the file leaves the drop area.
  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Event handler:
  // Reads the dropped file and sends it through the same validation path as the
  // file picker, so drag/drop and button upload behave consistently.
  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    handleFile(file);
  };

  return (
    <section className="w-full rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      {/* Header section: gives the upload area dashboard context. */}
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
          Document Intake
        </p>
        <h2 className="mt-2 text-lg font-semibold text-slate-950">
          Upload PDF document
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Add a PDF that will later be used for text extraction, summaries, Q&A,
          and action item detection.
        </p>
      </div>

      {/* Drop zone section: handles drag/drop and communicates accepted file type. */}
      <div
        className={`flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center transition-colors sm:p-8 ${
          isDragging
            ? "border-sky-400 bg-sky-50"
            : "border-slate-300 bg-slate-50"
        }`}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-slate-950 text-sm font-semibold text-white">
          PDF
        </div>

        <h3 className="mt-4 text-base font-semibold text-slate-950">
          Drag and drop your PDF here
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Only `.pdf` files are accepted for this workflow.
        </p>

        {/* Hidden native input: keeps browser file selection accessible. */}
        <input
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={handleInputChange}
          ref={fileInputRef}
          type="file"
        />

        {/* Upload button section: opens the file picker and shows loading state. */}
        <button
          className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isLoading}
          onClick={handleUploadButtonClick}
          type="button"
        >
          {isLoading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          )}
          {isLoading ? "Preparing file" : "Choose PDF"}
        </button>
      </div>

      {/* Feedback section: shows either validation errors or selected file details. */}
      <div className="mt-4 min-h-10">
        {errorMessage && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        {selectedFile && !errorMessage && (
          <div className="flex flex-col gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-medium">{selectedFile.name}</span>
            <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
        )}
      </div>
    </section>
  );
}
