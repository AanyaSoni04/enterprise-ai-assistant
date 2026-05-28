type TopbarProps = {
  pageTitle: string;
};

export function Topbar({ pageTitle }: TopbarProps) {
  return (
    <header className="flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
          Workspace
        </p>
        <h2 className="text-lg font-semibold text-slate-950">{pageTitle}</h2>
      </div>

      <div className="hidden items-center gap-3 md:flex">
        <label className="sr-only" htmlFor="global-search">
          Search documents
        </label>
        <input
          className="h-10 w-72 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
          id="global-search"
          placeholder="Search documents"
          type="search"
        />
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-sm font-semibold text-white">
          SA
        </div>
      </div>
    </header>
  );
}

