import {
  FaUserShield,
  FaUsers,
  FaCogs,
  FaCheckCircle,
  FaUniversity,
  FaChartLine,
} from "react-icons/fa";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-green-100 text-gray-800 px-6 py-12">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header Section */}
        <section className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-green-700">
            About Placement Management System
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            The Placement Management System (PMS) is a centralized digital
            platform designed to streamline and modernize the entire campus
            placement process. Built with transparency, automation, and
            role-based access at its core, PMS ensures a seamless experience for
            students, placement officers, and recruiters.
          </p>
        </section>

        {/* How System Works */}
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold text-green-700">
              How the System Works
            </h2>
            <p className="text-gray-600">
              PMS functions as an end-to-end workflow-driven system where every
              placement activity is digitized. From student profile creation to
              final offer tracking, each step is automated to reduce manual
              intervention. Data flows securely between modules, ensuring
              real-time updates, accuracy, and consistency across the platform.
            </p>
            <p className="text-gray-600">
              The system intelligently manages eligibility checks, application
              tracking, recruiter coordination, and placement analytics, making
              the process faster, more reliable, and completely auditable.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <FeatureCard icon={<FaCogs />} title="Automation" />
            <FeatureCard icon={<FaChartLine />} title="Real-Time Tracking" />
            <FeatureCard icon={<FaCheckCircle />} title="Eligibility Rules" />
            <FeatureCard icon={<FaUniversity />} title="Centralized Control" />
          </div>
        </section>

        {/* Role Based Login */}
        <section className="space-y-8">
          <h2 className="text-3xl font-semibold text-green-700 text-center">
            Role-Based Login System
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <RoleCard
              icon={<FaUsers />}
              title="Student"
              description="Students can securely log in to manage their profiles, upload resumes, view eligibility, apply for companies, track application status, and receive placement notifications in real time."
            />
            <RoleCard
              icon={<FaUserShield />}
              title="Placement Officer / Admin"
              description="Admins have complete control over the system including student verification, company onboarding, eligibility criteria setup, scheduling drives, and monitoring overall placement statistics."
            />
            <RoleCard
              icon={<FaUniversity />}
              title="Recruiter"
              description="Recruiters can post job opportunities, define criteria, view eligible candidates, schedule interviews, and release offers through a secure recruiter dashboard."
            />
          </div>
        </section>

        {/* Policy & Transparency */}
        <section className="bg-white rounded-2xl shadow-md p-10 space-y-6">
          <h2 className="text-3xl font-semibold text-green-700">
            Policy Transparency
          </h2>
          <p className="text-gray-600">
            Transparency is a foundational principle of PMS. All placement
            policies, eligibility rules, and company-specific criteria are
            clearly displayed to students before application. This eliminates
            confusion and ensures fairness throughout the placement process.
          </p>
          <p className="text-gray-600">
            Every action within the system is logged and traceable. Students can
            see why they are eligible or ineligible, admins can audit decisions,
            and recruiters can trust the authenticity of candidate data.
          </p>
        </section>

        {/* Automated Process */}
        <section className="space-y-6">
          <h2 className="text-3xl font-semibold text-green-700">
            Fully Automated Placement Process
          </h2>
          <p className="text-gray-600 max-w-4xl">
            PMS replaces manual spreadsheets and paper-based workflows with
            intelligent automation. Once data is entered, the system
            automatically handles eligibility filtering, application
            shortlisting, notifications, interview scheduling, and offer
            management.
          </p>
          <p className="text-gray-600 max-w-4xl">
            Automated alerts and dashboards keep all stakeholders informed at
            every stage. This not only saves time but also minimizes human
            errors and ensures a smooth, predictable placement cycle.
          </p>
        </section>

        {/* Footer Note */}
        <section className="text-center text-sm text-gray-500">
          Designed with a modern lime & light green theme to deliver clarity,
          trust, and an intuitive user experience for every stakeholder involved
          in placements.
        </section>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center justify-center space-y-3">
      <div className="text-green-600 text-3xl">{icon}</div>
      <p className="font-medium text-gray-700">{title}</p>
    </div>
  );
}

function RoleCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-8 space-y-4 hover:shadow-lg transition">
      <div className="text-green-600 text-4xl">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
