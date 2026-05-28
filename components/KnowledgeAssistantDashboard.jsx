"use client";

import { useState } from "react";
import ChatBox from "@/components/ChatBox";
import UploadBox from "@/components/UploadBox";

export default function KnowledgeAssistantDashboard() {
  // Shared state:
  // UploadBox extracts text from the PDF, but ChatBox also needs that text.
  // So the parent component stores extractedDocumentText and passes it down.
  const [extractedDocumentText, setExtractedDocumentText] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <UploadBox onTextExtracted={setExtractedDocumentText} />
      <ChatBox documentText={extractedDocumentText} />
    </div>
  );
}
