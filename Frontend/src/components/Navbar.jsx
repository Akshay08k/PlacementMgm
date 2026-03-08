import React, { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useInstituteConfig } from "../contexts/InstituteConfigContext"
import { MdMenu, MdClose, MdDashboard } from "react-icons/md"
import { FaUserCircle } from "react-icons/fa"
import { BiLogOut } from "react-icons/bi"

const NAV_LINKS = {
  student: [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Jobs", path: "/jobs" },
    { label: "Applications", path: "/applications" },
    { label: "Resources", path: "/resources" },
    { label: "Resume", path: "/resume" },
    { label: "Profile", path: "/profile" },
  ],
  tpo: [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Students", path: "/students" },
    { label: "Companies", path: "/companies" },
    { label: "Jobs", path: "/jobs" },
    { label: "Drives", path: "/drives" },
    { label: "Resources", path: "/resources" },
    { label: "Institute", path: "/settings/institute" },
  ],
  admin: [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Students", path: "/students" },
    { label: "Companies", path: "/companies" },
    { label: "Jobs", path: "/jobs" },
    { label: "Drives", path: "/drives" },
    { label: "Resources", path: "/resources" },
    { label: "Institute", path: "/settings/institute" },
  ],
  company: [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Post Job", path: "/jobs/create" },
    { label: "Applications", path: "/applications" },
  ],
}

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, role, isAuthenticated, logOut } = useAuth()
  const { config: institute } = useInstituteConfig()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const [moreMenu, setMoreMenu] = useState(false)

  const links = NAV_LINKS[role] || []

  const mainLinks = links.slice(0, 4)
  const moreLinks = links.slice(4)

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/")

  const handleLogout = async () => {
    await logOut()
    navigate("/signin")
  }

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 font-semibold text-gray-900"
          >
            {institute?.logo_url ? (
              <img
                src={institute.logo_url}
                alt="logo"
                className="h-8"
              />
            ) : (
              <img
                src="https://ljku.edu.in/web/image/course.program/14/website_logo"
                alt="logo"
                className="h-8"
              />
            )}
            <span className="hidden sm:block">Placement Portal</span>
          </button>

          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">

              {mainLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition
                    ${
                      isActive(link.path)
                        ? "bg-emerald-50 text-emerald-600"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  {link.label}
                </button>
              ))}

              {moreLinks.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setMoreMenu(!moreMenu)}
                    className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    More
                  </button>

                  {moreMenu && (
                    <div className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-md py-1">
                      {moreLinks.map((link) => (
                        <button
                          key={link.path}
                          onClick={() => {
                            navigate(link.path)
                            setMoreMenu(false)
                          }}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                        >
                          {link.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">

            {isAuthenticated && (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserMenu(!userMenu)}
                  className="flex items-center gap-2"
                >
                  <FaUserCircle className="text-xl text-gray-600" />
                  <span className="text-sm font-medium">
                    
                    {user?.first_name + " " + user?.last_name || "User"}
                    </span>
                </button>

                {userMenu && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-md py-1">

                    <button
                      onClick={() => navigate("/profile")}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      Profile
                    </button>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                    >
                      <BiLogOut />
                      Logout
                    </button>

                  </div>
                )}
              </div>
            )}

            {isAuthenticated && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden text-gray-600"
              >
                {mobileOpen ? (
                  <MdClose className="text-2xl" />
                ) : (
                  <MdMenu className="text-2xl" />
                )}
              </button>
            )}

          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-white">

          {links.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`block w-full text-left px-4 py-3 text-sm
                ${
                  isActive(link.path)
                    ? "bg-emerald-50 text-emerald-600"
                    : "text-gray-700"
                }`}
            >
              {link.label}
            </button>
          ))}

          <div className="border-t mt-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-3 text-red-500"
            >
              <BiLogOut />
              Logout
            </button>
          </div>

        </div>
      )}
    </nav>
  )
}