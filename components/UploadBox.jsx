"use client";

import { useRef, useState } from "react";

export default function UploadBox({ onTextExtracted }) {
  // State management:
  // - selectedFile stores the PDF the user picked.
  // - extractedText stores the text returned by our backend upload API.
  // - successMessage tells the user the upload and extraction worked.
  // - errorMessage stores validation feedback, such as "PDF only".
  // - isDragging lets us highlight the drop area while a file is over it.
  // - isLoading shows a spinner while the frontend waits for the backend.
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
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

  // Backend communication:
  // This helper sends the selected PDF to our Next.js API route at /api/upload.
  // Keeping the API request in its own function makes the component easier to
  // read and makes this upload logic reusable later.
  const uploadPdfToBackend = async (file) => {
    // FormData:
    // FormData is the browser's built-in way to send files through an HTTP
    // request. The backend route expects the PDF under the field name "file".
    const formData = new FormData();
    formData.append("file", file);

    // fetch API:
    // fetch sends the FormData to our backend. We do not manually set the
    // Content-Type header here because the browser must add the correct
    // multipart boundary for file uploads.
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "PDF upload failed.");
    }

    return data;
  };

  // Event handler:
  // This function runs after a file is selected or dropped. It validates the
  // file, sends it to the backend, and stores the extracted text response.
  const handleFile = async (file) => {
    const validationError = validatePdfFile(file);

    if (validationError) {
      setSelectedFile(null);
      setExtractedText("");
      setSuccessMessage("");
      setErrorMessage(validationError);
      setIsLoading(false);
      return;
    }

    // State updates:
    // These updates trigger React to re-render the UI with the selected file,
    // clear old messages, and show the loading spinner.
    setSelectedFile(file);
    setExtractedText("");
    setSuccessMessage("");
    setErrorMessage("");
    setIsLoading(true);

    try {
      // async/await:
      // uploadPdfToBackend returns a promise because HTTP requests take time.
      // await pauses this handler until the backend extracts text and responds.
      const data = await uploadPdfToBackend(file);
      const nextExtractedText = data.text || "";

      setExtractedText(nextExtractedText);
      // State sharing:
      // UploadBox owns the upload UI, but a parent component may need the text
      // for ChatBox. This optional callback passes the extracted text upward.
      onTextExtracted?.(nextExtractedText);
      setSuccessMessage(
        `Upload complete. Extracted text from ${data.fileName}.`,
      );
    } catch (error) {
      setSelectedFile(null);
      setExtractedText("");
      onTextExtracted?.("");
      setSuccessMessage("");
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
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
          {isLoading ? "Uploading PDF" : "Choose PDF"}
        </button>
      </div>

      {/* Feedback section: shows validation errors, upload success, and file details. */}
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

        {successMessage && (
          <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {successMessage}
          </p>
        )}

        {extractedText && (
          <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-medium text-slate-700">
              Extracted text preview
            </p>
            <p className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {extractedText.slice(0, 1200)}
              {extractedText.length > 1200 ? "..." : ""}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
