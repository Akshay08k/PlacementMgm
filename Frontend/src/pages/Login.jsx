import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
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
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-slate-50 via-emerald-50/30 to-slate-100">
      <nav className="px-6 py-4 border-b border-slate-200/80 bg-white/70 backdrop-blur">
        <h1 className="text-xl font-semibold text-emerald-800">Placement Management System</h1>
      </nav>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Sign in</h2>
            <p className="text-slate-500 text-sm mb-6">Enter your credentials to continue</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className={`w-full rounded-lg border px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                    errors.role ? "border-red-400" : "border-slate-300"
                  }`}
                >
                  <option value="student">Student</option>
                  <option value="tpo">TPO</option>
                  <option value="company">Company</option>
                </select>
                {errors.role && <p className="text-sm text-red-500 mt-1">{errors.role}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full rounded-lg border px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                    errors.email ? "border-red-400" : "border-slate-300"
                  }`}
                />
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-lg border px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                    errors.password ? "border-red-400" : "border-slate-300"
                  }`}
                />
                {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
              </div>
              {errors.form && (
                <p className="text-sm text-red-500 text-center">{errors.form}</p>
              )}
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition"
              >
                Sign in
              </button>
            </form>
            <p className="text-xs text-slate-500 mt-4 text-center">
              Students, TPOs, Recruiters and Admins all use this login. Just enter your registered email and password.
            </p>
            <p className="text-center text-slate-500 text-sm mt-4">
              Student? <a href="/register" className="text-emerald-600 hover:underline">Register here</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
