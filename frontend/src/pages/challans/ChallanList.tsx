import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import { fetchChallans } from "../../api/challans";
import { Challan } from "../../api/types";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import Pagination from "../../components/Pagination";
import { Spinner, EmptyState, ErrorBanner } from "../../components/Feedback";
import { apiErrorMessage } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

export default function ChallanList() {
  const { hasRole } = useAuth();
  const [params, setParams] = useSearchParams();
  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const search = params.get("search") || "";
  const status = params.get("status") || "";
  const page = parseInt(params.get("page") || "1", 10);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchChallans({ page, limit: 10, search: search || undefined, status: status || undefined });
      setChallans(res.data);
      setPagination({ page: res.pagination.page, totalPages: res.pagination.totalPages, total: res.pagination.total });
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load challans."));
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    load();
  }, [load]);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set("page", "1");
    setParams(next);
  }

  return (
    <div>
      <PageHeader
        title="Sales challans"
        subtitle="Draft, confirm and track dispatch challans."
        action={
          hasRole("ADMIN", "SALES") && (
            <Link to="/challans/new" className="btn-primary">
              <Plus size={16} /> New challan
            </Link>
          )
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search by challan number or customer…"
            defaultValue={search}
            onKeyDown={(e) => {
              if (e.key === "Enter") updateParam("search", (e.target as HTMLInputElement).value);
            }}
            onBlur={(e) => updateParam("search", e.target.value)}
          />
        </div>
        <select className="input sm:w-48" value={status} onChange={(e) => updateParam("status", e.target.value)}>
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} />
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <Spinner />
        ) : challans.length === 0 ? (
          <EmptyState title="No challans found" subtitle="Try adjusting your filters, or create a new challan." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-ink-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left font-semibold px-4 py-3">Challan #</th>
                  <th className="text-left font-semibold px-4 py-3">Customer</th>
                  <th className="text-right font-semibold px-4 py-3 hidden sm:table-cell">Total qty</th>
                  <th className="text-left font-semibold px-4 py-3">Status</th>
                  <th className="text-right font-semibold px-4 py-3 hidden md:table-cell">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {challans.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <Link to={`/challans/${c.id}`} className="code text-brand-600 hover:underline">
                        {c.challanNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-700">{c.customer?.name}</td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell text-ink-700">{c.totalQuantity}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-right hidden md:table-cell text-ink-400 text-xs">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onChange={(p) => updateParam("page", String(p))}
      />
    </div>
  );
}
