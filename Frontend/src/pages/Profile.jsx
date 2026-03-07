import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/AxiosInstance";
import { useAuth } from "../contexts/AuthContext";

const Field = ({ label, children, hint }) => (
  <div className="group">
    <label className="block text-xs font-semibold tracking-widest uppercase text-slate-400 mb-1.5">
      {label}
    </label>
    {children}
    {hint && <p className="text-xs text-slate-400 mt-1.5">{hint}</p>}
  </div>
);

const ReadInput = ({ value }) => (
  <div className="flex items-center gap-2 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 select-none">
    <svg className="w-3.5 h-3.5 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
    <span>{value || "—"}</span>
  </div>
);

const EditInput = ({ name, value, onChange, placeholder, type = "text" }) => (
  <input
    name={name}
    value={value}
    onChange={onChange}
    type={type}
    placeholder={placeholder}
    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-300 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 hover:border-slate-300"
  />
);

const EditTextarea = ({ name, value, onChange, rows = 2, placeholder }) => (
  <textarea
    name={name}
    value={value}
    onChange={onChange}
    rows={rows}
    placeholder={placeholder}
    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-300 outline-none resize-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 hover:border-slate-300"
  />
);

const SectionDivider = ({ label }) => (
  <div className="flex items-center gap-3 py-1">
    <div className="h-px flex-1 bg-slate-100" />
    <span className="text-xs font-semibold tracking-widest uppercase text-slate-300">{label}</span>
    <div className="h-px flex-1 bg-slate-100" />
  </div>
);

