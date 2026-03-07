import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../utils/AxiosInstance";
import { useAuth } from "../contexts/AuthContext";

export default function JobsPage() {
  const { role } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    axios
      .get("/companies/jobs/")
      .then((r) =>
        setJobs(Array.isArray(r.data) ? r.data : r.data.results || []),
      )
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-slate-500">Loading jobs…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Jobs</h1>
        {role === "company" && (
          <Link to="/jobs/create" className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">Post Job</Link>
        )}
      </div>
      <div className="space-y-3">
        {jobs.length === 0 && <p className="text-slate-500">No jobs yet.</p>}
        {jobs.map((job) => (
          <div key={job.id} className="bg-white rounded-xl border border-slate-200 p-4 flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-slate-800">{job.title}</h3>
              <p className="text-slate-500 text-sm">{job.company_name} · {job.package || "—"} · {job.location || "—"}</p>
              {job.min_cgpa && <p className="text-slate-500 text-xs mt-1">Min CGPA: {job.min_cgpa}</p>}
              <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded ${job.status === "approved" ? "bg-emerald-100 text-emerald-800" : job.status === "pending" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}>
                {job.status}
              </span>
            </div>
            <div className="flex gap-2">
              <Link to={`/jobs/${job.id}`} className="text-emerald-600 hover:underline text-sm">View</Link>
              {role === "student" && job.status === "approved" && (
                <Link to={`/jobs/${job.id}/apply`} className="text-slate-600 hover:underline text-sm">Apply</Link>
              )}
              {(role === "tpo" || role === "admin") && job.status === "pending" && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setApproving(job.id);
                      setFeedback("");
                    }}
                    className="text-amber-600 hover:underline text-sm"
                  >
                    Approve / Reject
                  </button>
                </>
              )}
            </div>
            {(role === "tpo" || role === "admin") &&
              approving === job.id && (
                <div className="mt-3 w-full">
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                    placeholder="Optional feedback if rejecting"
                  />
                  <div className="flex gap-2 mt-2 text-xs">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await axios.post(
                            `/companies/jobs/${job.id}/approve/`,
                            { approved: true },
                          );
                          setJobs((prev) =>
                            prev.map((j) =>
                              j.id === job.id ? res.data : j,
                            ),
                          );
                        } catch (_) {
                        } finally {
                          setApproving(null);
                          setFeedback("");
                        }
                      }}
                      className="bg-emerald-600 text-white px-3 py-1 rounded-lg hover:bg-emerald-700"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await axios.post(
                            `/companies/jobs/${job.id}/approve/`,
                            { approved: false, rejection_feedback: feedback },
                          );
                          setJobs((prev) =>
                            prev.map((j) =>
                              j.id === job.id ? res.data : j,
                            ),
                          );
                        } catch (_) {
                        } finally {
                          setApproving(null);
                          setFeedback("");
                        }
                      }}
                      className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setApproving(null);
                        setFeedback("");
                      }}
                      className="px-3 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}
