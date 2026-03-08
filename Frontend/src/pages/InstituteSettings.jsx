import { useEffect, useState } from "react";
import axios from "../utils/AxiosInstance";
import { useAuth } from "../contexts/AuthContext";
import { useInstituteConfig } from "../contexts/InstituteConfigContext";

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
      setSaveMessage("Settings saved successfully. Changes will appear across the site.");
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (_) {
      setSaveMessage("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!isAdminOrTpo) {
    return (
      <div className="text-slate-500">
        Only TPO/Admin can configure institute settings.
      </div>
    );
  }

  if (loading) {
    return <div className="text-slate-500">Loading institute settings…</div>;
  }

  if (!config) {
    return (
      <div className="text-slate-500">
        Could not load institute configuration.
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">
        Institute Management
      </h1>
      <p className="text-slate-500 text-sm mb-6">
        Configure your college name, logo, stats and contact info. These values
        are displayed across the portal (homepage, footer, branding).
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-lg font-semibold text-slate-700 mb-3">
            Branding
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                University / College Name
              </label>
              <input
                name="name"
                value={config.name || ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Short Name
              </label>
              <input
                name="short_name"
                value={config.short_name || ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                placeholder="e.g. LJ University"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Logo URL
              </label>
              <input
                name="logo_url"
                value={config.logo_url || ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                placeholder="https://…"
              />
              {config.logo_url && (
                <img
                  src={config.logo_url}
                  alt="Institute Logo"
                  className="h-10 mt-2"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Primary Color (optional)
              </label>
              <input
                name="primary_color"
                value={config.primary_color || ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                placeholder="#16a34a or emerald-600"
              />
            </div>
          </div>
        </div>

        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-lg font-semibold text-slate-700 mb-3">
            Homepage Stats
          </h2>
          <p className="text-slate-500 text-xs mb-3">
            These values appear on the homepage and across the site.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Students
              </label>
              <input
                name="students_count"
                value={config.students_count || ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                placeholder="e.g. 1200+"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Students Every Year
              </label>
              <input
                name="students_every_year"
                value={config.students_every_year || ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                placeholder="e.g. 300+"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Partner Companies
              </label>
              <input
                name="partner_companies"
                value={config.partner_companies || ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                placeholder="e.g. 85+"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Placement Rate
              </label>
              <input
                name="placement_rate"
                value={config.placement_rate || ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                placeholder="e.g. 90%"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Opportunities
              </label>
              <input
                name="opportunities"
                value={config.opportunities || ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                placeholder="e.g. 500+"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-700 mb-3">
            Contact
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Support Email
                </label>
                <input
                  name="support_email"
                  type="email"
                  value={config.support_email || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Placement Cell Email
                </label>
                <input
                  name="placement_email"
                  type="email"
                  value={config.placement_email || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Address
              </label>
              <input
                name="address"
                value={config.address || ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                placeholder="e.g. LJ University Campus, Ahmedabad"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Contact Phone
              </label>
              <input
                name="contact_phone"
                value={config.contact_phone || ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-2"
                placeholder="e.g. +91 XXX XXX XXXX"
              />
            </div>
          </div>
        </div>

        {saveMessage && (
          <p className={`text-sm ${saveMessage.includes("Failed") ? "text-red-600" : "text-emerald-600"}`}>
            {saveMessage}
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save settings"}
        </button>
      </form>
    </div>
  );
}

