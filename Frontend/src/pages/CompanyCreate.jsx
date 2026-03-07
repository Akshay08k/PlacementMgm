import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../utils/AxiosInstance";
import { MdClose, MdBusiness, MdEmail, MdPhone, MdContentCopy, MdCheckCircle } from "react-icons/md";

const inputCls = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-colors";
const labelCls = "block text-xs font-semibold text-slate-600 mb-1";

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      className="ml-2 p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors shrink-0"
      title="Copy"
    >
      {copied ? <MdCheckCircle className="text-emerald-500 text-sm" /> : <MdContentCopy className="text-sm" />}
    </button>
  );
}

export default function CompanyCreatePage({ isOpen, onClose }) {
  const [form, setForm] = useState({ email: "", company_name: "", contact_email: "", contact_phone: "" });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.company_name) {
      setErrors({ form: "Email and company name are required." });
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      const r = await axios.post("/accounts/register/company/", form);
      setResult(r.data);
    } catch (err) {
      setErrors(err.response?.data || { form: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setForm({ email: "", company_name: "", contact_email: "", contact_phone: "" });
    setErrors({});
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden animate-in">

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-linaer-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
              <MdBusiness className="text-violet-600 text-base" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 leading-none">
                {result ? "Account Created" : "Create Company Account"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {result ? "Share credentials with the company" : "Register a new recruiter on the portal"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <MdClose className="text-lg" />
          </button>
        </div>

        {result ? (
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
              <MdCheckCircle className="text-lg shrink-0" />
              <span className="text-sm font-medium">Company account created successfully.</span>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                One-time credentials — share with company
              </p>
              {[
                { label: "Login Email", value: result.email },
                { label: "Temporary Password", value: result.temp_password },
                { label: "Invite Link", value: result.invite_link },
              ].map(({ label, value }) => value && (
                <div key={label}>
                  <p className="text-xs text-amber-600 font-medium mb-0.5">{label}</p>
                  <div className="flex items-center justify-between bg-white border border-amber-200 rounded-lg px-3 py-2">
                    <span className="text-sm text-slate-700 font-mono truncate">{value}</span>
                    <CopyButton value={value} />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleReset}
                className="flex-1 bg-slate-100 text-slate-700 text-sm font-medium py-2 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Create another
              </button>
              <button
                onClick={handleClose}
                className="flex-1 bg-emerald-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={labelCls}>Login Email <span className="text-red-400">*</span></label>
                <div className="relative">
                  <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="company@example.com"
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </div>

              <div className="col-span-2">
                <label className={labelCls}>Company Name <span className="text-red-400">*</span></label>
                <div className="relative">
                  <MdBusiness className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                  <input
                    type="text"
                    value={form.company_name}
                    onChange={(e) => setForm((p) => ({ ...p, company_name: e.target.value }))}
                    placeholder="Acme Corp"
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Contact Email <span className="text-slate-300 font-normal">optional</span></label>
                <input
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => setForm((p) => ({ ...p, contact_email: e.target.value }))}
                  placeholder="hr@acme.com"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Contact Phone <span className="text-slate-300 font-normal">optional</span></label>
                <div className="relative">
                  <MdPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                  <input
                    type="text"
                    value={form.contact_phone}
                    onChange={(e) => setForm((p) => ({ ...p, contact_phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </div>
            </div>

            {(errors.form || errors.email || errors.company_name) && (
              <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-xs text-red-600">
                {errors.form || errors.email || errors.company_name}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 border border-slate-200 text-slate-600 text-sm font-medium py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-emerald-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {loading && (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {loading ? "Creating…" : "Create Account"}
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        @keyframes animate-in {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-in { animation: animate-in 0.18s ease-out forwards; }
      `}</style>
    </div>
  );
}