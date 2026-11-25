import type { ReactNode } from 'react';

export const accountCard = 'rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7';
export const accountPrimary = 'inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-900 shadow-sm transition-colors hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50';
export const accountSecondary = 'inline-flex items-center justify-center gap-2 rounded-2xl border border-indigo-200 bg-white px-5 py-3 text-sm font-bold text-indigo-700 transition-colors hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600';
export const accountIcon = 'inline-flex shrink-0 items-center justify-center rounded-2xl bg-indigo-50 p-3 text-indigo-600';

export default function AccountLayout({
  title,
  description,
  children,
}: {
  title: ReactNode;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 font-sans text-slate-800 md:px-8 md:py-16">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="max-w-3xl space-y-3">
          <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 md:text-5xl">{title}</h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">{description}</p>
        </header>
        {children}
      </div>
    </div>
  );
}
