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

  const getProgressWidth = (currentStatus, currentRoundName) => {
    if (currentStatus === "applied") return "10%";
    if (currentStatus === "rejected") return "100%";
    if (currentStatus === "selected") return "100%";
    
    // Calculate based on rounds
    if (!job?.interview_rounds || job.interview_rounds.length === 0) return "50%";
    const total = job.interview_rounds.length;
    const idx = job.interview_rounds.indexOf(currentRoundName);
    if (idx === -1) return "20%";
    
    return `${Math.max(10, Math.floor(((idx + 1) / total) * 100))}%`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Profile Card */}
      <div className="bg-white border text-center md:text-left border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
         <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-indigo-50 to-blue-50 rounded-bl-full -z-10 opacity-70" />
         
         <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-linear-to-br from-indigo-600 to-blue-800 shadow-xl shadow-indigo-200 flex flex-col items-center justify-center shrink-0 border border-indigo-500 text-white font-black text-4xl">
             {student?.full_name ? student.full_name.charAt(0).toUpperCase() : "S"}
         </div>

         <div className="flex-1">
           <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
             <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                App ID: #{app.id}
             </span>
             <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${
                app.status === "selected" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                app.status === "rejected" ? "bg-red-50 text-red-700 border-red-200" :
                app.status === "shortlisted" ? "bg-blue-50 text-blue-700 border-blue-200" :
                "bg-amber-50 text-amber-700 border-amber-200"
              }`}>
                {app.status}
              </span>
           </div>

           <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 leading-tight mb-2">
             {student?.full_name || "Applicant"}
           </h1>
           <p className="text-lg text-slate-500 font-medium">
             applying for <span className="text-indigo-700 font-semibold">{job?.title}</span>
           </p>
         </div>
      </div>

      {/* Progress Tracker */}
      {job?.interview_rounds && job.interview_rounds.length > 0 && app.status !== "applied" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
           <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-8 text-center text-slate-800">Application Progress</h3>
           
           <div className="relative max-w-2xl mx-auto">
              <div className="absolute top-5 left-0 right-0 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ease-out ${app.status === "rejected" ? "bg-red-500" : app.status === "selected" ? "bg-emerald-500" : "bg-indigo-500"}`}
                  style={{ width: getProgressWidth(app.status, app.current_round) }}
                />
              </div>

              <div className="flex justify-between relative z-10">
                {job.interview_rounds.map((round, idx) => {
                   const isPast = job.interview_rounds.indexOf(app.current_round) > idx;
                   const isCurrent = app.current_round === round && app.status !== "rejected" && app.status !== "selected";
                   const isRejectedHere = app.status === "rejected" && app.current_round === round;
                   const isFinished = app.status === "selected" || isPast;

                   let dotClass = "bg-white border-slate-200 text-slate-300";
                   if (isFinished) dotClass = "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200";
                   else if (isCurrent) dotClass = "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 ring-4 ring-indigo-500/20";
                   else if (isRejectedHere) dotClass = "bg-red-500 border-red-500 text-white shadow-lg shadow-red-200";

                   return (
                     <div key={round} className="flex flex-col items-center gap-3 relative group">
                        <div className={`w-11 h-11 rounded-full border-4 flex items-center justify-center font-bold text-sm transition-all duration-500 ${dotClass}`}>
                           {isFinished ? (
                             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                           ) : isRejectedHere ? (
                             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                           ) : (
                             idx + 1
                           )}
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-wider text-center max-w-[80px] ${isCurrent || isFinished ? "text-slate-800" : isRejectedHere ? "text-red-500" : "text-slate-400"}`}>
                          {round.replace("_", " ")}
                        </span>
                     </div>
                   );
                })}
              </div>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {student && role !== "student" && (
          <section className="bg-slate-50 border border-slate-200 rounded-3xl p-8 shadow-sm text-sm text-slate-700">
            <h2 className="font-bold text-slate-800 mb-5 text-lg flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Student Details
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500 font-medium">Email</span>
                <span className="font-semibold">{student.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500 font-medium">Roll No</span>
                <span className="font-semibold">{student.roll_number}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500 font-medium">Department</span>
                <span className="font-semibold">{student.department_name || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500 font-medium">Course</span>
                <span className="font-semibold">{student.course_name || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-500 font-medium">CGPA</span>
                <span className="font-semibold">{student.current_cgpa ?? "—"}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-500 font-medium">Placement Status</span>
                <span className={`font-bold uppercase tracking-wider text-xs px-2 py-1 rounded ${student.placement_status === "placed" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`}>
                  {student.placement_status}
                </span>
              </div>
            </div>
          </section>
        )}

        {job && (
          <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-sm text-slate-700">
            <h2 className="font-bold text-slate-800 mb-5 text-lg flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Job Reference
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Title</span>
                <span className="font-semibold text-right">{job.title}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Company</span>
                <span className="font-semibold text-right">{job.company_name}</span>
              </div>
              {job.location && (
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-medium">Location</span>
                  <span className="font-semibold text-right">{job.location}</span>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {canAct && (
        <section className="bg-slate-800 rounded-3xl p-8 shadow-md text-slate-100 relative overflow-hidden">
          <div className="absolute -top-24 -right-10 w-48 h-48 bg-slate-700/50 rounded-full blur-3xl z-0" />
          <h2 className="font-bold tracking-widest text-slate-400 uppercase mb-5 relative z-10 text-sm">
            Company Actions
          </h2>
          <div className="flex flex-wrap gap-3 text-sm relative z-10">
            {!isFinal && app.status === "applied" && (
              <button
                type="button"
                disabled={acting === "shortlist"}
                onClick={() => doAction("shortlist")}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50"
              >
                Shortlist Candidate
              </button>
            )}
            {!isFinal && !isRejected && app.status !== "applied" && (
              <button
                type="button"
                disabled={acting === "advance-round"}
                onClick={() => doAction("advance-round")}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50"
              >
                Advance to Next Round
              </button>
            )}
            {!isFinal && !isRejected && (
              <button
                type="button"
                disabled={acting === "reject"}
                onClick={() => doAction("reject")}
                className="px-6 py-3 rounded-xl bg-slate-700 hover:bg-red-600 text-white font-bold transition-all disabled:opacity-50"
              >
                Reject
              </button>
            )}
             {!isFinal && app.status !== "applied" && (
              <button
                type="button"
                disabled={acting === "select"}
                onClick={() => doAction("select")}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 ml-auto"
              >
                Final Select
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

