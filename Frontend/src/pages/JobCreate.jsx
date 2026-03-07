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
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

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
        {errors.form && <p className="text-red-500">{errors.form}</p>}
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50">Submit for Approval</button>
          <button type="button" onClick={() => navigate("/jobs")} className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-300">Cancel</button>
        </div>
      </form>
    </div>
  );
}
