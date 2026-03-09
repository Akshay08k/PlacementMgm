import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "../utils/AxiosInstance";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await axios.post("accounts/password-reset/request/", { email });
      setMessage({
        type: "success",
        text: "If this email exists, a reset link has been sent.",
      });
    } catch (_) {
      setMessage({
        type: "error",
        text: "Failed to send reset email. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
        <h1 className="text-xl font-bold text-slate-800 mb-2">Forgot password</h1>
        <p className="text-slate-500 text-sm mb-6">
          Enter your email and we’ll send you a password reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="you@example.com"
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
            {loading ? "Sending…" : "Send reset link"}
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

