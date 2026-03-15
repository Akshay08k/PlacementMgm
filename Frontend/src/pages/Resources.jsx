import { useEffect, useState } from "react";
import axios from "../utils/AxiosInstance";
import {FaLink, FaFilePdf, FaFileAlt, FaFileExport, FaDownload} from 'react-icons/fa';  

export default function ResourcesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    axios
      .get("/reports/resources/")
      .then((r) => {
        if (!cancelled) {
          const data = Array.isArray(r.data) ? r.data : r.data.results || [];
          setItems(data);
        }
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div className="text-slate-500">Loading resources…</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Interview Resources</h1>
      <p className="text-slate-500 text-sm mb-4">
        These links and PDFs are shared by your TPO / Admin to help you prepare for placements.
      </p>
      <div className="space-y-3">
        {items.length === 0 && (
          <p className="text-slate-500 text-sm">No resources have been shared yet.</p>
        )}
        {items.map((item) => (
          <a
            key={item.id}
            href={item.link}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-4 bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition cursor-pointer"
          >
            <div className={`p-3 rounded-xl flex-shrink-0 ${item.resource_type === 'link' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
              {item.resource_type === 'link' ? <FaLink className="w-6 h-6" /> : <FaFileExport className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800">{item.title}</h3>
              {item.description && (
                <p className="text-slate-500 text-sm mt-1">{item.description}</p>
              )}
            </div>
            <div className="text-slate-400 p-2 hover:bg-slate-50 hover:text-indigo-600 rounded-lg">
                <FaDownload className="w-5 h-5" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

