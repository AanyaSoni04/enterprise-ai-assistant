import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function DocumentUploadCard() {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <StatusBadge tone="amber">PDF workflow pending</StatusBadge>
          <h3 className="mt-4 text-lg font-semibold text-slate-950">Upload knowledge PDFs</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            This reusable card will later connect to PDF validation, text extraction, and document indexing.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button disabled>Upload PDF</Button>
          <Button variant="secondary">View architecture</Button>
        </div>
      </div>
    </div>
  );
}

