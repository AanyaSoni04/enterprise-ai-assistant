import path from "node:path";
import { pathToFileURL } from "node:url";

// This route uses Node.js APIs for file buffers and PDF parsing, so we choose
// the Node runtime instead of the more limited Edge runtime.
export const runtime = "nodejs";

function jsonError(message, status = 500) {
  // Small helper:
  // Returning errors through one helper keeps every failure response as JSON.
  // This prevents the frontend from receiving an HTML error page for normal
  // validation or parsing failures.
  return Response.json(
    {
      success: false,
      error: message,
    },
    { status },
  );
}

async function createPdfParser(fileBuffer) {
  // Import timing:
  // pdf-parse is imported inside the request flow instead of at the top of the
  // file. If the library ever fails to load, our POST try/catch can return JSON
  // instead of Next.js returning its default HTML error page.
  const { PDFParse } = await import("pdf-parse");

  // Worker setup:
  // pdf-parse uses pdf.js internally. pdf.js needs a worker file to read PDFs.
  // In Next.js dev builds, pdf.js may guess the wrong worker location inside
  // .next/dev/server/chunks. We avoid that by giving it the real worker file
  // from node_modules as a file:// URL.
  //
  // Important: we do NOT import "pdf-parse/worker" here because that submodule
  // loads @napi-rs/canvas. On this Windows setup, that native canvas binding is
  // the exact crash source from your error log.
  const workerPath = path.join(
    process.cwd(),
    "node_modules",
    "pdfjs-dist",
    "legacy",
    "build",
    "pdf.worker.mjs",
  );

  PDFParse.setWorker(pathToFileURL(workerPath).href);

  // Buffer flow:
  // fileBuffer contains the uploaded PDF bytes. PDFParse reads those bytes and
  // exposes helper methods like getText().
  return new PDFParse({ data: fileBuffer });
}

export async function POST(request) {
  let parser;

  try {
    // Request lifecycle:
    // The browser sends a POST request to /api/upload. Because the request body
    // contains a file, the frontend sends it as multipart/form-data.
    const contentType = request.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      return jsonError("Upload request must use multipart/form-data.", 400);
    }

    // FormData handling:
    // request.formData() reads the multipart body and gives us access to fields
    // such as "file". This is asynchronous because file data can be large.
    const formData = await request.formData();
    const uploadedFile = formData.get("file");

    if (!uploadedFile || typeof uploadedFile === "string") {
      return jsonError("Please upload a PDF file using the 'file' field.", 400);
    }

    // File validation:
    // The MIME type check is the main check. The filename check is a backup for
    // tools or browsers that do not send a reliable MIME type.
    const isPdfType = uploadedFile.type === "application/pdf";
    const isPdfName = uploadedFile.name.toLowerCase().endsWith(".pdf");

    if (!isPdfType && !isPdfName) {
      return jsonError("Only PDF files are supported.", 400);
    }

    // Async flow:
    // arrayBuffer() waits for the uploaded file bytes. await pauses this handler
    // until the bytes are available without blocking the whole server.
    const fileArrayBuffer = await uploadedFile.arrayBuffer();
    const fileBuffer = Buffer.from(fileArrayBuffer);

    // PDF parsing flow:
    // createPdfParser configures pdf.js correctly for Next.js, then getText()
    // extracts readable text from the PDF pages.
    parser = await createPdfParser(fileBuffer);
    const parsedPdf = await parser.getText();

    return Response.json({
      success: true,
      fileName: uploadedFile.name,
      text: parsedPdf.text || "",
    });
  } catch (error) {
    // Robust error handling:
    // Any crash during request parsing, library loading, worker setup, or PDF
    // extraction lands here. The frontend always receives JSON, so response.json()
    // will not fail with "Unexpected token '<'".
    console.error("PDF upload parsing failed:", error);

    return jsonError("Unable to extract text from the uploaded PDF.", 500);
  } finally {
    // Cleanup:
    // destroy() releases resources held by pdf.js after success or failure.
    await parser?.destroy();
  }
}
