import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../utils/AxiosInstance";
import { useAuth } from "../contexts/AuthContext";

export default function ApplicationsPage() {
  const { role } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  useEffect(() => {
    axios.get("/applications/").then((r) => setList(Array.isArray(r.data) ? r.data : r.data.results || [])).catch(() => setList([])).finally(() => setLoading(false));
  }, []);

  const doAction = async (id, action) => {
    setActing(`${id}:${action}`);
    try {
      const res = await axios.post(`/applications/${id}/${action}/`);
      setList((prev) => prev.map((a) => (a.id === id ? res.data : a)));
    } catch (_) {
    } finally {
      setActing(null);
    }
  };

  if (loading) return <div className="text-slate-500">Loading…</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">{role === "student" ? "My Applications" : "Applications"}</h1>
      <div className="space-y-3">
        {list.length === 0 && <p className="text-slate-500">No applications.</p>}
        {list.map((app) => (
          <div key={app.id} className="bg-white rounded-xl border border-slate-200 p-4 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-slate-800">{app.job?.title} at {app.job?.company_name}</h3>
              {role !== "student" && app.student && (
                <p className="text-slate-500 text-sm">{app.student.full_name} · {app.student.roll_number} · CGPA {app.student.current_cgpa ?? "—"}</p>
              )}
              <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded ${
                app.status === "selected" ? "bg-emerald-100 text-emerald-800" :
                app.status === "shortlisted" ? "bg-blue-100 text-blue-800" :
                app.status === "rejected" ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-600"
              }`}>
                {app.status} · {app.current_round || "—"}
              </span>
              {role === "company" && app.job?.hiring_flow && (
                <div className="text-xs text-slate-500 mt-1">
                  Flow: {app.job.hiring_flow} {Array.isArray(app.job.interview_rounds) && app.job.interview_rounds.length > 0 ? `· Rounds: ${app.job.interview_rounds.join(" → ")}` : ""}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Link to={`/applications/${app.id}`} className="text-emerald-600 hover:underline text-sm">View</Link>
              {role === "company" && (
                <div className="flex gap-2">
                  {app.status !== "selected" && (
                    <button
                      type="button"
                      disabled={acting === `${app.id}:shortlist`}
                      onClick={() => doAction(app.id, "shortlist")}
                      className="text-blue-600 hover:underline text-sm disabled:opacity-50"
                    >
                      Shortlist
                    </button>
                  )}
                  {app.status !== "rejected" && app.status !== "selected" && (
                    <button
                      type="button"
                      disabled={acting === `${app.id}:advance-round`}
                      onClick={() => doAction(app.id, "advance-round")}
                      className="text-emerald-700 hover:underline text-sm disabled:opacity-50"
                    >
                      Next round
                    </button>
                  )}
                  {app.status !== "rejected" && app.status !== "selected" && (
                    <button
                      type="button"
                      disabled={acting === `${app.id}:reject`}
                      onClick={() => doAction(app.id, "reject")}
                      className="text-red-600 hover:underline text-sm disabled:opacity-50"
                    >
                      Reject
                    </button>
                  )}
                  {app.status !== "selected" && (
                    <button
                      type="button"
                      disabled={acting === `${app.id}:select`}
                      onClick={() => doAction(app.id, "select")}
                      className="text-amber-700 hover:underline text-sm disabled:opacity-50"
                    >
                      Select
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
