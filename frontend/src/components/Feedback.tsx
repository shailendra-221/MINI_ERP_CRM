import { AlertCircle, Inbox } from "lucide-react";

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
      <AlertCircle size={18} className="shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <Inbox size={32} className="text-slate-300" />
      <p className="font-medium text-ink-700">{title}</p>
      {subtitle && <p className="text-sm text-ink-500 max-w-sm">{subtitle}</p>}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-6 w-6 rounded-full border-2 border-slate-200 border-t-brand-500 animate-spin" />
    </div>
  );
}