export default function ProfilePage() {
  const { role } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({});
  const [activeTab, setActiveTab] = useState("personal");
  const navigate = useNavigate();

  useEffect(() => {
    const url = role === "student" ? "/students/me/" : "/companies/profile/";
    axios
      .get(url)
      .then((r) => { setProfile(r.data); setForm(r.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [role]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const url = role === "student" ? "/students/me/" : "/companies/profile/";
    try {
      await axios.patch(url, form);
      setProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (_) {}
    setSaving(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="flex items-center gap-3 text-slate-400 text-sm">
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading profile…
      </div>
    </div>
  );

  if (!profile) return (
    <div className="flex items-center justify-center h-48">
      <div className="text-slate-400 text-sm">No profile found.</div>
    </div>
  );

  const tabs = [
    { id: "personal", label: "Personal", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { id: "academic", label: "Academic", icon: "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" },
    { id: "preferences", label: "Resume & Prefs", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  ];

  if (role === "student") {
    const initials = (form.full_name || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

    return (
      <div className="w-full">
        <div className="flex items-start gap-5 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-emerald-100 shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-800 leading-tight">{form.full_name || "Your Profile"}</h1>
            <p className="text-sm text-slate-400 mt-0.5">{form.department?.name} · {form.course?.name}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full font-medium">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                {form.enrollment_number || "—"}
              </span>
              {form.passing_year && (
                <span className="inline-flex items-center text-xs bg-slate-50 text-slate-500 border border-slate-100 px-2 py-0.5 rounded-full">
                  Batch {form.passing_year}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-1 mb-6 bg-slate-50 p-1 rounded-xl border border-slate-100 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                activeTab === tab.id
                  ? "bg-white text-emerald-700 shadow-sm border border-slate-100"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-50">
              <h2 className="text-sm font-semibold text-slate-700">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              {activeTab === "academic" && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  These fields are locked. Contact your TPO to request corrections.
                </p>
              )}
            </div>

            <div className="px-6 py-6 space-y-5">
              {activeTab === "personal" && (
                <>
                  <Field label="Full Name (as per marksheet)">
                    <ReadInput value={form.full_name} />
                  </Field>
                  <div className="grid grid-cols-3 gap-4">
                    <Field label="Enrollment Number">
                      <ReadInput value={form.enrollment_number} />
                    </Field>
                    <Field label="Roll Number">
                      <ReadInput value={form.roll_number} />
                    </Field>
                    <Field label="Phone">
                      <EditInput name="phone" value={form.phone || ""} onChange={handleChange} placeholder="+91 98765 43210" />
                    </Field>
                  </div>
                  <Field label="Location (City)">
                    <EditInput name="location" value={form.location || ""} onChange={handleChange} placeholder="e.g. Ahmedabad" />
                  </Field>

                  <SectionDivider label="Address" />

                  <Field label="Current Address">
                    <EditTextarea name="current_address" value={form.current_address || ""} onChange={handleChange} placeholder="Your current residence…" />
                  </Field>
                  <Field label="Permanent Address">
                    <EditTextarea name="permanent_address" value={form.permanent_address || ""} onChange={handleChange} placeholder="Your permanent address…" />
                  </Field>

                  <SectionDivider label="Security" />

                  <button
                    type="button"
                    onClick={() => navigate("/change-password")}
                    className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Change password
                  </button>
                </>
              )}

              {activeTab === "academic" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Department">
                      <ReadInput value={form.department?.name} />
                    </Field>
                    <Field label="Course">
                      <ReadInput value={form.course?.name} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <Field label="Passing Year">
                      <ReadInput value={form.passing_year} />
                    </Field>
                    <Field label="10th %">
                      <ReadInput value={form.marks_10th} />
                    </Field>
                    <Field label="12th %">
                      <ReadInput value={form.marks_12th} />
                    </Field>
                    <Field label="Current CGPA">
                      <ReadInput value={form.current_cgpa} />
                    </Field>
                  </div>
                </>
              )}

              {activeTab === "preferences" && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <Field label="Skills" hint="Separate with commas or new lines">
                      <EditTextarea
                        name="skills"
                        value={form.skills || ""}
                        onChange={handleChange}
                        rows={4}
                        placeholder="e.g. Python, React, Machine Learning…"
                      />
                    </Field>
                    <div className="space-y-2">
                      <Field
                        label="Resume URL"
                        hint="To upload a new file, go to the Resume page — this link will be updated automatically."
                      >
                        <EditInput
                          name="resume_url"
                          value={form.resume_url || ""}
                          onChange={handleChange}
                          placeholder="https://…"
                        />
                      </Field>
                      {form.resume_url && (
                        <a
                          href={form.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Preview resume
                        </a>
                      )}
                    </div>
                  </div>

                  <SectionDivider label="Notifications" />

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-0.5">
                      <input
                        id="job_alerts_enabled"
                        type="checkbox"
                        name="job_alerts_enabled"
                        checked={!!form.job_alerts_enabled}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, job_alerts_enabled: e.target.checked }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 rounded-full bg-slate-200 peer-checked:bg-emerald-500 transition-colors" />
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-700 leading-snug">Email job alerts</span>
                      <p className="text-xs text-slate-400 mt-0.5">Receive notifications when new opportunities match your profile</p>
                    </div>
                  </label>
                </>
              )}
            </div>
          </div>

          {activeTab !== "academic" && (
            <div className="flex items-center justify-between mt-4 px-1">
              <p className={`text-xs text-emerald-600 font-medium transition-opacity duration-300 flex items-center gap-1.5 ${saved ? "opacity-100" : "opacity-0"}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Changes saved
              </p>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm shadow-emerald-200 transition disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save changes
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    );
  }

  const companyInitials = (form.name || "C").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="w-full">
      <div className="flex items-start gap-5 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-lg font-bold shadow-md shrink-0">
          {companyInitials}
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">{form.name || "Company Profile"}</h1>
          <p className="text-sm text-slate-400 mt-0.5">{form.industry || "Industry not set"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-50">
            <h2 className="text-sm font-semibold text-slate-700">Company Details</h2>
          </div>
          <div className="px-6 py-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Company Name">
                <EditInput name="name" value={form.name || ""} onChange={handleChange} placeholder="Acme Corp" />
              </Field>
              <Field label="Industry">
                <EditInput name="industry" value={form.industry || ""} onChange={handleChange} placeholder="Technology" />
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Field label="Website">
                  <EditInput name="website" value={form.website || ""} onChange={handleChange} placeholder="https://acme.com" />
                </Field>
              </div>
              <Field label="Contact Phone">
                <EditInput name="contact_phone" value={form.contact_phone || ""} onChange={handleChange} placeholder="+91 98765 43210" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Field label="Description">
                <EditTextarea name="description" value={form.description || ""} onChange={handleChange} rows={4} placeholder="Tell students about your company…" />
              </Field>
              <Field label="Contact Email">
                <EditInput name="contact_email" value={form.contact_email || ""} onChange={handleChange} placeholder="hr@acme.com" type="email" />
              </Field>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end mt-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm shadow-emerald-200 transition disabled:opacity-60"
          >
            {saving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
