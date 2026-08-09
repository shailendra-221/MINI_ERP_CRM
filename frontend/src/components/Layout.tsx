import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  LogOut,
  Menu,
  X,
  CircleUserRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/products", label: "Products & Stock", icon: Package },
  { to: "/challans", label: "Sales Challans", icon: FileText },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink-950/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-40 inset-y-0 left-0 w-64 bg-ink-950 text-slate-200 flex flex-col transform transition-transform lg:translate-x-0 lg:static lg:z-auto ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-white/10">
          <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center font-display font-bold text-white text-sm">
            OD
          </div>
          <div>
            <p className="font-display font-semibold text-white text-sm leading-none">OpsDesk</p>
            <p className="code text-[10px] text-slate-400 mt-1">ERP · CRM · v1.0</p>
          </div>
          <button
            className="ml-auto text-slate-400 hover:text-white lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-500/15 text-white ring-1 ring-inset ring-brand-500/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <CircleUserRound size={28} className="text-slate-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-400 code">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-1 w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center gap-3 px-4 lg:px-8 border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-20">
          <button
            className="text-ink-600 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <p className="text-sm text-ink-500">
            Signed in as <span className="font-medium text-ink-800">{user?.name}</span>
          </p>
        </header>
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
