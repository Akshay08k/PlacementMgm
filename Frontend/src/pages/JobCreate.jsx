import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/AxiosInstance";

export default function JobCreatePage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    package: "",
    location: "",
    eligibility_criteria: "",
    min_cgpa: "",
    skills_required: "",
    num_vacancies: "1",
    jd_pdf_url: "",
    hiring_flow: "applications",
    interview_rounds: ["resume_shortlist", "technical", "hr", "final"],
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const ROUND_OPTIONS = [
    { key: "resume_shortlist", label: "Resume Shortlisting" },
    { key: "aptitude", label: "Aptitude Test" },
    { key: "technical", label: "Technical Interview" },
    { key: "hr", label: "HR Interview" },
    { key: "final", label: "Final Selection" },
  ];

  const toggleRound = (key) => {
    setForm((prev) => {
      const existing = new Set(prev.interview_rounds || []);
      if (existing.has(key)) existing.delete(key);
      else existing.add(key);

      // enforce that final is always present and last
      existing.add("final");
      const ordered = ROUND_OPTIONS.map((r) => r.key).filter((k) => existing.has(k));
      const withoutFinal = ordered.filter((k) => k !== "final");
      return { ...prev, interview_rounds: [...withoutFinal, "final"] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) {
      setErrors({ title: "Required" });
      return;
    }
    setLoading(true);
    try {
      await axios.post("/companies/jobs/", {
        ...form,
        min_cgpa: form.min_cgpa ? parseFloat(form.min_cgpa) : null,
        num_vacancies: parseInt(form.num_vacancies, 10) || 1,
      });
      navigate("/jobs");
    } catch (err) {
      setErrors(err.response?.data || { form: "Failed to create job." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Post a Job</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Job Title *</label>
          <input name="title" value={form.title} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-4 py-2" />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="w-full rounded-lg border border-slate-300 px-4 py-2" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Package</label>
            <input name="package" value={form.package} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-4 py-2" placeholder="e.g. 8 LPA" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
            <input name="location" value={form.location} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-4 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Eligibility</label>
          <textarea name="eligibility_criteria" value={form.eligibility_criteria} onChange={handleChange} rows={2} className="w-full rounded-lg border border-slate-300 px-4 py-2" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Min CGPA</label>
            <input type="number" step="0.01" name="min_cgpa" value={form.min_cgpa} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">No. of Vacancies</label>
            <input type="number" name="num_vacancies" value={form.num_vacancies} onChange={handleChange} min={1} className="w-full rounded-lg border border-slate-300 px-4 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Skills Required</label>
          <input name="skills_required" value={form.skills_required} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-4 py-2" placeholder="Comma separated" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">JD PDF URL (optional)</label>
          <input name="jd_pdf_url" value={form.jd_pdf_url} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-4 py-2" placeholder="Cloudinary or any URL" />
        </div>

        <div className="border-t border-slate-200 pt-4">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Hiring workflow</h2>
          <p className="text-slate-500 text-sm mb-3">
            Configure how students will be processed after they apply.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <label className={`border rounded-lg p-3 cursor-pointer ${form.hiring_flow === "applications" ? "border-emerald-400 bg-emerald-50" : "border-slate-200"}`}>
              <input
                type="radio"
                name="hiring_flow"
                value="applications"
                checked={form.hiring_flow === "applications"}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="font-medium text-slate-800">Application review</span>
              <div className="text-xs text-slate-500 mt-1">Shortlist & interview rounds</div>
            </label>
            <label className={`border rounded-lg p-3 cursor-pointer ${form.hiring_flow === "drive" ? "border-emerald-400 bg-emerald-50" : "border-slate-200"}`}>
              <input
                type="radio"
                name="hiring_flow"
                value="drive"
                checked={form.hiring_flow === "drive"}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="font-medium text-slate-800">Drive</span>
              <div className="text-xs text-slate-500 mt-1">Schedule a campus/online drive</div>
            </label>
            <label className={`border rounded-lg p-3 cursor-pointer ${form.hiring_flow === "both" ? "border-emerald-400 bg-emerald-50" : "border-slate-200"}`}>
              <input
                type="radio"
                name="hiring_flow"
                value="both"
                checked={form.hiring_flow === "both"}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="font-medium text-slate-800">Both</span>
              <div className="text-xs text-slate-500 mt-1">Drive + shortlist pipeline</div>
            </label>
          </div>

          {(form.hiring_flow === "applications" || form.hiring_flow === "both") && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Interview rounds (order is fixed; “Final” always included)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ROUND_OPTIONS.map((r) => (
                  <label
                    key={r.key}
                    className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer ${
                      (form.interview_rounds || []).includes(r.key) ? "border-emerald-300 bg-emerald-50" : "border-slate-200"
                    } ${r.key === "final" ? "opacity-80" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={(form.interview_rounds || []).includes(r.key)}
                      onChange={() => toggleRound(r.key)}
                      disabled={r.key === "final"}
                    />
                    <span className="text-sm text-slate-700">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        {errors.form && <p className="text-red-500">{errors.form}</p>}
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50">Submit for Approval</button>
          <button type="button" onClick={() => navigate("/jobs")} className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-300">Cancel</button>
        </div>
      </form>
    </div>
  );
}
