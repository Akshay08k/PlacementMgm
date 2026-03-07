import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "../utils/AxiosInstance";

export default function StudentImportPage() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setResult(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const r = await axios.post("/students/import-excel/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(r.data);
    } catch (err) {
      setResult({ created: 0, errors: [{ error: err.response?.data?.error || "Upload failed." }] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Import Students (Excel)</h1>
      <p className="text-slate-500 text-sm mb-4">Upload an Excel file. Columns: email, full_name, phone, roll_number, department_id, course_id, passing_year, marks_10th, marks_12th, current_cgpa, skills</p>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <input type="file" accept=".xlsx,.xls" onChange={(e) => setFile(e.target.files?.[0])} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700" />
        <button type="submit" disabled={loading || !file} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50">Import</button>
      </form>
      {result && (
        <div className="mt-6 bg-white rounded-xl border border-slate-200 p-4">
          <p className="font-medium text-slate-800">Created: {result.created}</p>
          {result.errors?.length > 0 && (
            <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
              {result.errors.slice(0, 10).map((e, i) => (
                <li key={i}>Row {e.row}: {e.error}</li>
              ))}
              {result.errors.length > 10 && <li>… and {result.errors.length - 10} more</li>}
            </ul>
          )}
        </div>
      )}
      <Link to="/dashboard" className="inline-block mt-4 text-emerald-600 hover:underline">Back to Dashboard</Link>
    </div>
  );
}
