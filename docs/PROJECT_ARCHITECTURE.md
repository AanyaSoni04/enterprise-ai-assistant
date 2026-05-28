# Enterprise AI Knowledge Assistant Architecture

This document is the project map for the first build phase. It keeps routing, UI, AI logic, and document logic in separate places so each feature stays easier to understand as the app grows.

## Recommended Folder Structure

```text
enterprise-ai-assistant/
├─ app/
│  ├─ api/
│  │  ├─ documents/
│  │  │  └─ route.ts              # Future endpoint for PDF upload and text extraction.
│  │  └─ assistant/
│  │     └─ route.ts              # Future endpoint for Gemini-powered Q&A, summaries, and actions.
│  ├─ layout.tsx                  # Root HTML shell shared by every route.
│  ├─ page.tsx                    # Dashboard home screen.
│  └─ globals.css                 # Global Tailwind CSS theme and base styles.
├─ components/
│  ├─ document/
│  │  └─ DocumentUploadCard.tsx   # Reusable upload area UI for PDFs.
│  ├─ layout/
│  │  ├─ DashboardShell.tsx       # Enterprise dashboard frame.
│  │  ├─ Sidebar.tsx              # Primary app navigation.
│  │  └─ Topbar.tsx               # Page title, search, and account area.
│  └─ ui/
│     ├─ Button.tsx               # Shared button styles.
│     ├─ Panel.tsx                # Shared dashboard panel container.
│     └─ StatusBadge.tsx          # Small status indicator labels.
├─ docs/
│  └─ PROJECT_ARCHITECTURE.md     # This beginner-friendly architecture guide.
├─ lib/
│  ├─ ai/
│  │  └─ gemini.ts                # Future Gemini API wrapper.
│  ├─ documents/
│  │  ├─ extractPdfText.ts        # Future PDF text extraction helper.
│  │  └─ splitTextIntoChunks.ts   # Future helper for sending long documents to AI safely.
│  └─ types.ts                    # Shared TypeScript types for documents and assistant responses.
└─ public/                        # Static files such as logos and icons.
```

The folders under `app/api` and `lib` are listed now as the recommended shape, but they are intentionally not implemented in this first task. We will add them when we build the upload, extraction, and Gemini workflows.

## Data Flow

1. A user opens the dashboard and uploads one or more PDFs from the upload card.
2. The browser sends the file to a future `app/api/documents/route.ts` endpoint.
3. The document endpoint validates the PDF, extracts text, and stores document metadata.
4. The extracted text is split into smaller chunks so the AI request stays reliable.
5. When the user asks a question, requests a summary, or asks for action items, the browser calls a future `app/api/assistant/route.ts` endpoint.
6. The assistant endpoint builds a focused prompt from the user request plus the relevant document text.
7. The Gemini API returns an answer, summary, or action-item list.
8. The UI displays the result in reusable dashboard panels.

For a beginner mental model: the frontend collects input, route handlers protect server-only work, `lib` contains reusable business logic, and components display the experience.

## Initial Reusable Components

- `DashboardShell`: wraps every dashboard page with a sidebar and topbar.
- `Sidebar`: shows the main product areas without hard-coding business logic into pages.
- `Topbar`: keeps page-level context, search, and user identity in one place.
- `Panel`: standardizes bordered dashboard sections.
- `Button`: standardizes primary, secondary, and subtle actions.
- `StatusBadge`: standardizes small status labels for documents and workflows.
- `DocumentUploadCard`: provides the first PDF upload UI placeholder.

