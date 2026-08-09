import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { Pencil, ArrowDownCircle, ArrowUpCircle, AlertTriangle } from "lucide-react";
import { fetchProduct, addStockMovement } from "../../api/products";
import { Product } from "../../api/types";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import { Spinner, ErrorBanner } from "../../components/Feedback";
import { apiErrorMessage } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

export default function ProductDetail() {
  const { id } = useParams();
  const { hasRole } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [movementType, setMovementType] = useState<"IN" | "OUT">("IN");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const p = await fetchProduct(id);
      setProduct(p);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load product."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAddMovement(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    setFormError("");
    try {
      await addStockMovement(id, { quantity: parseInt(quantity, 10), movementType, reason });
      setQuantity("");
      setReason("");
      setShowForm(false);
      await load();
    } catch (err) {
      setFormError(apiErrorMessage(err, "Could not record stock movement."));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Spinner />;
  if (error && !product) return <ErrorBanner message={error} />;
  if (!product) return null;

  const low = product.currentStock <= product.minStockAlertQty;

  return (
    <div>
      <PageHeader
        title={product.name}
        subtitle={`SKU: ${product.sku}`}
        action={
          hasRole("ADMIN", "WAREHOUSE") && (
            <Link to={`/products/${product.id}/edit`} className="btn-secondary">
              <Pencil size={15} /> Edit
            </Link>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Current stock</p>
              {low && <AlertTriangle size={15} className="text-orange-500" />}
            </div>
            <p className={`text-3xl font-display font-semibold ${low ? "text-orange-600" : "text-ink-900"}`}>
              {product.currentStock}
            </p>
            <p className="text-xs text-ink-400 mt-1">Alert threshold: {product.minStockAlertQty}</p>

            {hasRole("ADMIN", "WAREHOUSE") && (
              <button className="btn-primary w-full mt-4" onClick={() => setShowForm((s) => !s)}>
                Adjust stock
              </button>
            )}

            {showForm && (
              <form onSubmit={handleAddMovement} className="mt-4 space-y-3 bg-slate-50 rounded-lg p-4 border border-slate-100">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMovementType("IN")}
                    className={`flex-1 btn ${movementType === "IN" ? "bg-emerald-600 text-white" : "btn-secondary"}`}
                  >
                    <ArrowDownCircle size={15} /> Stock IN
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementType("OUT")}
                    className={`flex-1 btn ${movementType === "OUT" ? "bg-orange-600 text-white" : "btn-secondary"}`}
                  >
                    <ArrowUpCircle size={15} /> Stock OUT
                  </button>
                </div>
                <div>
                  <label className="label">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="input"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Reason</label>
                  <input
                    className="input"
                    required
                    placeholder="e.g. Purchase order received, damaged goods, stock correction"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
                {formError && <ErrorBanner message={formError} />}
                <button type="submit" disabled={submitting} className="btn-primary w-full">
                  {submitting ? "Saving…" : "Record movement"}
                </button>
              </form>
            )}
          </div>

          <div className="card p-5 space-y-2 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 mb-2">Details</p>
            <p className="text-ink-500">
              Category: <span className="text-ink-800 font-medium">{product.category || "—"}</span>
            </p>
            <p className="text-ink-500">
              Unit price: <span className="text-ink-800 font-medium">₹{Number(product.unitPrice).toFixed(2)}</span>
            </p>
            <p className="text-ink-500">
              Location: <span className="text-ink-800 font-medium">{product.location || "—"}</span>
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 mb-4">Stock movement log</p>
            {!product.stockMovements || product.stockMovements.length === 0 ? (
              <p className="text-sm text-ink-500">No stock movements recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-ink-500 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="text-left font-semibold py-2">Type</th>
                      <th className="text-right font-semibold py-2">Qty</th>
                      <th className="text-left font-semibold py-2">Reason</th>
                      <th className="text-left font-semibold py-2 hidden sm:table-cell">By</th>
                      <th className="text-right font-semibold py-2">When</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {product.stockMovements.map((m) => (
                      <tr key={m.id}>
                        <td className="py-2.5">
                          <StatusBadge status={m.movementType} />
                        </td>
                        <td className="py-2.5 text-right font-medium text-ink-800">{m.quantity}</td>
                        <td className="py-2.5 text-ink-600">{m.reason}</td>
                        <td className="py-2.5 text-ink-500 hidden sm:table-cell">{m.createdBy?.name || "—"}</td>
                        <td className="py-2.5 text-right text-ink-400 text-xs">
                          {new Date(m.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
