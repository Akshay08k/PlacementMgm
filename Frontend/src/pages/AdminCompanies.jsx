import { useEffect, useState, useMemo } from "react";
import axios from "../utils/AxiosInstance";
import { useAuth } from "../contexts/AuthContext";
import { MdSearch, MdClose, MdBusiness } from "react-icons/md";
import CompanyCreatePage from "./CompanyCreate";
function IndustryBadge({ industry }) {
  if (!industry) return <span className="text-slate-400 text-xs">—</span>;
  return (
    <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700">
      {industry}
    </span>
  );
}

export default function AdminCompaniesPage() {
  const { role } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filterIndustry, setFilterIndustry] = useState("all");
  const [companyCreatePopup, setCompanyCreatePopup] = useState(false);
  const [viewingCompany, setViewingCompany] = useState(null);

  const isAdminOrTpo = role === "tpo" || role === "admin";

  useEffect(() => {
    if (!isAdminOrTpo) { setLoading(false); return; }
    let cancelled = false;
    axios.get("/companies/profile/list/")
      .then((r) => {
        if (cancelled) return;
        const data = Array.isArray(r.data) ? r.data : r.data.results || [];
        setCompanies(data);
      })
      .catch(() => { if (!cancelled) setCompanies([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isAdminOrTpo]);

  const industries = useMemo(() => {
    const set = new Set(companies.map(c => c.industry).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [companies]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return companies.filter((c) => {
      const matchSearch = !q ||
        (c.name || "").toLowerCase().includes(q) ||
        (c.email || c.contact_email || "").toLowerCase().includes(q) ||
        (c.industry || "").toLowerCase().includes(q);
      const matchIndustry = filterIndustry === "all" || c.industry === filterIndustry;
      return matchSearch && matchIndustry;
    });
  }, [companies, search, filterIndustry]);

  if (!isAdminOrTpo) return <div className="text-slate-500">Only TPO/Admin can view the companies list.</div>;
  if (loading) return <div className="text-slate-500">Loading companies…</div>;

  const viewCompanyDetails = async (company) => {
    // Show a basic popup immediately with available list data
    setViewingCompany(company);

    try {
      // Fetch full company details including specialities and images
      const res = await axios.get(`/companies/profile/list/`);
      const fullDataList = Array.isArray(res.data) ? res.data : res.data.results || [];
      const updatedCompany = fullDataList.find(c => c.id === company.id);
      
      if (updatedCompany) {
         setViewingCompany(updatedCompany);
         // Also update it in the list to avoid refetching
         setCompanies(prev => prev.map(c => c.id === updatedCompany.id ? updatedCompany : c));
      }
    } catch (err) {
      console.error("Failed to fetch full company details", err);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Companies</h1>
          <p className="text-slate-500 text-sm">All companies registered with the placement portal.</p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-600">
            {companies.length} total
          </span>

        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <CompanyCreatePage
        isOpen={companyCreatePopup}
        onClose={() => setCompanyCreatePopup(false)}
        />
        <div className="relative flex-1 min-w-48">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, industry…"
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <MdClose className="text-sm" />
            </button>
          )}
        </div>
          <button onClick={() => setCompanyCreatePopup(true)} className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 text-sm">Generate Company Account</button>

        {industries.length > 1 && (
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-1 py-1 flex-wrap">
            {industries.map((ind) => (
              <button
                key={ind}
                onClick={() => setFilterIndustry(ind)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all capitalize ${filterIndustry === ind ? "bg-violet-500 text-white" : "text-slate-500 hover:bg-slate-50"}`}
              >
                {ind === "all" ? "All Industries" : ind}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-slate-700">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Industry</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <MdBusiness className="text-3xl" />
                      <span className="text-sm">No companies found{search ? ` for "${search}"` : ""}.</span>
                    </div>
                  </td>
                </tr>
              )}
              {filtered.map((c) => {
                const email = c.email || c.contact_email || null;
                const phone = c.contact_phone || null;
                const initial = (c.name || "?").charAt(0).toUpperCase();
                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-linear-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-violet-700 text-xs font-bold shrink-0">
                          {initial}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-sm leading-none mb-0.5">{c.name || "—"}</div>
                          {email && <div className="text-xs text-slate-400">{email}</div>}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <IndustryBadge industry={c.industry} />
                    </td>

                    <td className="px-4 py-3">
                      {phone
                        ? <div className="text-sm text-slate-700">{phone}</div>
                        : email
                          ? <div className="text-xs text-slate-400">{email}</div>
                          : <span className="text-slate-400 text-xs">—</span>
                      }
                    </td>

                    <td className="px-4 py-3 text-xs text-slate-500">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>

                    <td className="px-4 py-3 text-right">
                       <button
                         onClick={() => viewCompanyDetails(c)}
                         className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-lg transition-colors"
                       >
                          View Details
                       </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
            <span className="text-xs text-slate-400">Showing {filtered.length} of {companies.length} companies</span>
          </div>
        )}
      </div>

      {/* View Company Modal */}
      {viewingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-slate-800">Company Details</h2>
              <button 
                onClick={() => setViewingCompany(null)}
                className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors"
               >
                <MdClose />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-start gap-5 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-violet-600 to-indigo-800 flex items-center justify-center text-white text-2xl font-bold shadow-md shrink-0">
                  {(viewingCompany.name || "C").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 leading-tight">{viewingCompany.name}</h1>
                  <p className="text-slate-500 mt-1 flex items-center gap-2">
                    <IndustryBadge industry={viewingCompany.industry} />
                    {viewingCompany.website && (
                      <a href={viewingCompany.website} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-600 hover:underline">
                        Website ↗
                      </a>
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-3">Contact Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="block text-xs text-slate-500">Email</span>
                      <span className="text-sm text-slate-800 font-medium">{viewingCompany.contact_email || viewingCompany.email || "—"}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500">Phone</span>
                      <span className="text-sm text-slate-800 font-medium">{viewingCompany.contact_phone || "—"}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500">Address</span>
                      <span className="text-sm text-slate-800">{viewingCompany.address || "—"}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-3">Company Information</h3>
                  <div className="space-y-3">
                     <div>
                      <span className="block text-xs text-slate-500">Established Year</span>
                      <span className="text-sm text-slate-800 font-medium">{viewingCompany.established_year || "—"}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500">Specialities</span>
                      <span className="text-sm text-slate-800 whitespace-pre-wrap">{viewingCompany.specialities || "—"}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500">Description</span>
                      <span className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{viewingCompany.description || "—"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {viewingCompany.client_images && viewingCompany.client_images.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-3">Client Gallery</h3>
                  <div className="flex flex-wrap gap-4">
                    {viewingCompany.client_images.map((imgUrl, idx) => (
                      <img key={idx} src={imgUrl} alt="Client" className="w-32 h-32 rounded-xl object-cover border border-slate-200 shadow-sm" />
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}