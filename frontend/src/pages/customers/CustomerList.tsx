import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Plus, Phone } from "lucide-react";
import { fetchCustomers } from "../../api/customers";
import { Customer } from "../../api/types";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import Pagination from "../../components/Pagination";
import { Spinner, EmptyState, ErrorBanner } from "../../components/Feedback";
import { apiErrorMessage } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

export default function CustomerList() {
  const { hasRole } = useAuth();
  const [params, setParams] = useSearchParams();
  const [customers, setCustomers] = useState<Customer[]>([]);
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
      const res = await fetchCustomers({ page, limit: 10, search: search || undefined, status: status || undefined });
      setCustomers(res.data);
      setPagination({ page: res.pagination.page, totalPages: res.pagination.totalPages, total: res.pagination.total });
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load customers."));
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
        title="Customers"
        subtitle="Leads, active accounts and follow-ups in one place."
        action={
          hasRole("ADMIN", "SALES") && (
            <Link to="/customers/new" className="btn-primary">
              <Plus size={16} /> Add customer
            </Link>
          )
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search by name, mobile, business or email…"
            defaultValue={search}
            onKeyDown={(e) => {
              if (e.key === "Enter") updateParam("search", (e.target as HTMLInputElement).value);
            }}
            onBlur={(e) => updateParam("search", e.target.value)}
          />
        </div>
        <select className="input sm:w-48" value={status} onChange={(e) => updateParam("status", e.target.value)}>
          <option value="">All statuses</option>
          <option value="LEAD">Lead</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
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
        ) : customers.length === 0 ? (
          <EmptyState title="No customers found" subtitle="Try adjusting your search or filters, or add a new customer." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-ink-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left font-semibold px-4 py-3">Name</th>
                  <th className="text-left font-semibold px-4 py-3 hidden sm:table-cell">Contact</th>
                  <th className="text-left font-semibold px-4 py-3 hidden md:table-cell">Type</th>
                  <th className="text-left font-semibold px-4 py-3">Status</th>
                  <th className="text-left font-semibold px-4 py-3 hidden lg:table-cell">Follow-up</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <Link to={`/customers/${c.id}`} className="font-medium text-ink-800 hover:text-brand-600">
                        {c.name}
                      </Link>
                      {c.businessName && <p className="text-xs text-ink-500">{c.businessName}</p>}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-ink-600">
                      <span className="flex items-center gap-1.5 code text-xs">
                        <Phone size={12} /> {c.mobile}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-ink-600">{c.customerType}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-ink-500 text-xs">
                      {c.followUpDate ? new Date(c.followUpDate).toLocaleDateString() : "—"}
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
