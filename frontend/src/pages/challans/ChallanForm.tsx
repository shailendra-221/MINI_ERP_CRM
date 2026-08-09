import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { fetchCustomers } from "../../api/customers";
import { fetchProducts } from "../../api/products";
import { createChallan } from "../../api/challans";
import { Customer, Product } from "../../api/types";
import PageHeader from "../../components/PageHeader";
import { ErrorBanner, Spinner } from "../../components/Feedback";
import { apiErrorMessage } from "../../api/client";

interface Line {
  productId: string;
  quantity: string;
}

export default function ChallanForm() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState<Line[]>([{ productId: "", quantity: "1" }]);

  useEffect(() => {
    (async () => {
      try {
        const [c, p] = await Promise.all([
          fetchCustomers({ page: 1, limit: 200 }),
          fetchProducts({ page: 1, limit: 200 }),
        ]);
        setCustomers(c.data);
        setProducts(p.data);
      } catch (err) {
        setError(apiErrorMessage(err, "Could not load customers/products."));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function productById(id: string) {
    return products.find((p) => p.id === id);
  }

  function updateLine(index: number, patch: Partial<Line>) {
    setLines((ls) => ls.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function addLine() {
    setLines((ls) => [...ls, { productId: "", quantity: "1" }]);
  }

  function removeLine(index: number) {
    setLines((ls) => ls.filter((_, i) => i !== index));
  }

  const total = lines.reduce((sum, l) => {
    const p = productById(l.productId);
    const qty = parseInt(l.quantity || "0", 10) || 0;
    return sum + (p ? Number(p.unitPrice) * qty : 0);
  }, 0);

  const totalQty = lines.reduce((sum, l) => sum + (parseInt(l.quantity || "0", 10) || 0), 0);

  async function handleSubmit(status: "DRAFT" | "CONFIRMED") {
    setError("");
    const validLines = lines.filter((l) => l.productId && parseInt(l.quantity || "0", 10) > 0);
    if (!customerId) {
      setError("Select a customer before saving.");
      return;
    }
    if (validLines.length === 0) {
      setError("Add at least one product line with a quantity.");
      return;
    }

    setSaving(true);
    try {
      const created = await createChallan({
        customerId,
        status,
        items: validLines.map((l) => ({ productId: l.productId, quantity: parseInt(l.quantity, 10) })),
      });
      navigate(`/challans/${created.id}`);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not save challan."));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="max-w-3xl">
      <PageHeader title="New sales challan" subtitle="Select a customer, add products, then save as draft or confirm to reduce stock immediately." />

      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} />
        </div>
      )}

      <div className="card p-5 lg:p-6 space-y-6">
        <div>
          <label className="label">Customer *</label>
          <select className="input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">Select a customer…</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.businessName ? `— ${c.businessName}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label !mb-0">Products *</label>
            <button type="button" className="btn-ghost !py-1 !px-2 text-xs" onClick={addLine}>
              <Plus size={14} /> Add line
            </button>
          </div>

          <div className="space-y-2">
            {lines.map((line, i) => {
              const product = productById(line.productId);
              const qty = parseInt(line.quantity || "0", 10) || 0;
              const insufficientStock = product && qty > product.currentStock;
              return (
                <div key={i} className="flex flex-col sm:flex-row gap-2 sm:items-center bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <select
                    className="input sm:flex-1"
                    value={line.productId}
                    onChange={(e) => updateLine(i, { productId: e.target.value })}
                  >
                    <option value="">Select product…</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) — {p.currentStock} in stock
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    className="input sm:w-28"
                    placeholder="Qty"
                    value={line.quantity}
                    onChange={(e) => updateLine(i, { quantity: e.target.value })}
                  />
                  <div className="sm:w-28 text-right text-sm text-ink-700 font-medium">
                    {product ? `₹${(Number(product.unitPrice) * qty).toFixed(2)}` : "—"}
                  </div>
                  <button
                    type="button"
                    className="btn-ghost !p-2 text-red-500 hover:bg-red-50"
                    onClick={() => removeLine(i)}
                    disabled={lines.length === 1}
                  >
                    <Trash2 size={15} />
                  </button>
                  {insufficientStock && (
                    <p className="text-xs text-red-600 sm:basis-full">
                      Only {product!.currentStock} unit(s) of "{product!.name}" available — this will fail if you
                      confirm now.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
          <span className="text-ink-500">
            Total quantity: <span className="font-medium text-ink-800">{totalQty}</span>
          </span>
          <span className="text-ink-500">
            Estimated total: <span className="font-semibold text-ink-900">₹{total.toFixed(2)}</span>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button type="button" disabled={saving} className="btn-secondary" onClick={() => handleSubmit("DRAFT")}>
            {saving ? "Saving…" : "Save as draft"}
          </button>
          <button type="button" disabled={saving} className="btn-primary" onClick={() => handleSubmit("CONFIRMED")}>
            {saving ? "Saving…" : "Confirm & reduce stock"}
          </button>
          <button type="button" className="btn-ghost sm:ml-auto" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
