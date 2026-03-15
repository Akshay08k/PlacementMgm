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

  const canApply = role === "student" && job.status === "approved" && job.eligibility_status?.is_eligible;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header Banner */}
      <div className="bg-white border text-center md:text-left border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-emerald-50 to-teal-50 rounded-bl-full -z-10 opacity-70" />
        
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-white shadow-xl shadow-slate-200/50 flex flex-col items-center justify-center shrink-0 border border-slate-100 p-2">
           {job.company_logo ? (
             <img src={job.company_logo} alt="Company Logo" className="w-full h-full object-contain rounded-xl" />
           ) : (
             <div className="text-4xl font-black bg-linear-to-br from-emerald-600 to-teal-800 bg-clip-text text-transparent">
               {(job.company_name || "C").charAt(0).toUpperCase()}
             </div>
           )}
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${job.status === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
              {job.status}
            </span>
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1.5">
               <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
               {job.location || "Remote"}
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 leading-tight mb-2">
            {job.title}
          </h1>
          <p className="text-lg text-slate-500 font-medium">
            at <span className="text-emerald-700 font-semibold">{job.company_name}</span>
          </p>
        </div>

        {role === "student" && job.status === "approved" && (
           <div className="shrink-0 w-full md:w-auto mt-4 md:mt-0">
             <Link
                to={canApply ? `/jobs/${job.id}/apply` : "#"}
                className={`w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-white transition-all shadow-lg shadow-emerald-200 ${canApply ? "bg-emerald-600 hover:bg-emerald-700 hover:-translate-y-1" : "bg-slate-300 shadow-none cursor-not-allowed"}`}
                onClick={(e) => { if (!canApply) e.preventDefault(); }}
              >
                {canApply ? "Apply Now" : "Not Eligible"}
                {canApply && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
              </Link>
           </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </span>
              Job Description
            </h2>
            <div className="prose prose-slate prose-emerald max-w-none text-slate-600 whitespace-pre-line leading-relaxed">
              {job.description || "No description provided."}
            </div>

            {job.skills_required && (
              <div className="mt-8 pt-8 border-t border-slate-100">
                <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-4">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills_required.split(',').map((skill, i) => (
                    <span key={i} className="px-4 py-2 bg-slate-50 text-slate-700 font-medium rounded-xl border border-slate-200 text-sm">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {job.hiring_flow && (
            <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </span>
                Hiring Process
              </h2>
              
              <div className="flex flex-col gap-4">
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                   <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Method</div>
                   <div className="text-slate-800 font-medium capitalize">{job.hiring_flow.replace("_", " ")}</div>
                </div>

                {Array.isArray(job.interview_rounds) && job.interview_rounds.length > 0 && (
                  <div className="relative mt-2">
                    <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-slate-200 rounded-full" />
                    <div className="space-y-6">
                      {job.interview_rounds.map((round, idx) => (
                         <div key={idx} className="flex items-center gap-4 relative z-10">
                           <div className="w-12 h-12 rounded-full bg-white border-4 border-slate-100 flex items-center justify-center text-slate-400 font-bold shadow-sm">
                              {idx + 1}
                           </div>
                           <div className="bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 flex-1 font-medium text-slate-700 capitalize">
                             {round.replace("_", " ")}
                           </div>
                         </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Sticky Sidebar */}
        <div className="space-y-6 relative">
          <div className="sticky top-6 space-y-6">
            
            {/* Quick Stats Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
               <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-4">Overview</h3>
               <div className="space-y-4">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   </div>
                   <div>
                     <div className="text-xs text-slate-500 font-medium">Package</div>
                     <div className="font-bold text-slate-800">{job.package || "Not disclosed"}</div>
                   </div>
                 </div>

                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                   </div>
                   <div>
                     <div className="text-xs text-slate-500 font-medium">Vacancies</div>
                     <div className="font-bold text-slate-800">{job.num_vacancies} Openings</div>
                   </div>
                 </div>

                  {job.jd_pdf_url && (
                    <a href={job.jd_pdf_url} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl transition border border-slate-200 text-sm">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Download Document
                    </a>
                  )}
               </div>
            </div>

            {/* Eligibility Tracker */}
            <div className="bg-slate-800 rounded-3xl p-6 shadow-md text-slate-100 relative overflow-hidden">
               <div className="absolute -top-12 -right-12 w-32 h-32 bg-slate-700/50 rounded-full blur-2xl" />
               <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-5 relative z-10">Eligibility</h3>
               
               <div className="space-y-4 relative z-10">
                  {role === "student" && job.eligibility_status ? (
                     <>
                        <div className={`p-4 rounded-2xl flex items-start gap-3 ${job.eligibility_status.is_eligible ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300" : "bg-red-500/10 border border-red-500/20 text-red-300"}`}>
                           {job.eligibility_status.is_eligible ? (
                              <svg className="w-6 h-6 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                           ) : (
                              <svg className="w-6 h-6 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                           )}
                           <div>
                             <h4 className="font-bold text-white mb-1">
                               {job.eligibility_status.is_eligible ? "You are eligible to apply!" : "You are not eligible"}
                             </h4>
                             {!job.eligibility_status.is_eligible && job.eligibility_status.reasons.length > 0 && (
                               <ul className="text-sm opacity-90 list-disc list-inside space-y-1 mt-2">
                                  {job.eligibility_status.reasons.map((r, i) => <li key={i}>{r}</li>)}
                               </ul>
                             )}
                           </div>
                        </div>
                     </>
                  ) : (
                     <div className="space-y-3">
                       {job.min_cgpa && <div className="flex items-center gap-2"><svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> CGPA ≥ {job.min_cgpa}</div>}
                       {job.min_10th_percent && <div className="flex items-center gap-2"><svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> 10th Marks ≥ {job.min_10th_percent}%</div>}
                       {job.min_12th_percent && <div className="flex items-center gap-2"><svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> 12th/Diploma Marks ≥ {job.min_12th_percent}%</div>}
                       {job.eligibility_criteria && <div className="text-sm text-slate-300 mt-2 p-3 bg-slate-700/50 rounded-xl leading-relaxed">{job.eligibility_criteria}</div>}
                     </div>
                  )}
               </div>
            </div>

          </div>
        </div>

      </div>

      <div className="pt-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Listings
        </button>
      </div>

    </div>
  );
}

