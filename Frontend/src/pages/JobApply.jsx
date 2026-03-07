import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../utils/AxiosInstance";

export default function JobApplyPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleApply = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.post("/applications/apply/", { job: parseInt(id, 10) });
      navigate("/applications");
    } catch (err) {
      setError(err.response?.data?.job?.[0] || err.response?.data?.detail || "Could not apply.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Apply to Job</h1>
      <p className="text-slate-600 mb-4">You are about to apply for this job. Placed students cannot apply.</p>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="flex gap-3">
        <button onClick={handleApply} disabled={loading} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50">Confirm Apply</button>
        <button onClick={() => navigate("/jobs")} className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-300">Cancel</button>
      </div>
    </div>
  );
}
