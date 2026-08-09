import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { Pencil, Phone, Mail, Building2, FileText, Plus } from "lucide-react";
import { fetchCustomer, addFollowUp } from "../../api/customers";
import { Customer } from "../../api/types";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { Spinner, ErrorBanner } from "../../components/Feedback";
import { apiErrorMessage } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

export default function CustomerDetail() {
  const { id } = useParams();
  const { hasRole } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const c = await fetchCustomer(id);
      setCustomer(c);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load customer."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !note.trim()) return;
    setSubmitting(true);
    try {
      await addFollowUp(id, note.trim(), followUpDate ? new Date(followUpDate).toISOString() : undefined);
      setNote("");
      setFollowUpDate("");
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not add follow-up."));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Spinner />;
  if (error && !customer) return <ErrorBanner message={error} />;
  if (!customer) return null;

  return (
    <div>
      <PageHeader
        title={customer.name}
        subtitle={customer.businessName || undefined}
        action={
          hasRole("ADMIN", "SALES") && (
            <Link to={`/customers/${customer.id}/edit`} className="btn-secondary">
              <Pencil size={15} /> Edit
            </Link>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Overview</p>
              <StatusBadge status={customer.status} />
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5 text-ink-700">
                <Phone size={15} className="text-ink-400 shrink-0" />
                <span className="code">{customer.mobile}</span>
              </li>
              {customer.email && (
                <li className="flex items-center gap-2.5 text-ink-700">
                  <Mail size={15} className="text-ink-400 shrink-0" />
                  {customer.email}
                </li>
              )}
              {customer.businessName && (
                <li className="flex items-center gap-2.5 text-ink-700">
                  <Building2 size={15} className="text-ink-400 shrink-0" />
                  {customer.businessName}
                </li>
              )}
              {customer.gstNumber && (
                <li className="flex items-center gap-2.5 text-ink-700">
                  <span className="text-ink-400 text-xs font-semibold w-4">GST</span>
                  <span className="code">{customer.gstNumber}</span>
                </li>
              )}
            </ul>
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5 text-sm">
              <p className="text-ink-500">
                Type: <span className="text-ink-800 font-medium">{customer.customerType}</span>
              </p>
              {customer.address && <p className="text-ink-500">{customer.address}</p>}
              {customer.followUpDate && (
                <p className="text-ink-500">
                  Next follow-up:{" "}
                  <span className="text-ink-800 font-medium">
                    {new Date(customer.followUpDate).toLocaleDateString()}
                  </span>
                </p>
              )}
            </div>
            {customer.notes && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 mb-1.5">Notes</p>
                <p className="text-sm text-ink-600 whitespace-pre-wrap">{customer.notes}</p>
              </div>
            )}
          </div>

          <div className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 mb-3 flex items-center gap-1.5">
              <FileText size={13} /> Recent challans
            </p>
            {!customer.challans || customer.challans.length === 0 ? (
              <p className="text-sm text-ink-500">No challans yet.</p>
            ) : (
              <ul className="space-y-2">
                {customer.challans.map((c) => (
                  <li key={c.id} className="flex items-center justify-between text-sm">
                    <Link to={`/challans/${c.id}`} className="code text-brand-600 hover:underline">
                      {c.challanNumber}
                    </Link>
                    <StatusBadge status={c.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 mb-4">Follow-up notes</p>

            {hasRole("ADMIN", "SALES") && (
              <form onSubmit={handleAddNote} className="mb-5 space-y-3 bg-slate-50 rounded-lg p-4 border border-slate-100">
                <textarea
                  className="input"
                  rows={2}
                  placeholder="Add a follow-up note…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                  <input
                    type="date"
                    className="input sm:w-48"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                  />
                  <button type="submit" disabled={submitting || !note.trim()} className="btn-primary sm:ml-auto">
                    <Plus size={15} /> {submitting ? "Adding…" : "Add note"}
                  </button>
                </div>
              </form>
            )}

            {error && (
              <div className="mb-4">
                <ErrorBanner message={error} />
              </div>
            )}

            {!customer.followUps || customer.followUps.length === 0 ? (
              <p className="text-sm text-ink-500">No follow-up notes recorded yet.</p>
            ) : (
              <ul className="space-y-4">
                {customer.followUps.map((f) => (
                  <li key={f.id} className="border-l-2 border-brand-200 pl-4">
                    <p className="text-sm text-ink-800">{f.note}</p>
                    <p className="text-xs text-ink-400 mt-1">
                      {new Date(f.createdAt).toLocaleString()}
                      {f.createdBy?.name ? ` · ${f.createdBy.name}` : ""}
                      {f.followUpDate ? ` · Next: ${new Date(f.followUpDate).toLocaleDateString()}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
