import { useEffect, useState, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, User } from "lucide-react";
import { fetchChallan, changeChallanStatus } from "../../api/challans";
import { Challan } from "../../api/types";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { Spinner, ErrorBanner } from "../../components/Feedback";
import { apiErrorMessage } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

export default function ChallanDetail() {
  const { id } = useParams();
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const [challan, setChallan] = useState<Challan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const c = await fetchChallan(id);
      setChallan(c);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load challan."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleStatusChange(status: "CONFIRMED" | "CANCELLED") {
    if (!id) return;
    setActing(true);
    setActionError("");
    try {
      await changeChallanStatus(id, status);
      await load();
    } catch (err) {
      setActionError(apiErrorMessage(err, "Could not update challan status."));
    } finally {
      setActing(false);
    }
  }

  if (loading) return <Spinner />;
  if (error && !challan) return <ErrorBanner message={error} />;
  if (!challan) return null;

  const canConfirm = challan.status === "DRAFT" && hasRole("ADMIN", "SALES", "WAREHOUSE");
  const canCancel = challan.status !== "CANCELLED" && hasRole("ADMIN", "SALES", "WAREHOUSE");
  const total = challan.items.reduce((sum, i) => sum + Number(i.lineTotal), 0);

  return (
    <div>
      <PageHeader
        title={challan.challanNumber}
        subtitle={
          <span className="flex items-center gap-2">
            <Link to={`/customers/${challan.customerId}`} className="hover:text-brand-600 flex items-center gap-1.5">
              <User size={13} /> {challan.customer?.name}
            </Link>
          </span>
        }
        action={<StatusBadge status={challan.status} />}
      />

      {actionError && (
        <div className="mb-4">
          <ErrorBanner message={actionError} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-ink-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left font-semibold px-4 py-3">Product</th>
                    <th className="text-right font-semibold px-4 py-3">Unit price</th>
                    <th className="text-right font-semibold px-4 py-3">Qty</th>
                    <th className="text-right font-semibold px-4 py-3">Line total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {challan.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink-800">{item.productName}</p>
                        <p className="code text-ink-400">{item.productSku}</p>
                      </td>
                      <td className="px-4 py-3 text-right text-ink-600">₹{Number(item.unitPrice).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-ink-700">{item.quantity}</td>
                      <td className="px-4 py-3 text-right font-medium text-ink-900">
                        ₹{Number(item.lineTotal).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-200">
                    <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-ink-700">
                      Total ({challan.totalQuantity} units)
                    </td>
                    <td className="px-4 py-3 text-right font-display font-semibold text-ink-900">
                      ₹{total.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <p className="text-xs text-ink-400 mt-3">
            Product name, SKU and price shown above are a snapshot taken when this challan was created — they won't
            change even if the product catalog is updated later.
          </p>
        </div>

        <div className="space-y-4">
          <div className="card p-5 space-y-2 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 mb-2">Challan info</p>
            <p className="text-ink-500">
              Created by: <span className="text-ink-800 font-medium">{challan.createdBy?.name || "—"}</span>
            </p>
            <p className="text-ink-500">
              Created: <span className="text-ink-800 font-medium">{new Date(challan.createdAt).toLocaleString()}</span>
            </p>
            {challan.confirmedAt && (
              <p className="text-ink-500">
                Confirmed: <span className="text-ink-800 font-medium">{new Date(challan.confirmedAt).toLocaleString()}</span>
              </p>
            )}
            {challan.cancelledAt && (
              <p className="text-ink-500">
                Cancelled: <span className="text-ink-800 font-medium">{new Date(challan.cancelledAt).toLocaleString()}</span>
              </p>
            )}
          </div>

          {(canConfirm || canCancel) && (
            <div className="card p-5 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 mb-1">Actions</p>
              {canConfirm && (
                <button
                  disabled={acting}
                  onClick={() => handleStatusChange("CONFIRMED")}
                  className="btn-primary w-full"
                >
                  <CheckCircle2 size={16} /> Confirm & reduce stock
                </button>
              )}
              {canCancel && (
                <button disabled={acting} onClick={() => handleStatusChange("CANCELLED")} className="btn-danger w-full">
                  <XCircle size={16} /> {challan.status === "CONFIRMED" ? "Cancel & restore stock" : "Cancel challan"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
