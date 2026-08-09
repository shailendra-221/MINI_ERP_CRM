const STYLES: Record<string, string> = {
  LEAD: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  INACTIVE: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
  DRAFT: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
  CONFIRMED: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
  IN: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  OUT: "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200",
};

export default function StatusBadge({ status }: { status: string }) {
  return <span className={`badge ${STYLES[status] || "bg-slate-100 text-slate-600"}`}>{status}</span>;
}
