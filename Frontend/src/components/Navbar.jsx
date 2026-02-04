import React from 'react'
import { BiLogOut, BiLogIn } from 'react-icons/bi'

const Navbar = () => {
    return (
        <>
            <nav className="relative z-100 bg-white/80 backdrop-blur-sm shadow-sm sticky top-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center space-x-3">
                            <img
                                src="https://ljku.edu.in/web/image/course.program/14/website_logo"
                                alt="LJ University Logo"
                                className="h-12 w-auto"
                            />
                            <div className="border-l-2 border-green-500 pl-3">
                                <div className="text-sm text-gray-600">LJ University</div>
                                <div className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    Placement Portal
                                </div>
                            </div>
                        </div>

                        {/* {user && (
                            <div className="hidden md:flex space-x-8">
                                <a href="#" className="text-gray-700 hover:text-green-600 transition-colors">Dashboard</a>
                                <a href="#" className="text-gray-700 hover:text-green-600 transition-colors">
                                    {user.role === 'student' ? 'Jobs' : user.role === 'company' ? 'Candidates' : 'Management'}
                                </a>
                                <a href="#" className="text-gray-700 hover:text-green-600 transition-colors">Calendar</a>
                                <a href="#" className="text-gray-700 hover:text-green-600 transition-colors">Reports</a>
                            </div>
                        )} */}

                        <div className="flex items-center space-x-4">
                            {/* {user ? (
                                <>
                                    <div className="hidden md:block text-right">
                                        <div className="text-sm font-semibold text-gray-900">
                                            {user.role === 'company' ? user.companyName : user.name}
                                        </div>
                                        <div className="text-xs text-gray-600 capitalize">{user.role}</div>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="bg-red-500 text-white px-4 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                                    >
                                        <BiLogOut />
                                        <span>Logout</span>
                                    </button>
                                </>
                            ) : ( */}
                            <button
                                onClick={() => setShowLoginModal(true)}
                                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                            >
                                <BiLogIn />
                                <span>Sign In</span>
                            </button>
                            {/* )} */}
                        </div>
                    </div>
                </div>
            </nav>
        </>
    )
}

export default Navbar