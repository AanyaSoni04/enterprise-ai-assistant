import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

type DashboardShellProps = {
  children: ReactNode;
  pageTitle: string;
};

export function DashboardShell({ children, pageTitle }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar pageTitle={pageTitle} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

