import React, { useState, useEffect } from 'react';
import { FaBriefcase, FaUsers, FaChartLine, FaCalendarAlt, FaBuilding, FaGraduationCap, FaArrowRight, FaCheckCircle, FaUserTie, FaClipboardList, FaFileAlt } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { MdDashboard, MdNotifications, MdBusiness, MdAssignment, MdEventNote } from 'react-icons/md';
import { BiLogIn } from 'react-icons/bi';

export default function LJUPlacementHomePage() {
    const [scrollY, setScrollY] = useState(0);
    const [isVisible, setIsVisible] = useState({});

    const [user, setUser] = useState(null);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const timers = [
            setTimeout(() => setIsVisible(prev => ({ ...prev, hero: true })), 100),
            setTimeout(() => setIsVisible(prev => ({ ...prev, features: true })), 300),
            setTimeout(() => setIsVisible(prev => ({ ...prev, stats: true })), 500),
        ];
        return () => timers.forEach(clearTimeout);
    }, []);

    const getRoleBasedContent = () => {
        switch (user?.role) {
            case 'student':
                return {
                    title: `Welcome back, ${user.name}!`,
                    subtitle: "Explore new placement opportunities and track your applications",
                    quickActions: [
                        { icon: <FaBriefcase />, label: "Browse Jobs", color: "from-green-500 to-emerald-500" },
                        { icon: <FaFileAlt />, label: "My Applications", color: "from-blue-500 to-cyan-500" },
                        { icon: <FaCalendarAlt />, label: "Upcoming Drives", color: "from-purple-500 to-pink-500" },
                        { icon: <MdDashboard />, label: "My Profile", color: "from-orange-500 to-red-500" }
                    ],
                    stats: [
                        { number: user.applicationsCount || "5", label: "Applications", icon: <FaFileAlt /> },
                        { number: user.interviewsScheduled || "2", label: "Interviews", icon: <FaCalendarAlt /> },
                        { number: user.offersReceived || "1", label: "Offers", icon: <FaCheckCircle /> },
                        { number: user.profileCompletion || "85%", label: "Profile", icon: <FaGraduationCap /> }
                    ]
                };

            case 'tpo':
                return {
                    title: `Welcome, ${user.name}`,
                    subtitle: "Training & Placement Officer Dashboard - Manage placements efficiently",
                    quickActions: [
                        { icon: <MdBusiness />, label: "Manage Companies", color: "from-green-500 to-emerald-500" },
                        { icon: <FaUsers />, label: "Student Database", color: "from-blue-500 to-cyan-500" },
                        { icon: <MdEventNote />, label: "Schedule Drives", color: "from-purple-500 to-pink-500" },
                        { icon: <FaChartLine />, label: "Reports & Analytics", color: "from-orange-500 to-red-500" }
                    ],
                    stats: [
                        { number: "1,245", label: "Total Students", icon: <FaGraduationCap /> },
                        { number: "87", label: "Companies", icon: <FaBuilding /> },
                        { number: "42", label: "Active Drives", icon: <MdEventNote /> },
                        { number: "78%", label: "Placement Rate", icon: <FaCheckCircle /> }
                    ]
                };

            case 'company':
                return {
                    title: `Welcome, ${user.companyName}`,
                    subtitle: "Post opportunities and find the best talent from LJ University",
                    quickActions: [
                        { icon: <MdAssignment />, label: "Post Job", color: "from-green-500 to-emerald-500" },
                        { icon: <FaClipboardList />, label: "View Applications", color: "from-blue-500 to-cyan-500" },
                        { icon: <FaCalendarAlt />, label: "Schedule Interviews", color: "from-purple-500 to-pink-500" },
                        { icon: <FaUsers />, label: "Candidate Pool", color: "from-orange-500 to-red-500" }
                    ],
                    stats: [
                        { number: user.activeJobs || "8", label: "Active Jobs", icon: <FaBriefcase /> },
                        { number: user.applications || "156", label: "Applications", icon: <FaFileAlt /> },
                        { number: user.shortlisted || "34", label: "Shortlisted", icon: <FaCheckCircle /> },
                        { number: user.hired || "12", label: "Hired", icon: <FaUserTie /> }
                    ]
                };

            case 'admin':
                return {
                    title: `Admin Dashboard - ${user.name}`,
                    subtitle: "Complete system control and management",
                    quickActions: [
                        { icon: <FaUsers />, label: "User Management", color: "from-green-500 to-emerald-500" },
                        { icon: <MdBusiness />, label: "Company Approvals", color: "from-blue-500 to-cyan-500" },
                        { icon: <FaChartLine />, label: "System Analytics", color: "from-purple-500 to-pink-500" },
                        { icon: <MdDashboard />, label: "Configuration", color: "from-orange-500 to-red-500" }
                    ],
                    stats: [
                        { number: "1,245", label: "Students", icon: <FaGraduationCap /> },
                        { number: "87", label: "Companies", icon: <FaBuilding /> },
                        { number: "5", label: "TPO Staff", icon: <FaUserTie /> },
                        { number: "99.2%", label: "Uptime", icon: <FaCheckCircle /> }
                    ]
                };

            default:
                return null;
        }
    };



    const roleBasedContent = user ? getRoleBasedContent() : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-mint-50 to-emerald-50 overflow-hidden">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-mint-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>


            {user ? (
                // Logged In User Content
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
                    {/* Welcome Section */}
                    <div className={`transform transition-all duration-1000 ${isVisible.hero ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-8 md:p-12 text-white shadow-2xl mb-8">
                            <div className="flex items-center space-x-2 mb-4">
                                <HiSparkles className="text-3xl" />
                                <span className="text-sm font-semibold uppercase tracking-wide">Dashboard</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-3">{roleBasedContent.title}</h1>
                            <p className="text-xl opacity-90">{roleBasedContent.subtitle}</p>
                        </div>

                        {/* Quick Actions */}
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {roleBasedContent.quickActions.map((action, index) => (
                                    <button
                                        key={index}
                                        className={`bg-gradient-to-r ${action.color} text-white p-6 rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group`}
                                    >
                                        <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform">
                                            {action.icon}
                                        </div>
                                        <div className="font-semibold">{action.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {roleBasedContent.stats.map((stat, index) => (
                                    <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center hover:shadow-xl transform hover:scale-105 transition-all duration-300 group">
                                        <div className="text-green-500 text-3xl mb-2 flex justify-center group-hover:scale-110 transition-transform">
                                            {stat.icon}
                                        </div>
                                        <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                                        <div className="text-gray-600">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity or Notifications */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                                    <MdNotifications className="text-2xl text-green-500" />
                                </div>
                                <div className="space-y-3">
                                    {[1, 2, 3].map((item) => (
                                        <div key={item} className="flex items-start space-x-3 p-3 hover:bg-green-50 rounded-lg transition-colors">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                            <div className="flex-1">
                                                <div className="text-sm font-semibold text-gray-900">New notification {item}</div>
                                                <div className="text-xs text-gray-600">2 hours ago</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-gray-900">Upcoming Events</h3>
                                    <FaCalendarAlt className="text-2xl text-green-500" />
                                </div>
                                <div className="space-y-3">
                                    {[1, 2, 3].map((item) => (
                                        <div key={item} className="flex items-start space-x-3 p-3 hover:bg-green-50 rounded-lg transition-colors">
                                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">
                                                {10 + item}
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-semibold text-gray-900">Campus Drive</div>
                                                <div className="text-xs text-gray-600">Feb {10 + item}, 2024 - 10:00 AM</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // Guest/Public Content
                <>
                    {/* Hero Section */}
                    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
                        <div className={`text-center transform transition-all duration-1000 ${isVisible.hero ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-6 animate-bounce-slow">
                                <HiSparkles className="text-xl" />
                                <span className="text-sm font-semibold">LJ University Placement Cell</span>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-10">
                                Shape Your Future at
                                <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent animate-gradient p-2">
                                    LJ University
                                </span>
                            </h1>

                            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
                                Connecting LJ University's brightest minds with leading companies. Your journey to a successful career starts here.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    className="group bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                                >
                                    <span>Access Portal</span>
                                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button className="bg-white text-green-600 px-8 py-4 rounded-full text-lg font-semibold border-2 border-green-500 hover:bg-green-50 transform hover:scale-105 transition-all duration-300">
                                    Learn More
                                </button>
                            </div>
                        </div>

                        {/* Stats Section */}
                        <div className={`mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 transform transition-all duration-1000 delay-300 ${isVisible.stats ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                            {[
                                { number: "1200+", label: "Students", icon: <FaGraduationCap /> },
                                { number: "85+", label: "Partner Companies", icon: <FaBuilding /> },
                                { number: "90%", label: "Placement Rate", icon: <FaCheckCircle /> },
                                { number: "500+", label: "Opportunities", icon: <FaBriefcase /> }
                            ].map((stat, index) => (
                                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center hover:shadow-xl transform hover:scale-105 transition-all duration-300 group">
                                    <div className="text-green-500 text-3xl mb-2 flex justify-center group-hover:scale-110 transition-transform">
                                        {stat.icon}
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                                    <div className="text-gray-600">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Who We Serve Section */}
                    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                        <div className={`text-center mb-16 transform transition-all duration-1000 ${isVisible.features ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                Who We Serve
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                A comprehensive platform designed for all stakeholders
                            </p>
                        </div>

                        <div className={`grid md:grid-cols-2 lg:grid-cols-4 gap-8 transform transition-all duration-1000 delay-200 ${isVisible.features ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                            {[
                                {
                                    icon: FaGraduationCap,
                                    title: "Students",
                                    description: "Access placement opportunities, track applications, and build your career",
                                    color: "from-blue-500 to-cyan-500"
                                },
                                {
                                    icon: FaUserTie,
                                    title: "TPO",
                                    description: "Manage placement drives, coordinate with companies, and track student progress",
                                    color: "from-green-500 to-emerald-500"
                                },
                                {
                                    icon: MdBusiness,
                                    title: "Companies",
                                    description: "Post opportunities, access talented candidates, and schedule campus drives",
                                    color: "from-purple-500 to-pink-500"
                                },
                                {
                                    icon: MdDashboard,
                                    title: "Admin",
                                    description: "Complete system control, analytics, and user management",
                                    color: "from-orange-500 to-red-500"
                                }
                            ].map((card, index) => (
                                <div
                                    key={index}
                                    className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer border border-green-100 hover:border-green-300"
                                >
                                    <div className={`text-transparent bg-gradient-to-r ${card.color} bg-clip-text mb-4 transform group-hover:scale-110 transition-all duration-300`}>
                                        <card.icon className='text-green-500 text-3xl mb-2 flex justify-center' />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{card.title}</h3>
                                    <p className="text-gray-600">{card.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-12 text-center text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Get Started?</h2>
                            <p className="text-xl mb-8 opacity-90">Join the LJ University Placement Portal today</p>
                            <button
                                onClick={() => setShowLoginModal(true)}
                                className="bg-white text-green-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2"
                            >
                                <BiLogIn />
                                <span>Sign In Now</span>
                            </button>
                        </div>
                    </section>
                </>
            )}

            {/* Footer */}
            <footer className="relative z-10 bg-gray-900 text-white py-12 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8 mb-8">
                        <div>
                            <img
                                src="https://ljku.edu.in/web/image/course.program/14/website_logo"
                                alt="LJ University Logo"
                                className="h-12 w-auto mb-4"
                            />
                            <p className="text-gray-400">LJ University Placement Portal - Empowering futures, one placement at a time.</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-green-400 transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-green-400 transition-colors">Contact</a></li>
                                <li><a href="#" className="hover:text-green-400 transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-green-400 transition-colors">Terms of Service</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-lg mb-4">Contact Us</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>LJ University Campus</li>
                                <li>Email: placements@ljku.edu.in</li>
                                <li>Phone: +91 XXX XXX XXXX</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center">
                        <p className="text-gray-400">© 2024 LJ University. All rights reserved.</p>
                    </div>
                </div>
            </footer>

            <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -20px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 20px) scale(1.05); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
      `}</style>
        </div>
    );
}