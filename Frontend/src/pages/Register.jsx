import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: "", password: "", full_name: "", phone: "",
    enrollment_number: "", roll_number: "", date_of_birth: "",
    gender: "", location: "", current_address: "", permanent_address: "",
    passing_year: "", marks_10th: "", marks_12th: "", current_cgpa: "",
    skills: "", resume_url: "",
  });
  const [pastEducation, setPastEducation] = useState([
    { degree: "10th", institution: "", year: "", score: "" },
    { degree: "12th", institution: "", year: "", score: "" },
  ]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { registerStudent } = useAuth();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEducationChange = (index, field, value) => {
    setPastEducation((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addEducationRow = () => {
    setPastEducation((prev) => [...prev, { degree: "", institution: "", year: "", score: "" }]);
  };

  const removeEducationRow = (index) => {
    if (pastEducation.length <= 1) return;
    setPastEducation((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.email) newErrors.email = "Email is required";
    if (!form.password || form.password.length < 8) newErrors.password = "Minimum 8 characters";
    if (!form.full_name) newErrors.full_name = "Full name is required";
    if (!form.roll_number) newErrors.roll_number = "Roll number is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setLoading(true);
    const education_history = pastEducation
      .filter((row) => row.degree || row.institution || row.year || row.score)
      .map((row) => `${row.degree || "Education"} - ${row.institution || ""} (${row.year || ""}) : ${row.score || ""}`.trim())
      .join("\n");
    try {
      await registerStudent({
        ...form,
        department_id: form.department_id || null,
        course_id: form.course_id || null,
        passing_year: form.passing_year ? parseInt(form.passing_year, 10) : null,
        marks_10th: form.marks_10th ? parseFloat(form.marks_10th) : null,
        marks_12th: form.marks_12th ? parseFloat(form.marks_12th) : null,
        current_cgpa: form.current_cgpa ? parseFloat(form.current_cgpa) : null,
        education_history,
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const data = err.response?.data || {};
      setErrors({ form: data.detail || data.email?.[0] || data.roll_number?.[0] || "Registration failed.", ...data });
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full border-0 border-b-2 border-slate-200 bg-transparent px-0 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors duration-150";

  return (
    <div className="min-h-screen bg-slate-100">

      <div className="bg-linear-to-br from-emerald-900 via-emerald-700 to-emerald-500">
        <nav className="px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-white/90 font-semibold text-sm tracking-tight">
            Placement Management System
          </span>
        </nav>
        <div className="text-center pb-14 pt-2 px-4">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Student Registration</h1>
          <p className="text-emerald-100 text-sm">Fill in your details to get started with campus placements</p>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 pb-16 -mt-6">
        <form onSubmit={handleSubmit} noValidate>

          <div className="bg-white rounded-xl shadow-sm border-t-8 border-emerald-500 px-7 py-5 mb-3">
            <h2 className="text-xl font-bold text-slate-800 mb-1">Registration Form</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              This form collects your personal, academic, and educational details for placement eligibility.
              Please fill all required fields carefully.
            </p>
            <p className="text-red-500 text-xs mt-3">* Required fields</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm px-7 py-6 mb-3 border-l-4 border-emerald-500">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold flex items-center justify-center shrink-0">1</span>
              <h3 className="text-base font-semibold text-emerald-700">Account Information</h3>
            </div>
            <p className="text-slate-400 text-xs mb-5 ml-8">These will be your login credentials</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Email address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="you@college.edu"
                  className={`${inputBase} ${errors.email ? "border-red-400 focus:border-red-400" : ""}`}
                  autoComplete="email"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">⚠ {errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password" name="password" value={form.password} onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  className={`${inputBase} ${errors.password ? "border-red-400 focus:border-red-400" : ""}`}
                  autoComplete="new-password"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">⚠ {errors.password}</p>}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm px-7 py-6 mb-3 border-l-4 border-emerald-500">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold flex items-center justify-center shrink-0">2</span>
              <h3 className="text-base font-semibold text-emerald-700">Personal Details</h3>
            </div>
            <p className="text-slate-400 text-xs mb-5 ml-8">Your basic identity information</p>

            <div className="grid grid-cols-2 gap-x-6 gap-y-5 mb-5">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" name="full_name" value={form.full_name} onChange={handleChange}
                  placeholder="As per official records"
                  className={`${inputBase} ${errors.full_name ? "border-red-400 focus:border-red-400" : ""}`}
                />
                {errors.full_name && <p className="text-red-500 text-xs mt-1">⚠ {errors.full_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Enrollment Number</label>
                <input
                  type="text" name="enrollment_number" value={form.enrollment_number} onChange={handleChange}
                  placeholder="e.g. 21BECE001" className={inputBase}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-x-6 gap-y-5 mb-5">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Roll Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" name="roll_number" value={form.roll_number} onChange={handleChange}
                  placeholder="e.g. 21BCE001"
                  className={`${inputBase} ${errors.roll_number ? "border-red-400 focus:border-red-400" : ""}`}
                />
                {errors.roll_number && <p className="text-red-500 text-xs mt-1">⚠ {errors.roll_number}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Phone Number</label>
                <input
                  type="text" name="phone" value={form.phone} onChange={handleChange}
                  placeholder="+91 98765 43210" className={inputBase}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Date of Birth</label>
                <input
                  type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange}
                  className={inputBase}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-5 mb-5">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange} className={`${inputBase} cursor-pointer`}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">City / Location</label>
                <input
                  type="text" name="location" value={form.location} onChange={handleChange}
                  placeholder="e.g. Ahmedabad" className={inputBase}
                />
              </div>
            </div>

            <hr className="border-slate-100 my-4" />

            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-600 mb-1">Current Address</label>
              <textarea
                name="current_address" value={form.current_address} onChange={handleChange}
                placeholder="Your current residential address" rows={2}
                className={`${inputBase} resize-none`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Permanent Address</label>
              <textarea
                name="permanent_address" value={form.permanent_address} onChange={handleChange}
                placeholder="Your permanent / hometown address" rows={2}
                className={`${inputBase} resize-none`}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm px-7 py-6 mb-3 border-l-4 border-emerald-500">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold flex items-center justify-center shrink-0">3</span>
              <h3 className="text-base font-semibold text-emerald-700">Current Education</h3>
            </div>
            <p className="text-slate-400 text-xs mb-5 ml-8">Details about your ongoing degree programme</p>

            <div className="grid grid-cols-2 gap-x-6 gap-y-5 mb-5">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Passing Year</label>
                <input
                  type="number" name="passing_year" value={form.passing_year} onChange={handleChange}
                  placeholder="e.g. 2026" className={inputBase}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Current CGPA</label>
                <input
                  type="number" step="0.01" name="current_cgpa" value={form.current_cgpa} onChange={handleChange}
                  placeholder="e.g. 8.50" className={inputBase}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Skills</label>
              <textarea
                name="skills" value={form.skills} onChange={handleChange}
                placeholder="e.g. Python, React, Machine Learning, SQL (comma or line separated)"
                rows={3} className={`${inputBase} resize-none`}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm px-7 py-6 mb-3 border-l-4 border-emerald-500">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold flex items-center justify-center shrink-0">4</span>
              <h3 className="text-base font-semibold text-emerald-700">Past Education</h3>
            </div>
            <p className="text-slate-400 text-xs mb-5 ml-8">Add one block per degree (10th, 12th, Diploma, etc.)</p>

            <div className="space-y-4">
              {pastEducation.map((row, index) => (
                <div key={index} className="bg-slate-50 border border-slate-200 rounded-lg p-4 relative">
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-3">
                    {row.degree || `Education ${index + 1}`}
                  </p>
                  {index > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEducationRow(index)}
                      className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-red-500 hover:bg-red-50 text-lg leading-none transition-colors"
                    >
                      ×
                    </button>
                  )}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Degree / Standard</label>
                      <input
                        type="text" value={row.degree}
                        onChange={(e) => handleEducationChange(index, "degree", e.target.value)}
                        placeholder="e.g. 10th / 12th / B.Tech" className={inputBase}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">University / College / School</label>
                      <input
                        type="text" value={row.institution}
                        onChange={(e) => handleEducationChange(index, "institution", e.target.value)}
                        placeholder="Institution name" className={inputBase}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Passing Year</label>
                      <input
                        type="number" value={row.year}
                        onChange={(e) => handleEducationChange(index, "year", e.target.value)}
                        placeholder="e.g. 2021" className={inputBase}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">CGPA / Percentage</label>
                      <input
                        type="text" value={row.score}
                        onChange={(e) => handleEducationChange(index, "score", e.target.value)}
                        placeholder="e.g. 9.2 / 91%" className={inputBase}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button" onClick={addEducationRow}
              className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-dashed border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 text-emerald-600 font-medium text-sm rounded-lg py-2.5 transition-colors"
            >
              <span className="text-base leading-none">+</span>
              Add another education block
            </button>
          </div>

          {errors.form && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-5 py-3 mb-3 text-red-700 text-sm">
              <span>⚠</span> {errors.form}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm px-7 py-6 flex flex-col gap-4">
            <p className="text-slate-400 text-xs leading-relaxed">
              By submitting this form, you confirm that all information provided is accurate and complete.
              Your profile will be reviewed for placement eligibility.
            </p>
            <button
              type="submit" disabled={loading}
              className="self-start flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-150"
            >
              {loading && (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              )}
              {loading ? "Submitting…" : "Submit Registration"}
            </button>
            <p className="text-slate-500 text-sm">
              Already registered?{" "}
              <Link to="/signin" className="text-emerald-600 font-semibold hover:underline">
                Sign in here
              </Link>
            </p>
          </div>

        </form>
      </main>
    </div>
  );
}