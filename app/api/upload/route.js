import { PDFParse } from "pdf-parse";

// This route uses Node.js APIs through pdf-parse, so we explicitly choose the
// Node runtime instead of an edge/runtime-limited environment.
export const runtime = "nodejs";

export async function POST(request) {
  let parser;

  try {
    // Request handling:
    // The frontend should send the PDF as multipart/form-data with a field
    // named "file". In Next.js App Router route handlers, request.formData()
    // reads that uploaded form body for us.
    const formData = await request.formData();
    const uploadedFile = formData.get("file");

    // File validation:
    // Before parsing anything, confirm that the request actually includes a
    // file and that the browser marked it as a PDF. The filename check is a
    // backup because some browsers or tools may send an empty MIME type.
    if (!uploadedFile || typeof uploadedFile === "string") {
      return Response.json(
        { error: "Please upload a PDF file using the 'file' field." },
        { status: 400 },
      );
    }

    const isPdfType = uploadedFile.type === "application/pdf";
    const isPdfName = uploadedFile.name.toLowerCase().endsWith(".pdf");

    if (!isPdfType && !isPdfName) {
      return Response.json(
        { error: "Only PDF files are supported." },
        { status: 400 },
      );
    }

    // Async/await:
    // uploadedFile.arrayBuffer() is asynchronous because reading file bytes can
    // take time. await pauses this function until the bytes are ready without
    // blocking the whole server.
    const fileArrayBuffer = await uploadedFile.arrayBuffer();

    // PDF parsing flow:
    // pdf-parse expects binary PDF data. Buffer.from() converts the uploaded
    // ArrayBuffer into a Node.js Buffer that PDFParse can read.
    const fileBuffer = Buffer.from(fileArrayBuffer);
    parser = new PDFParse({ data: fileBuffer });

    // getText() reads the PDF pages and returns extracted text plus metadata.
    // We only return the text for now because Gemini will be added later.
    const parsedPdf = await parser.getText();

    return Response.json({
      fileName: uploadedFile.name,
      text: parsedPdf.text,
    });
  } catch (error) {
    // Error handling:
    // If the file is damaged, encrypted, too malformed to parse, or another
    // unexpected issue happens, this catch block prevents the server from
    // crashing and sends a clear JSON response to the frontend.
    console.error("PDF upload parsing failed:", error);

    return Response.json(
      { error: "Unable to extract text from the uploaded PDF." },
      { status: 500 },
    );
  } finally {
    // Cleanup:
    // pdf-parse can hold parsing resources internally. destroy() releases them
    // after parsing succeeds or fails.
    await parser?.destroy();
  }
}
