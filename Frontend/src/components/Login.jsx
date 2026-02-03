import { useState } from "react";
import { FaUserGraduate, FaBuilding, FaUserTie, FaUserShield } from "react-icons/fa";

export default function SignInPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);

  const roles = [
    { name: "Student", icon: FaUserGraduate },
    { name: "TPO / Placement Officer", icon: FaUserTie },
    { name: "Company / Recruiter", icon: FaBuilding },
    { name: "Admin", icon: FaUserShield },
  ];

  const validate = () => {
    const newErrors = {};
    if (!selectedRole) newErrors.role = "Please select a role";
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email";
    if (!password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    console.log({ selectedRole, email, password });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
      {/* Navbar */}
      <nav className="px-8 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-emerald-700">
          Placement Management System
        </h1>
        <img src="https://ljku.edu.in/web/image/course.program/14/website_logo" height={30} width={400}></img>
      </nav>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-2">
            Sign in
          </h2>
          <p className="text-center text-gray-500 mb-6">
            Continue to placement portal
          </p>

          {/* Role dropdown */}
          <div className="relative mb-4">
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className={`w-full flex items-center justify-between px-4 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 ${errors.role
                ? "ring-red-300"
                : "focus:ring-emerald-400"
                }`}
            >
              {selectedRole ? (
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = roles.find(r => r.name === selectedRole).icon;
                    return <Icon className="text-emerald-600" />;
                  })()}
                  <span>{selectedRole}</span>
                </div>
              ) : (
                <span className="text-gray-400">Select your role</span>
              )}
              <span className="text-gray-400">▾</span>
            </button>

            {open && (
              <div className="absolute z-10 mt-2 w-full bg-white rounded-lg shadow">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.name}
                      type="button"
                      onClick={() => {
                        setSelectedRole(role.name);
                        setOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-emerald-50 text-left"
                    >
                      <Icon className="text-emerald-600" />
                      <span>{role.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {errors.role && (
              <p className="text-sm text-red-500 mt-1">{errors.role}</p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${errors.email
                ? "border-red-400 focus:ring-red-300"
                : "border-gray-300 focus:ring-emerald-400"
                }`}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${errors.password
                ? "border-red-400 focus:ring-red-300"
                : "border-gray-300 focus:ring-emerald-400"
                }`}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 rounded-lg transition"
            >
              Sign In
            </button>
            <div className="text-right">
              <a href="#forgotPass" className="text-black hover:text-blue-500">Forgot Password</a>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 py-4">
        © {new Date().getFullYear()} XYZ College of Engineering. All rights reserved.
      </footer>
    </div>
  );
}
