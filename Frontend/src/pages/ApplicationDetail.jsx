import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../utils/AxiosInstance";
import { useAuth } from "../contexts/AuthContext";

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acting, setActing] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError("");
    axios
      .get(`/applications/${id}/`)
      .then((r) => setApp(r.data))
      .catch(() => setError("Could not load application."))
      .finally(() => setLoading(false));
  }, [id]);

  const doAction = async (action) => {
    if (!app) return;
    setActing(action);
    try {
      const res = await axios.post(`/applications/${app.id}/${action}/`);
      setApp(res.data);
    } catch (_) {
    } finally {
      setActing(null);
    }
  };

  if (loading) return <div className="text-slate-500">Loading application…</div>;
  if (error || !app)
    return (
      <div className="space-y-3">
        <p className="text-red-500 text-sm">{error || "Application not found."}</p>
        <button
          type="button"
          onClick={() => navigate("/applications")}
          className="text-emerald-600 hover:underline text-sm"
        >
          Back to Applications
        </button>
      </div>
    );

  const { job, student } = app;

  const canAct = role === "company";
  const isFinal = app.status === "selected";
  const isRejected = app.status === "rejected";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">
          Application #{app.id}
        </h1>
        {job && (
          <p className="text-slate-600 text-sm">
            {job.title} at {job.company_name}
          </p>
        )}
        <span
          className={`inline-block mt-2 text-xs px-2 py-0.5 rounded ${
            app.status === "selected"
              ? "bg-emerald-100 text-emerald-800"
              : app.status === "shortlisted"
              ? "bg-blue-100 text-blue-800"
              : app.status === "rejected"
              ? "bg-red-100 text-red-800"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {app.status} · {app.current_round || "—"}
        </span>
      </div>

      {job && (
        <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 text-sm text-slate-700">
          <h2 className="font-semibold text-slate-800 mb-1">Job</h2>
          <div>
            <span className="font-medium">Title: </span>
            {job.title}
          </div>
          <div>
            <span className="font-medium">Company: </span>
            {job.company_name}
          </div>
          {job.location && (
            <div>
              <span className="font-medium">Location: </span>
              {job.location}
            </div>
          )}
          {job.min_cgpa && (
            <div>
              <span className="font-medium">Min CGPA: </span>
              {job.min_cgpa}
            </div>
          )}
        </section>
      )}

      {student && role !== "student" && (
        <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 text-sm text-slate-700">
          <h2 className="font-semibold text-slate-800 mb-1">Student</h2>
          <div>
            <span className="font-medium">Name: </span>
            {student.full_name}
          </div>
          <div>
            <span className="font-medium">Email: </span>
            {student.email}
          </div>
          <div>
            <span className="font-medium">Roll No: </span>
            {student.roll_number}
          </div>
          <div>
            <span className="font-medium">Department: </span>
            {student.department_name || "—"}
          </div>
          <div>
            <span className="font-medium">Course: </span>
            {student.course_name || "—"}
          </div>
          <div>
            <span className="font-medium">CGPA: </span>
            {student.current_cgpa ?? "—"}
          </div>
          <div>
            <span className="font-medium">Placement status: </span>
            {student.placement_status}
          </div>
        </section>
      )}

      {canAct && (
        <section className="space-y-2">
          <h2 className="font-semibold text-slate-800 text-sm">
            Actions
          </h2>
          <div className="flex flex-wrap gap-2 text-sm">
            {!isFinal && (
              <button
                type="button"
                disabled={acting === "shortlist"}
                onClick={() => doAction("shortlist")}
                className="px-3 py-1 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-50"
              >
                Shortlist
              </button>
            )}
            {!isFinal && !isRejected && (
              <button
                type="button"
                disabled={acting === "advance-round"}
                onClick={() => doAction("advance-round")}
                className="px-3 py-1 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
              >
                Next round
              </button>
            )}
            {!isFinal && !isRejected && (
              <button
                type="button"
                disabled={acting === "reject"}
                onClick={() => doAction("reject")}
                className="px-3 py-1 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                Reject
              </button>
            )}
            {!isFinal && (
              <button
                type="button"
                disabled={acting === "select"}
                onClick={() => doAction("select")}
                className="px-3 py-1 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 disabled:opacity-50"
              >
                Select
              </button>
            )}
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-sm text-slate-600 hover:underline"
      >
        ← Back
      </button>
    </div>
  );
}

