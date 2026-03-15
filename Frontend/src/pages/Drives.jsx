import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "../utils/AxiosInstance";

export default function DrivesPage() {
  const { role } = useAuth();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({
    title: "",
    job: "",
    drive_date: "",
    location_or_link: "",
    instructions: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDrives();
    if (role === "tpo" || role === "admin" || role === "company") {
      // Fetch open jobs that could have a drive scheduled
      // Adjust path if TPO/admin need a different API for jobs. /companies/jobs/ provides jobs if authenticated.
      axios.get(role === "company" ? "/companies/jobs/" : "/companies/jobs/")
        .then((r) => {
          const fetchedJobs = Array.isArray(r.data) ? r.data : r.data.results || [];
          setJobs(fetchedJobs.filter(j => j.status === "approved"));
        })
        .catch(() => setJobs([]));
    }
  }, [role]);

  const fetchDrives = () => {
    setLoading(true);
    axios
      .get("/drives/")
      .then((r) => setDrives(Array.isArray(r.data) ? r.data : r.data.results || []))
      .catch(() => setDrives([]))
      .finally(() => setLoading(false));
  };

  const handleCreateTarget = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await axios.post("/drives/create/", form);
      setShowModal(false);
      setForm({ title: "", job: "", drive_date: "", location_or_link: "", instructions: "" });
      fetchDrives();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create drive. Check your inputs.");
      if (err.response?.data && typeof err.response.data === 'object' && !err.response.data.detail) {
           setError(JSON.stringify(err.response.data));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-slate-500">Loading placement drives…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Placement Drives</h1>
        {(role === "company" || role === "tpo" || role === "admin") && (
          <button 
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
            onClick={() => setShowModal(true)}
          >
            Schedule Drive
          </button>
        )}
      </div>

      <div className="space-y-4">
        {drives.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
             <p className="text-slate-500 text-lg">No drives currently scheduled.</p>
          </div>
        )}
        {drives.map((drive) => (
          <div key={drive.id} className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-sm transition-shadow">
            <div>
              <h3 className="font-semibold text-xl text-slate-800">{drive.title}</h3>
              <p className="text-emerald-700 font-medium text-sm mt-1">{drive.company_name || drive.company?.name || "Unknown Company"}</p>
              {drive.job && (
                  <p className="text-sm text-slate-500 mt-0.5">Role: {drive.job.title}</p>
              )}
              <div className="flex gap-4 text-sm text-slate-500 mt-3">
                <span className="flex items-center gap-1">
                  <strong>Date:</strong> {new Date(drive.drive_date).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <strong>Mode/Location:</strong> {drive.location_or_link}
                </span>
              </div>
            </div>
            <div className="flex shrink-0">
              <Link 
                to={`/drives/${drive.id}`} 
                className="px-5 py-2 block bg-slate-50 text-slate-700 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg font-medium text-sm transition-colors"
               >
                View Details & Applicants
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Drive Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 my-8">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-slate-800">Schedule New Drive</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            
             {error && (
                <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
                  {error}
                </div>
              )}

            <form onSubmit={handleCreateTarget} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Drive Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g. Acme Corp Campus Recruitment Drive"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Target Job / Role</label>
                <select
                  required
                  value={form.job}
                  onChange={(e) => setForm({ ...form, job: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">Select an approved job</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>{j.title} ({j.company_name})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={form.drive_date}
                  onChange={(e) => setForm({ ...form, drive_date: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location / Meeting Link</label>
                <input
                  type="text"
                  required
                  value={form.location_or_link}
                  onChange={(e) => setForm({ ...form, location_or_link: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g. Auditorium A or https://zoom.us/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Instructions for Students</label>
                <textarea
                  value={form.instructions}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Any prerequisites or instructions..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-70"
                >
                  {submitting ? "Scheduling..." : "Schedule Drive"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
