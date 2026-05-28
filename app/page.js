import UploadBox from "@/components/UploadBox";

export default function HomePage() {
  return (
    // Component rendering:
    // This page renders the reusable UploadBox component as the main dashboard feature.
    // In the App Router, this default export becomes the UI for the "/" route.
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      {/* Layout structure:
          The outer page creates a full-height dashboard background.
          This inner wrapper centers the content and limits the width so the UI
          feels professional on large monitors and still fits on mobile screens. */}
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        {/* Header section:
            Tailwind utilities handle spacing, alignment, and typography.
            For example, text-center centers the copy, gap-8 adds vertical rhythm,
            and responsive classes like sm:text-4xl adjust styling on wider screens. */}
        <header className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
            Enterprise Knowledge Assistant
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Upload documents for AI-powered analysis
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Add PDF files that will later power document Q&A, summaries, and
            action item extraction.
          </p>
        </header>

        {/* Upload section:
            The UploadBox contains the drag-and-drop UI, PDF validation, loading
            spinner, and file feedback. Keeping it in its own component makes it
            reusable on future dashboard pages. */}
        <UploadBox />
      </div>
    </main>
  );
}
