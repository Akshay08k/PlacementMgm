import { useEffect, useState } from "react";
import axios from "../utils/AxiosInstance";

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
            className="block bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition"
          >
            <h3 className="font-semibold text-slate-800">{item.title}</h3>
            {item.description && (
              <p className="text-slate-500 text-sm mt-1">{item.description}</p>
            )}
            <p className="text-xs text-emerald-700 mt-2">Open resource</p>
          </a>
        ))}
      </div>
    </div>
  );
}

