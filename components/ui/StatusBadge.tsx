type StatusBadgeTone = "green" | "blue" | "amber" | "slate";

type StatusBadgeProps = {
  children: string;
  tone?: StatusBadgeTone;
};

const toneClasses: Record<StatusBadgeTone, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  blue: "bg-sky-50 text-sky-700 ring-sky-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
};

export function StatusBadge({ children, tone = "slate" }: StatusBadgeProps) {
  return (
    <span
      // Badges keep workflow states readable without creating one-off styles.
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}

