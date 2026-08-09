import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Plus, AlertTriangle } from "lucide-react";
import { fetchProducts } from "../../api/products";
import { Product } from "../../api/types";
import PageHeader from "../../components/PageHeader";
import Pagination from "../../components/Pagination";
import { Spinner, EmptyState, ErrorBanner } from "../../components/Feedback";
import { apiErrorMessage } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

export default function ProductList() {
  const { hasRole } = useAuth();
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const search = params.get("search") || "";
  const lowStock = params.get("lowStock") === "true";
  const page = parseInt(params.get("page") || "1", 10);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchProducts({ page, limit: 10, search: search || undefined, lowStock: lowStock || undefined });
      setProducts(res.data);
      setPagination({ page: res.pagination.page, totalPages: res.pagination.totalPages, total: res.pagination.total });
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load products."));
    } finally {
      setLoading(false);
    }
  }, [page, search, lowStock]);

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
        title="Products & stock"
        subtitle="Catalog, pricing and live stock levels."
        action={
          hasRole("ADMIN", "WAREHOUSE") && (
            <Link to="/products/new" className="btn-primary">
              <Plus size={16} /> Add product
            </Link>
          )
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search by product name or SKU…"
            defaultValue={search}
            onKeyDown={(e) => {
              if (e.key === "Enter") updateParam("search", (e.target as HTMLInputElement).value);
            }}
            onBlur={(e) => updateParam("search", e.target.value)}
          />
        </div>
        <label className="btn-secondary cursor-pointer !justify-start sm:w-56">
          <input
            type="checkbox"
            className="accent-brand-600"
            checked={lowStock}
            onChange={(e) => updateParam("lowStock", e.target.checked ? "true" : "")}
          />
          Low stock only
        </label>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} />
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <Spinner />
        ) : products.length === 0 ? (
          <EmptyState title="No products found" subtitle="Try adjusting your search or filters, or add a new product." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-ink-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left font-semibold px-4 py-3">Product</th>
                  <th className="text-left font-semibold px-4 py-3 hidden sm:table-cell">Category</th>
                  <th className="text-right font-semibold px-4 py-3">Unit price</th>
                  <th className="text-right font-semibold px-4 py-3">Stock</th>
                  <th className="text-left font-semibold px-4 py-3 hidden md:table-cell">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const low = p.currentStock <= p.minStockAlertQty;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3">
                        <Link to={`/products/${p.id}`} className="font-medium text-ink-800 hover:text-brand-600">
                          {p.name}
                        </Link>
                        <p className="code text-ink-400">{p.sku}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-ink-600">{p.category || "—"}</td>
                      <td className="px-4 py-3 text-right text-ink-700">₹{Number(p.unitPrice).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center gap-1 font-medium ${low ? "text-orange-600" : "text-ink-700"}`}>
                          {low && <AlertTriangle size={13} />}
                          {p.currentStock}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-ink-500 text-xs">{p.location || "—"}</td>
                    </tr>
                  );
                })}
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
