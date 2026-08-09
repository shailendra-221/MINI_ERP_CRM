import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Package, FileText, AlertTriangle, ArrowUpRight } from "lucide-react";
import { fetchCustomers } from "../api/customers";
import { fetchProducts } from "../api/products";
import { fetchChallans } from "../api/challans";
import { Customer, Product, Challan } from "../api/types";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { Spinner } from "../components/Feedback";
import { useAuth } from "../context/AuthContext";

function StatCard({
  icon: Icon,
  label,
  value,
  to,
  tone = "brand",
}: {
  icon: any;
  label: string;
  value: string | number;
  to: string;
  tone?: "brand" | "accent";
}) {
  return (
    <Link to={to} className="card p-5 flex items-start justify-between hover:border-brand-300 transition-colors group">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 mb-2">{label}</p>
        <p className="text-2xl font-display font-semibold text-ink-900">{value}</p>
      </div>
      <div
        className={`h-10 w-10 rounded-lg flex items-center justify-center ${
          tone === "accent" ? "bg-accent-500/10 text-accent-600" : "bg-brand-500/10 text-brand-600"
        }`}
      >
        <Icon size={20} />
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [customerCount, setCustomerCount] = useState(0);
  const [leadCount, setLeadCount] = useState(0);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [draftChallans, setDraftChallans] = useState(0);
  const [recentChallans, setRecentChallans] = useState<Challan[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [customers, leads, products, drafts, recent] = await Promise.all([
        fetchCustomers({ page: 1, limit: 1 }),
        fetchCustomers({ page: 1, limit: 1, status: "LEAD" }),
        fetchProducts({ page: 1, limit: 100, lowStock: true }),
        fetchChallans({ page: 1, limit: 1, status: "DRAFT" }),
        fetchChallans({ page: 1, limit: 5 }),
      ]);
      setCustomerCount(customers.pagination.total);
      setLeadCount(leads.pagination.total);
      setLowStock(products.data);
      setDraftChallans(drafts.pagination.total);
      setRecentChallans(recent.data);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0]}`}
        subtitle="Here's what's happening across customers, stock and challans today."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Total customers" value={customerCount} to="/customers" />
        <StatCard icon={Users} label="Open leads" value={leadCount} to="/customers?status=LEAD" />
        <StatCard icon={FileText} label="Draft challans" value={draftChallans} to="/challans?status=DRAFT" />
        <StatCard
          icon={AlertTriangle}
          label="Low stock items"
          value={lowStock.length}
          to="/products?lowStock=true"
          tone="accent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-ink-900">Low stock alerts</h2>
            <Link to="/products?lowStock=true" className="text-xs text-brand-600 font-medium flex items-center gap-1 hover:underline">
              View all <ArrowUpRight size={13} />
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-sm text-ink-500">All products are above their minimum stock threshold.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {lowStock.slice(0, 5).map((p) => (
                <li key={p.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink-800">{p.name}</p>
                    <p className="code text-ink-400">{p.sku}</p>
                  </div>
                  <span className="badge bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200">
                    {p.currentStock} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-ink-900">Recent challans</h2>
            <Link to="/challans" className="text-xs text-brand-600 font-medium flex items-center gap-1 hover:underline">
              View all <ArrowUpRight size={13} />
            </Link>
          </div>
          {recentChallans.length === 0 ? (
            <p className="text-sm text-ink-500">No challans created yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentChallans.map((c) => (
                <li key={c.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <Link to={`/challans/${c.id}`} className="code text-sm text-ink-800 hover:text-brand-600">
                      {c.challanNumber}
                    </Link>
                    <p className="text-xs text-ink-500 mt-0.5">{c.customer?.name}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
