import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createProduct, fetchProduct, updateProduct } from "../../api/products";
import PageHeader from "../../components/PageHeader";
import { ErrorBanner, Spinner } from "../../components/Feedback";
import { apiErrorMessage } from "../../api/client";

interface FormState {
  name: string;
  sku: string;
  category: string;
  unitPrice: string;
  currentStock: string;
  minStockAlertQty: string;
  location: string;
}

const EMPTY: FormState = {
  name: "",
  sku: "",
  category: "",
  unitPrice: "",
  currentStock: "0",
  minStockAlertQty: "0",
  location: "",
};

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const p = await fetchProduct(id);
        setForm({
          name: p.name,
          sku: p.sku,
          category: p.category || "",
          unitPrice: String(p.unitPrice),
          currentStock: String(p.currentStock),
          minStockAlertQty: String(p.minStockAlertQty),
          location: p.location || "",
        });
      } catch (err) {
        setError(apiErrorMessage(err, "Could not load product."));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        sku: form.sku,
        category: form.category || undefined,
        unitPrice: parseFloat(form.unitPrice || "0"),
        currentStock: isEdit ? undefined : parseInt(form.currentStock || "0", 10),
        minStockAlertQty: parseInt(form.minStockAlertQty || "0", 10),
        location: form.location || undefined,
      };
      if (isEdit && id) {
        await updateProduct(id, payload);
        navigate(`/products/${id}`);
      } else {
        const created = await createProduct(payload as any);
        navigate(`/products/${created.id}`);
      }
    } catch (err) {
      setError(apiErrorMessage(err, "Could not save product."));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={isEdit ? "Edit product" : "Add product"}
        subtitle={isEdit ? "Stock level is only changed via a stock movement, not here." : "Add a new item to the catalog."}
      />

      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-5 lg:p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Product name *</label>
            <input className="input" required value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <label className="label">SKU / code *</label>
            <input className="input code" required value={form.sku} onChange={(e) => set("sku", e.target.value)} />
          </div>
          <div>
            <label className="label">Category</label>
            <input className="input" value={form.category} onChange={(e) => set("category", e.target.value)} />
          </div>
          <div>
            <label className="label">Unit price (₹) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="input"
              required
              value={form.unitPrice}
              onChange={(e) => set("unitPrice", e.target.value)}
            />
          </div>
          <div>
            <label className="label">
              {isEdit ? "Current stock" : "Opening stock"}
            </label>
            <input
              type="number"
              min="0"
              className="input"
              disabled={isEdit}
              value={form.currentStock}
              onChange={(e) => set("currentStock", e.target.value)}
            />
            {isEdit && <p className="text-xs text-ink-400 mt-1">Use "Adjust stock" on the product page to change this.</p>}
          </div>
          <div>
            <label className="label">Minimum stock alert qty</label>
            <input
              type="number"
              min="0"
              className="input"
              value={form.minStockAlertQty}
              onChange={(e) => set("minStockAlertQty", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Location / warehouse</label>
            <input className="input" value={form.location} onChange={(e) => set("location", e.target.value)} />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add product"}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
