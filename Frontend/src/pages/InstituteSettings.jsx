import { useEffect, useState } from "react";
import axios from "../utils/AxiosInstance";
import { useAuth } from "../contexts/AuthContext";

export default function InstituteSettingsPage() {
  const { role } = useAuth();
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

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
    try {
      await axios.patch("/reports/institute-config/", config);
    } catch (_) {
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
        Institute Settings
      </h1>
      <p className="text-slate-500 text-sm mb-6">
        Configure your college name, logo and contact emails. These values are
        used across the portal (e.g. branding, email footers).
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
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

