import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../utils/AxiosInstance";
import { useAuth } from "../contexts/AuthContext";

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    axios
      .get(`/companies/jobs/${id}/`)
      .then((r) => setJob(r.data))
      .catch(() => setError("Could not load job details."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-slate-500">Loading job…</div>;
  if (error || !job)
    return (
      <div className="space-y-3">
        <p className="text-red-500 text-sm">{error || "Job not found."}</p>
        <button
          type="button"
          onClick={() => navigate("/jobs")}
          className="text-emerald-600 hover:underline text-sm"
        >
          Back to Jobs
        </button>
      </div>
    );

  const canApply = role === "student" && job.status === "approved";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">
            {job.title}
          </h1>
          <p className="text-slate-600 text-sm">
            {job.company_name} · {job.package || "—"} · {job.location || "—"}
          </p>
          <span
            className={`inline-block mt-2 text-xs px-2 py-0.5 rounded ${
              job.status === "approved"
                ? "bg-emerald-100 text-emerald-800"
                : job.status === "pending"
                ? "bg-amber-100 text-amber-800"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {job.status}
          </span>
        </div>
        {canApply && (
          <Link
            to={`/jobs/${job.id}/apply`}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-sm"
          >
            Apply
          </Link>
        )}
      </div>

      {job.hiring_flow && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-600">
          <div className="font-semibold text-slate-700 mb-1">
            Hiring workflow
          </div>
          <div>Mode: {job.hiring_flow}</div>
          {Array.isArray(job.interview_rounds) && job.interview_rounds.length > 0 && (
            <div className="mt-1">
              Rounds: {job.interview_rounds.join(" → ")}
            </div>
          )}
        </div>
      )}

      <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div>
          <h2 className="font-semibold text-slate-800 mb-1">Job description</h2>
          <p className="text-slate-600 text-sm whitespace-pre-line">
            {job.description || "No description provided."}
          </p>
        </div>

        {job.eligibility_criteria && (
          <div>
            <h2 className="font-semibold text-slate-800 mb-1">Eligibility</h2>
            <p className="text-slate-600 text-sm whitespace-pre-line">
              {job.eligibility_criteria}
            </p>
          </div>
        )}

        {job.skills_required && (
          <div>
            <h2 className="font-semibold text-slate-800 mb-1">Skills required</h2>
            <p className="text-slate-600 text-sm">
              {job.skills_required}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
          <div>
            <span className="font-semibold text-slate-700">Vacancies: </span>
            {job.num_vacancies}
          </div>
          {job.min_cgpa && (
            <div>
              <span className="font-semibold text-slate-700">Min CGPA: </span>
              {job.min_cgpa}
            </div>
          )}
          {job.jd_pdf_url && (
            <div>
              <a
                href={job.jd_pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 hover:underline"
              >
                View JD PDF
              </a>
            </div>
          )}
        </div>
      </section>

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

