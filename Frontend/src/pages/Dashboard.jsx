import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../utils/AxiosInstance";
import { useAuth } from "../contexts/AuthContext";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import CompanyCreatePage from "./CompanyCreate";



function RingProgress({ pct = 0, size = 80, stroke = 7, color = "#10b981" }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = Math.min(pct / 100, 1) * circ;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1.2s ease" }}
        />
      </svg>
      <span className="absolute text-sm font-bold text-slate-800">{pct}%</span>
    </div>
  );
}

function ProgressBar({ value = 0, max = 100, color = "#10b981", delay = 0 }) {
  const [w, setW] = useState(0);
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;
  useEffect(() => {
    const t = setTimeout(() => setW(pct), 150 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${w}%`, background: color }}
      />
    </div>
  );
}

function StatCard({ label, value, sub, children }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      {value !== undefined && (
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      )}
      {children}
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm px-3 py-2 text-xs">
      <div className="font-semibold text-slate-700 mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-slate-600">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          {p.name}: <span className="font-bold text-slate-800 ml-1">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { role } = useAuth();
  const [stats, setStats] = useState(null);
  const [studentSummary, setStudentSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companyCreatePopup, setCompanyCreatePopup] = useState(false);
  const [loadError, setLoadError] = useState(null);


  
  useEffect(() => {
    let cancelled = false;

    if (role === "student") {
      Promise.all([axios.get("/students/me/"), axios.get("/applications/")])
        .then(([meRes, appsRes]) => {
          if (cancelled) return;
          const profile = meRes.data || {};
          const apps = Array.isArray(appsRes.data)
            ? appsRes.data
            : appsRes.data.results || [];

          const total = apps.length;
          const selected = apps.filter((a) => a.status === "selected").length;
          const inProcess = apps.filter((a) =>
            ["applied", "shortlisted"].includes(a.status)
          ).length;
          const rejected = apps.filter((a) => a.status === "rejected").length;

          const importantFields = [
            profile.full_name, profile.phone, profile.enrollment_number,
            profile.roll_number, profile.current_cgpa, profile.skills, profile.resume_url,
          ];
          const filledCount = importantFields.filter((v) => v && String(v).trim() !== "").length;
          const profileCompletion = importantFields.length
            ? Math.round((filledCount / importantFields.length) * 100) : 0;

          setStudentSummary({ profile, totalApplications: total, selected, inProcess, rejected, profileCompletion });
        })
        .catch(() => { if (!cancelled) setStudentSummary(null); })
        .finally(() => { if (!cancelled) setLoading(false); });
    } else if (role === "company") {
      axios.get("/companies/dashboard/")
        .then((r) => { if (!cancelled) setStats(r.data); })
        .catch(() => {})
        .finally(() => { if (!cancelled) setLoading(false); });
    } else if (role === "tpo" || role === "admin") {
      axios.get("/reports/admin-dashboard/")
        .then((r) => {
          if (!cancelled) {
            setStats(r.data);
            setLoadError(null);
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setStats(null);
            setLoadError(err?.response?.status === 500
              ? "Server error loading dashboard. Please restart the backend and try again."
              : "Failed to load dashboard data.");
          }
        })
        .finally(() => { if (!cancelled) setLoading(false); });
    } else {
      setLoading(false);
    }

    return () => { cancelled = true; };
  }, [role]);

  if (loading) return <div className="text-slate-500">Loading…</div>;

  if (loadError && (role === "tpo" || role === "admin")) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">{role === "admin" ? "Admin" : "TPO"} Dashboard</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
          <p className="font-medium">{loadError}</p>
          <p className="text-sm mt-1">Ensure migrations are applied: <code className="bg-amber-100 px-1 rounded">python manage.py migrate</code></p>
          <button
            onClick={() => {
              setLoadError(null);
              setLoading(true);
              axios.get("/reports/admin-dashboard/")
                .then((r) => { setStats(r.data); setLoadError(null); })
                .catch(() => setLoadError("Still unable to load. Check backend is running."))
                .finally(() => setLoading(false));
            }}
            className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (role === "student") {
    const s = studentSummary;
    const total = s?.totalApplications ?? 0;

    // bar chart data from real values
    const appChartData = [
      { name: "Applied", value: s?.inProcess ?? 0, color: "#06b6d4" },
      { name: "Selected", value: s?.selected ?? 0, color: "#10b981" },
      { name: "Rejected", value: s?.rejected ?? 0, color: "#f87171" },
    ];

    return (
      <div className="space-y-6">
        
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">
            Welcome{s?.profile?.full_name ? `, ${s.profile.full_name}` : ""}
          </h1>
          <p className="text-slate-500 text-sm">
            Quick overview of your placement journey. Use the navbar to explore Jobs, Applications, Resources, Settings and Resume.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Applications" value={total} sub="Total jobs applied to" />
          <StatCard label="In Progress" value={s?.inProcess ?? 0} sub="Applied / Shortlisted" />
          <StatCard label="Offers" value={s?.selected ?? 0} sub="Final selections received" />

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
            <RingProgress pct={s?.profileCompletion ?? 0} />
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Profile</p>
              <p className="text-sm font-semibold text-slate-700">Completion</p>
              <p className="text-xs text-slate-400 mt-0.5">Contact, skills & resume</p>
            </div>
          </div>
        </div>

        {total > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Application Breakdown</h2>
            <div className="flex gap-6 items-end">
              {/* simple visual bars */}
              <div className="flex-1">
                {appChartData.map((d, i) => (
                  <div key={i} className="flex items-center gap-3 mb-3">
                    <span className="text-xs text-slate-500 w-16 shrink-0">{d.name}</span>
                    <div className="flex-1">
                      <ProgressBar value={d.value} max={total} color={d.color} delay={i * 100} />
                    </div>
                    <span className="text-xs font-bold text-slate-700 w-6 text-right">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800 mb-2">Next steps</h2>
            <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
              <li>Complete your profile in Settings if anything is missing.</li>
              <li>Upload or generate your resume from the Resume section.</li>
              <li>Browse Jobs and apply to roles that match your interests.</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800 mb-2">Quick links</h2>
            <div className="flex flex-wrap gap-2 text-sm">
              <Link to="/jobs" className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100">Browse Jobs</Link>
              <Link to="/applications" className="px-3 py-1.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100">My Applications</Link>
              <Link to="/resources" className="px-3 py-1.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100">Resources</Link>
              <Link to="/profile" className="px-3 py-1.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100">Settings</Link>
              <Link to="/resume" className="px-3 py-1.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100">Resume</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (role === "company" && stats) {
    const filled = stats.vacancies_filled ?? 0;
    const total = stats.total_vacancies ?? 0;
    const fillRate = total > 0 ? Math.round((filled / total) * 100) : 0;

    const barData = [
      { name: "Active Jobs", value: stats.active_jobs ?? 0 },
      { name: "Vacancies", value: total },
      { name: "Filled", value: filled },
      { name: "Applications", value: stats.applications_received ?? 0 },
    ];

    return (
      <div className="space-y-6">
  
        <h1 className="text-2xl font-bold text-slate-800">Company Dashboard</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Active Jobs" value={stats.active_jobs ?? 0} />
          <StatCard label="Total Vacancies" value={total} />
          <StatCard label="Applications" value={stats.applications_received ?? 0} />

          {/* Vacancy fill rate ring */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
            <RingProgress pct={fillRate} color="#10b981" />
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Fill Rate</p>
              <p className="text-sm font-semibold text-slate-700">{filled} / {total}</p>
              <p className="text-xs text-slate-400 mt-0.5">Vacancies filled</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Overview</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={["#10b981", "#06b6d4", "#6366f1", "#f59e0b"][i % 4]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex gap-3">
          <Link to="/jobs/create" className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-sm">Post a Job</Link>
          <Link to="/applications" className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-300 text-sm">View Applications</Link>
        </div>
      </div>
    );
  }

  if ((role === "tpo" || role === "admin") && stats) {
    const placed = stats.students_placed ?? 0;
    const total = stats.students_total ?? 0;
    const placementRate = stats.placement_rate ?? (total > 0 ? Math.round((placed / total) * 100) : 0);

    const barData = [
      { name: "Total", value: total },
      { name: "Placed", value: placed },
      { name: "Unplaced", value: Math.max(total - placed, 0) },
    ];

    return (
      <div className="space-y-6">
        <CompanyCreatePage
        isOpen={companyCreatePopup}
        onClose={() => setCompanyCreatePopup(false)}
        />
        <h1 className="text-2xl font-bold text-slate-800">
          {role === "admin" ? "Admin" : "TPO"} Dashboard
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Students" value={total} />
          <StatCard label="Placed" value={placed} />
          <StatCard label="Companies" value={stats.companies_total ?? 0} />
          <StatCard label="Applications" value={stats.applications_total ?? 0} />
        </div>

        <div className="grid md:grid-cols-2 gap-4">

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Placement Rate</h2>
            <div className="flex items-center gap-5">
              <RingProgress pct={placementRate} size={88} stroke={8} color="#10b981" />
              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Placed</span>
                    <span className="font-semibold text-slate-700">{placed} / {total}</span>
                  </div>
                  <ProgressBar value={placed} max={total} color="#10b981" delay={0} />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Unplaced</span>
                    <span className="font-semibold text-slate-700">{Math.max(total - placed, 0)}</span>
                  </div>
                  <ProgressBar value={Math.max(total - placed, 0)} max={total} color="#f87171" delay={100} />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Jobs Pending Approval</span>
                    <span className="font-semibold text-slate-700">{stats.jobs_pending ?? 0}</span>
                  </div>
                  <ProgressBar value={stats.jobs_pending ?? 0} max={Math.max(stats.jobs_pending ?? 0, 20)} color="#f59e0b" delay={200} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Student Overview</h2>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={barData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Students" radius={[4, 4, 0, 0]}>
                  <Cell fill="#06b6d4" />
                  <Cell fill="#10b981" />
                  <Cell fill="#f87171" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard label="Jobs Pending" value={stats.jobs_pending ?? 0} sub="Awaiting approval" />
          <StatCard label="Companies" value={stats.companies_total ?? 0} sub="Registered on portal" />
          <StatCard label="Total Applications" value={stats.applications_total ?? 0} sub="Across all jobs" />
        </div>

        <div className="flex gap-3 flex-wrap">
          <Link to="/students/import" className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-sm">Import Students (Excel)</Link>
          <button onClick={() => setCompanyCreatePopup(true)} className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 text-sm">Create Company</button>
          <Link to="/jobs" className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-300 text-sm">Manage Jobs</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>
      <p className="text-slate-500">Welcome. Use the sidebar to navigate.</p>
    </div>
  );
}