import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiErrorMessage } from "../api/client";
import { ErrorBanner } from "../components/Feedback";
import type { Role } from "../api/types";

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [darkMode, setDarkMode] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("SALES");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        await register(name, email, password, role);
      } else {
        await login(email, password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        apiErrorMessage(
          err,
          mode === "signup" ? "Unable to create your account. Please try again." : "Invalid email or password."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  const isDark = darkMode;

  function toggleTheme() {
    setTransitioning(true);
    setDarkMode((prev) => !prev);
    window.setTimeout(() => setTransitioning(false), 420);
  }

  return (
    <div className={isDark ? "min-h-screen bg-[#071827] text-white" : "min-h-screen bg-slate-100 text-slate-900"}>
      <div
        className={
          transitioning
            ? "pointer-events-none fixed inset-0 z-50 origin-left animate-[themeSweep_0.45s_ease-in-out]"
            : "pointer-events-none hidden"
        }
        style={{
          background: isDark ? "#f8fafc" : "#071827",
          animationDirection: isDark ? "normal" : "reverse",
        }}
      />
      <div className="flex min-h-screen flex-col lg:flex-row">
        <div
          className={
            isDark
              ? "relative flex flex-1 flex-col justify-between overflow-hidden bg-[radial-gradient(circle_at_78%_18%,rgba(59,130,246,0.32),transparent_24%),linear-gradient(90deg,#071827_0%,#0d1d2b_36%,#0f2b40_100%)] px-8 pb-8 pt-8 sm:px-10 lg:px-14"
              : "relative flex flex-1 flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-100 via-slate-200 to-blue-100 px-8 pb-8 pt-8 sm:px-10 lg:px-14"
          }
        >
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4b8ef7] text-sm font-bold text-white shadow-lg shadow-blue-500/30">
                OD
              </div>
              <span className="font-display text-3xl font-semibold tracking-tight text-current">OpsDesk</span>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className={
                isDark
                  ? "rounded-full border border-slate-600 bg-slate-800/60 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
                  : "rounded-full border border-slate-300 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white"
              }
            >
              {isDark ? "Light mode" : "Dark mode"}
            </button>
          </div>

          <div className="relative z-10 max-w-3xl pt-10 md:pt-0">
            <h1
              className={
                isDark
                  ? "max-w-3xl font-display text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-white md:text-6xl lg:text-[5rem]"
                  : "max-w-3xl font-display text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-slate-900 md:text-6xl lg:text-[5rem]"
              }
            >
              Customers, stock and challans
              <span className="block">— run from one desk.</span>
            </h1>

            <p
              className={
                isDark
                  ? "mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 md:text-xl"
                  : "mt-6 max-w-2xl text-lg leading-relaxed text-slate-700 md:text-xl"
              }
            >
              Track leads through to active accounts, keep inventory counts honest with a full
              movement log, and issue sales challans that never let stock go negative.
            </p>
          </div>

          <div className={isDark ? "relative z-10 pb-4 text-sm text-slate-400 code" : "relative z-10 pb-4 text-sm text-slate-500 code"}>
            v1.0.0 — build 2026.08
          </div>
        </div>

        <div
          className={
            isDark
              ? "flex flex-1 items-center justify-center bg-slate-100 px-6 py-12 text-slate-900 lg:min-w-[440px]"
              : "flex flex-1 items-center justify-center bg-slate-50 px-6 py-12 text-slate-900 lg:min-w-[440px]"
          }
        >
          <div
            className={
              isDark
                ? "w-full max-w-md rounded-2xl border border-slate-200 bg-white/90 p-7 shadow-2xl shadow-slate-900/5 backdrop-blur-sm"
                : "w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/80"
            }
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#4b8ef7] text-base font-bold text-white shadow-md shadow-blue-500/20">
                OD
              </div>
              <div>
                <p className={isDark ? "text-xs font-semibold uppercase tracking-[0.2em] text-slate-500" : "text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"}>
                  {mode === "login" ? "Welcome back" : "Create account"}
                </p>
                <h2 className="font-display text-2xl font-semibold text-slate-900">
                  {mode === "login" ? "Sign in" : "Sign up"}
                </h2>
              </div>
            </div>

            {error && (
              <div className="mb-4">
                <ErrorBanner message={error} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="label" htmlFor="name">
                    Full name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    className="input"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label className="label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="input"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {mode === "signup" && (
                <div>
                  <label className="label" htmlFor="role">
                    Role
                  </label>
                  <select
                    id="role"
                    className="input"
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="SALES">Sales</option>
                    <option value="WAREHOUSE">Warehouse</option>
                    <option value="ACCOUNTS">Accounts</option>
                  </select>
                </div>
              )}

              <div>
                <label className="label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="input"
                  placeholder={mode === "signup" ? "At least 8 characters" : "••••••••"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary mt-2 w-full">
                {loading ? (mode === "signup" ? "Creating account…" : "Signing in…") : mode === "signup" ? "Create account" : "Sign in"}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-600">
              {mode === "login" ? "Need an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                className="font-semibold text-[#4b8ef7] hover:underline"
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setError("");
                }}
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
