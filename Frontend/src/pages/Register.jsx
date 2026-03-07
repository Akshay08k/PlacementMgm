import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "../utils/AxiosInstance";

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    enrollment_number: "",
    roll_number: "",
    date_of_birth: "",
    gender: "",
    location: "",
    current_address: "",
    permanent_address: "",
    passing_year: "",
    marks_10th: "",
    marks_12th: "",
    current_cgpa: "",
    skills: "",
    resume_url: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.email) newErrors.email = "Required";
    if (!form.password || form.password.length < 8) newErrors.password = "Min 8 characters";
    if (!form.full_name) newErrors.full_name = "Required";
    if (!form.roll_number) newErrors.roll_number = "Required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setLoading(true);
    const education_history = pastEducation
      .filter((row) => row.degree || row.institution || row.year || row.score)
      .map(
        (row) =>
          `${row.degree || "Education"} - ${row.institution || ""} (${row.year || ""}) : ${
            row.score || ""
          }`.trim()
      )
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
      setErrors({
        form: data.detail || data.email?.[0] || data.roll_number?.[0] || "Registration failed.",
        ...data,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <nav className="px-6 py-4 border-b bg-white">
        <Link to="/" className="text-emerald-700 font-semibold">PMS</Link>
      </nav>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Student Registration</h1>
          <p className="text-slate-500 text-sm mb-6">
            Fill this form similarly to a Google Form. We collect your basic information, current course, and past education.
          </p>
          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800">Account</h2>
              <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-emerald-500" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-emerald-500" />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800">Personal Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-emerald-500"
                  />
                  {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Enrollment Number</label>
                  <input
                    type="text"
                    name="enrollment_number"
                    value={form.enrollment_number}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input type="text" name="phone" value={form.phone} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-4 py-2" />
              </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Roll Number *</label>
                  <input
                    type="text"
                    name="roll_number"
                    value={form.roll_number}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-emerald-500"
                  />
                  {errors.roll_number && <p className="text-red-500 text-xs mt-1">{errors.roll_number}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={form.date_of_birth}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Location (City)</label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Address</label>
                <textarea
                  name="current_address"
                  value={form.current_address}
                  onChange={handleChange}
                  rows={2}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Permanent Address</label>
                <textarea
                  name="permanent_address"
                  value={form.permanent_address}
                  onChange={handleChange}
                  rows={2}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2"
                />
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800">Current Education</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Passing Year</label>
                  <input
                    type="number"
                    name="passing_year"
                    value={form.passing_year}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  name="current_cgpa"
                  value={form.current_cgpa}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Skills</label>
                <textarea
                  name="skills"
                  value={form.skills}
                  onChange={handleChange}
                  rows={2}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  placeholder="Comma or line separated"
                />
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800">Past Education</h2>
              <p className="text-slate-500 text-sm">
                Add your past education history. Use one block per degree/standard (e.g., 10th, 12th, Diploma).
              </p>
              <div className="space-y-4">
                {pastEducation.map((row, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4 grid grid-cols-4 gap-3">
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-slate-700 mb-1">Degree / Standard</label>
                      <input
                        type="text"
                        value={row.degree}
                        onChange={(e) => handleEducationChange(index, "degree", e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                        placeholder="10th / 12th / B.Tech"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">University / College / School</label>
                      <input
                        type="text"
                        value={row.institution}
                        onChange={(e) => handleEducationChange(index, "institution", e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                        placeholder="Institute name"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-slate-700 mb-1">Passing Year</label>
                      <input
                        type="number"
                        value={row.year}
                        onChange={(e) => handleEducationChange(index, "year", e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                        placeholder="Year"
                      />
                      <label className="block text-xs font-medium text-slate-700 mt-2 mb-1">CGPA / Score</label>
                      <input
                        type="text"
                        value={row.score}
                        onChange={(e) => handleEducationChange(index, "score", e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                        placeholder="e.g. 8.5 / 85%"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addEducationRow}
                className="text-sm text-emerald-700 hover:text-emerald-800 font-medium"
              >
                + Add another education block
              </button>
            </section>

            {errors.form && <p className="text-red-500 text-sm">{errors.form}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg disabled:opacity-50"
            >
              {loading ? "Registering…" : "Submit"}
            </button>
          </form>
          <p className="text-center text-slate-500 text-sm mt-4">
            Already have an account? <Link to="/signin" className="text-emerald-600 hover:underline">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
