import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("student");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { loginAction, isAuthenticated, role, mustChangePassword } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    if (mustChangePassword && role === "company") {
      navigate("/change-password", { replace: true });
      return;
    }
    navigate("/dashboard", { replace: true });
  }, [isAuthenticated, role, mustChangePassword, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);

    try {
      await loginAction({ email, password });

      if (mustChangePassword && role === "company") {
        navigate("/change-password", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setErrors({
        form: err.response?.data?.detail || "Login failed. Check your credentials.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf8] relative overflow-hidden font-sans">

      <nav className="flex items-center gap-2 px-8 py-5 relative z-10">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-linear-to-br from-emerald-600 to-emerald-400 shadow-md">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span className="text-sm font-semibold text-emerald-900">
          Placement Management System
        </span>
      </nav>

      <main className="flex flex-1 items-center justify-center px-4 pb-12 relative z-10">

        <div className="w-full max-w-md animate-[fadeUp_.5s_ease]">

          <div className="h-1 bg-linear-to-r from-emerald-600 via-emerald-400 to-emerald-300 rounded-t-2xl" />

          <div className="bg-white rounded-b-2xl p-9 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.06),0_20px_40px_rgba(0,0,0,0.05)] border border-black/5 border-t-0">

            <h2 className="text-3xl font-serif text-[#0a2e1e] mb-1">
              Welcome back
            </h2>

            <p className="text-sm text-gray-500 mb-7">
              Sign in to your account to continue
            </p>

            <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-lg mb-5">

              {["student", "tpo", "company"].map((r) => {

                const active = selectedRole === r;

                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedRole(r)}
                    className={`py-2 text-sm rounded-md transition
                      ${active
                        ? "bg-white text-emerald-800 font-semibold shadow"
                        : "text-gray-500 hover:text-gray-700 hover:bg-white/60"
                      }`}
                  >
                    {r === "tpo"
                      ? "TPO"
                      : r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                );
              })}

            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-gray-50 outline-none transition
                    ${errors.email
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200"
                    }`}
                />

                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    ⚠ {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                  Password
                </label>

                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-gray-50 outline-none transition
                    ${errors.password
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200"
                    }`}
                />

                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">
                    ⚠ {errors.password}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <a
                  href="/forgot-password"
                  className="text-xs font-medium text-emerald-700 hover:underline"
                >
                  Forgot password?
                </a>
              </div>

              {errors.form && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md py-2 px-3 text-center">
                  {errors.form}
                </div>
              )}
                <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 rounded-lg text-white font-semibold bg-linear-to-br from-emerald-600 to-emerald-500 shadow-lg hover:-translate-y-px hover:shadow-xl transition disabled:opacity-70"
              >
                <span className="flex items-center justify-center gap-2">

                  {isLoading && (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>
                  )}

                  {isLoading ? "Signing in…" : "Sign in"}
                </span>
              </button>

            </form>

            <div className="mt-6 pt-5 border-t flex flex-col items-center gap-2">

              <p className="text-xs text-gray-400 text-center">
                Students, TPOs, Recruiters & Admins all use this login.
              </p>

              <p className="text-sm text-gray-500">
                New student?{" "}
                <a
                  href="/register"
                  className="text-emerald-600 font-semibold border-b border-transparent hover:border-emerald-600"
                >
                  Register here
                </a>
              </p>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}