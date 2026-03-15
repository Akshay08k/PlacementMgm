import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "../utils/AxiosInstance";

export default function DriveDetailPage() {
  const { id } = useParams();
  const { role } = useAuth();
  
  const [drive, setDrive] = useState(null);
  const [applications, setApplications] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [appsLoading, setAppsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDrive();
    fetchApplications();
  }, [id]);

  const fetchDrive = () => {
    axios
      .get(`/drives/${id}/`)
      .then((r) => setDrive(r.data))
      .catch(() => setError("Failed to load drive details."))
      .finally(() => setLoading(false));
  };

  const fetchApplications = () => {
    setAppsLoading(true);
    axios
      .get(`/drives/${id}/applications/`)
      .then((r) => setApplications(Array.isArray(r.data) ? r.data : r.data.results || []))
      .catch(() => setApplications([]))
      .finally(() => setAppsLoading(false));
  };

  const toggleAttendance = async (appId, currentStatus) => {
    try {
      const res = await axios.patch(`/drives/${id}/applications/${appId}/attendance/`, {
        attended: !currentStatus
      });
      // Update local state
      setApplications(prev => prev.map(app => app.id === appId ? { ...app, attended: res.data.attended } : app));
    } catch (err) {
      alert("Failed to update attendance.");
    }
  };

  if (loading) return <div className="text-slate-500 p-4">Loading drive details…</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!drive) return <div className="text-slate-500 p-4">Drive not found.</div>;

  const canManageAttendance = role === "tpo" || role === "admin" || role === "company";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{drive.title}</h1>
          <p className="text-emerald-700 font-medium">{drive.company_name || drive.company?.name}</p>
        </div>
        <Link to="/drives" className="px-4 py-2 text-sm font-medium border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition">
          Back to Drives
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Drive Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <span className="block text-slate-500 mb-1">Date</span>
            <span className="font-medium text-slate-800">{new Date(drive.drive_date).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="block text-slate-500 mb-1">Target Job</span>
            <span className="font-medium text-slate-800">
              {drive.job ? (
                 <Link to={`/jobs/${drive.job.id}`} className="text-emerald-600 hover:underline">{drive.job.title}</Link>
              ) : "N/A"}
            </span>
          </div>
          <div className="md:col-span-2">
            <span className="block text-slate-500 mb-1">Location / Link</span>
            <span className="font-medium text-slate-800 break-words">{drive.location_or_link}</span>
          </div>
          {drive.instructions && (
            <div className="md:col-span-2 mt-2">
              <span className="block text-slate-500 mb-1">Instructions for Students</span>
              <div className="p-3 bg-slate-50 rounded-lg text-slate-700 border border-slate-100 whitespace-pre-wrap">
                {drive.instructions}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">Applicants & Attendance</h2>
          <span className="text-xs font-medium bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
            {applications.length} Students
          </span>
        </div>
        
        {appsLoading ? (
          <div className="p-6 text-slate-500">Loading applicants...</div>
        ) : applications.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No applications found for this drive's targeted job yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase border-b border-slate-200 font-semibold">
                <tr>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Email / Roll No</th>
                  <th className="px-6 py-4">Status / Round</th>
                  <th className="px-6 py-4 text-center">Attended Drive</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {app.student?.user?.first_name} {app.student?.user?.last_name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-800">{app.student?.user?.email}</div>
                      <div className="text-xs font-mono text-slate-500 mt-0.5">{app.student?.roll_number}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-0.5 text-xs rounded border ${
                        app.status === "selected" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        app.status === "rejected" ? "bg-red-50 text-red-700 border-red-200" :
                        "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {app.status.toUpperCase()}
                      </span>
                      <div className="text-xs text-slate-500 mt-1">Round: {app.current_round}</div>
                    </td>
                    <td className="px-6 py-4 text-center align-middle">
                      {canManageAttendance ? (
                        <label className="relative inline-flex items-center cursor-pointer group">
                          <input 
                            type="checkbox" 
                            className="w-5 h-5 text-emerald-600 bg-slate-100 border-slate-300 rounded focus:ring-emerald-500 focus:ring-2 cursor-pointer transition"
                            checked={!!app.attended}
                            onChange={() => toggleAttendance(app.id, !!app.attended)}
                          />
                        </label>
                      ) : (
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${app.attended ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                           {app.attended ? "Present" : "—"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
