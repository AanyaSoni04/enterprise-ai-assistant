import { StatusBadge } from "@/components/ui/StatusBadge";

const navigationItems = [
  "Dashboard",
  "Documents",
  "Ask AI",
  "Summaries",
  "Action Items",
  "Settings",
];

export function Sidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-slate-950 text-white lg:flex lg:flex-col">
      <div className="border-b border-white/10 px-6 py-5">
        <p className="text-sm font-semibold text-sky-200">Enterprise AI</p>
        <h1 className="mt-1 text-lg font-semibold">Knowledge Assistant</h1>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-5" aria-label="Main navigation">
        {navigationItems.map((item) => (
          <button
            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            key={item}
            type="button"
          >
            <span>{item}</span>
            {item === "Dashboard" && <span className="h-2 w-2 rounded-full bg-sky-300" />}
          </button>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-lg bg-white/10 p-4">
          <StatusBadge tone="blue">Setup phase</StatusBadge>
          <p className="mt-3 text-sm leading-6 text-slate-200">
            Architecture first, workflows next.
          </p>
        </div>
      </div>
    </aside>
  );
}

