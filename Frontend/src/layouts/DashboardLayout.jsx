import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const navStudent = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/jobs", label: "Jobs" },
  { to: "/applications", label: "My Applications" },
  { to: "/profile", label: "Profile" },
  { to: "/resume", label: "Resume" },
];

const navCompany = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/jobs", label: "Jobs" },
  { to: "/applications", label: "Applications" },
  { to: "/drives", label: "Drives" },
  { to: "/profile", label: "Profile" },
];

const navAdmin = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/students", label: "Students" },
  { to: "/companies", label: "Companies" },
  { to: "/jobs", label: "Jobs" },
  { to: "/admin-resources", label: "Resources" },
  { to: "/reports", label: "Reports" },
];

export default function DashboardLayout() {
  const { user, role, logOut } = useAuth();
  const navigate = useNavigate();
  const nav = role === "student" ? navStudent : role === "company" ? navCompany : navAdmin;

  const handleLogout = () => {
    logOut();
    navigate("/signin");
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-56 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-700">
          <Link to="/dashboard" className="font-semibold text-emerald-400">PMS</Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-700">
          <p className="text-xs text-slate-400 truncate px-2">{user?.email}</p>
          <p className="text-xs text-slate-500 capitalize px-2">{role}</p>
          <button
            onClick={handleLogout}
            className="mt-2 w-full text-left px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white text-sm"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
