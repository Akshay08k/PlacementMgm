import { useEffect, useState } from "react";
import axios from "../utils/AxiosInstance";
import { useAuth } from "../contexts/AuthContext";
import { useInstituteConfig } from "../contexts/InstituteConfigContext";

const Field = ({ label, children, hint }) => (
  <div className="group">
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
      {label}
    </label>
    {children}
    {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
  </div>
);

const Input = ({ className = "", ...props }) => (
  <input
    {...props}
    className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-300 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 focus:bg-white hover:border-slate-300 ${className}`}
  />
);

const SectionCard = ({ icon, title, subtitle, children }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
    <div className="flex items-center gap-3 px-6 py-4 bg-linear-to-r from-slate-50 to-white border-b border-slate-100">
      <span className="text-xl">{icon}</span>
      <div>
        <h2 className="text-sm font-bold text-slate-700 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

export default function InstituteSettingsPage() {
  const { role } = useAuth();
  const { refreshConfig } = useInstituteConfig();
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState(null);

  const isAdminOrTpo = role === "tpo" || role === "admin";

  useEffect(() => {
    axios
      .get("/reports/institute-config/")
      .then((r) => setConfig(r.data))
      .catch(() => setConfig(null))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdminOrTpo) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      await axios.patch("/reports/institute-config/", config);
      refreshConfig();
      setSaveMessage({ type: "success", text: "Settings saved successfully. Changes will appear across the site." });
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (_) {
      setSaveMessage({ type: "error", text: "Failed to save. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (!isAdminOrTpo) {
    return (
      <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
        <span className="text-lg">🔒</span> Only TPO/Admin can configure institute settings.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-slate-400 text-sm p-4">
        <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        Loading institute settings…
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
        <span className="text-lg">⚠️</span> Could not load institute configuration.
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 text-sm font-bold">🏛</span>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Institute Management</h1>
          </div>
          <p className="text-slate-400 text-sm ml-10">
            Configure branding, stats &amp; contact info — displayed across the portal.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saveMessage && (
            <span className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
              saveMessage.type === "success"
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                : "bg-red-50 text-red-600 border border-red-200"
            }`}>
              {saveMessage.type === "success" ? "✓" : "✗"} {saveMessage.text}
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Branding */}
        <SectionCard icon="" title="Branding" subtitle="Name, logo & color identity">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <Field label="University / College Name">
              <Input name="name" value={config.name || ""} onChange={handleChange} placeholder="e.g. LJ University" />
            </Field>
            <Field label="Short Name">
              <Input name="short_name" value={config.short_name || ""} onChange={handleChange} placeholder="e.g. LJU" />
            </Field>
            <Field label="Logo URL" hint="Paste a hosted image URL — preview shown below">
              <Input name="logo_url" value={config.logo_url || ""} onChange={handleChange} placeholder="https://…" />
            </Field>
            
            {config.logo_url && (
              <div className="col-span-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Logo Preview</p>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 w-fit">
                  <img src={config.logo_url} alt="Institute Logo" className="h-10 object-contain" />
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{config.name || "Institute Name"}</p>
                    <p className="text-xs text-slate-400">{config.short_name || "Short Name"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Stats */}
        <SectionCard icon="" title="Homepage Stats" subtitle="Displayed on the homepage & key sections">
          <div className="grid grid-cols-3 gap-x-6 gap-y-4">
            <Field label="Total Students">
              <Input name="students_count" value={config.students_count || ""} onChange={handleChange} placeholder="e.g. 1200+" />
            </Field>
            <Field label="Students Per Year">
              <Input name="students_every_year" value={config.students_every_year || ""} onChange={handleChange} placeholder="e.g. 300+" />
            </Field>
            <Field label="Partner Companies">
              <Input name="partner_companies" value={config.partner_companies || ""} onChange={handleChange} placeholder="e.g. 85+" />
            </Field>
            <Field label="Placement Rate">
              <Input name="placement_rate" value={config.placement_rate || ""} onChange={handleChange} placeholder="e.g. 90%" />
            </Field>
            <Field label="Opportunities">
              <Input name="opportunities" value={config.opportunities || ""} onChange={handleChange} placeholder="e.g. 500+" />
            </Field>
          </div>
        </SectionCard>

        {/* Contact */}
        <SectionCard icon="" title="Contact" subtitle="Emails, phone & address">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <Field label="Support Email">
              <Input name="support_email" type="email" value={config.support_email || ""} onChange={handleChange} placeholder="support@institute.edu" />
            </Field>
            <Field label="Placement Cell Email">
              <Input name="placement_email" type="email" value={config.placement_email || ""} onChange={handleChange} placeholder="placements@institute.edu" />
            </Field>
            <Field label="Contact Phone">
              <Input name="contact_phone" value={config.contact_phone || ""} onChange={handleChange} placeholder="+91 XXX XXX XXXX" />
            </Field>
            <Field label="Address">
              <Input name="address" value={config.address || ""} onChange={handleChange} placeholder="e.g. LJ Campus, Ahmedabad" />
            </Field>
          </div>
        </SectionCard>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 pb-6">
          <p className="text-xs text-slate-400">Changes apply site-wide immediately after saving.</p>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-sm shadow-emerald-200 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}