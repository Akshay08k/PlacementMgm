import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "../utils/AxiosInstance";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ResetPasswordPage() {
  const query = useQuery();
  const navigate = useNavigate();
  const uid = query.get("uid") || "";
  const token = query.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!uid || !token) {
      setMessage({ type: "error", text: "Invalid reset link." });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setLoading(true);
    try {
      await axios.post("/accounts/password-reset/confirm/", {
        uid,
        token,
        new_password: newPassword,
      });
      setMessage({ type: "success", text: "Password reset successful. Please sign in." });
      setTimeout(() => navigate("/signin", { replace: true }), 1200);
    } catch (err) {
      const msg =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        "Reset failed. Link may be expired.";
      setMessage({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
        <h1 className="text-xl font-bold text-slate-800 mb-2">Reset password</h1>
        <p className="text-slate-500 text-sm mb-6">
          Set a new password for your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              New password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {message?.text && (
            <div
              className={`text-sm rounded-lg px-3 py-2 ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  : "bg-red-50 text-red-600 border border-red-100"
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg disabled:opacity-50"
          >
            {loading ? "Resetting…" : "Reset password"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/signin" className="text-emerald-600 hover:underline text-sm">
            Back to Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

