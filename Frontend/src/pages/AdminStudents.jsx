import { useEffect, useState, useMemo } from "react";
import axios from "../utils/AxiosInstance";
import { useAuth } from "../contexts/AuthContext";
import { MdSearch, MdClose, MdEdit, MdDelete, MdBlock, MdCheckCircle, MdFilterList } from "react-icons/md";
import { FaUserGraduate } from "react-icons/fa";

const inputCls = "w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400";

function StatusBadge({ placed }) {
  return placed
    ? <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Placed</span>
    : <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Unplaced</span>;
}

function AccountBadge({ active }) {
  return active
    ? <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">Active</span>
    : <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-500">Banned</span>;
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 w-full max-w-sm mx-4">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <MdDelete className="text-red-500 text-xl" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800 mb-1">Are you sure?</h3>
        <p className="text-sm text-slate-500 mb-5">{message}</p>
        <div className="flex gap-2">
          <button onClick={onConfirm} className="flex-1 bg-red-500 text-white text-sm font-medium py-2 rounded-lg hover:bg-red-600 transition-colors">Delete</button>
          <button onClick={onCancel} className="flex-1 border border-slate-200 text-slate-700 text-sm font-medium py-2 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function EditPanel({ student, form, onChange, onSubmit, onCancel, saving }) {
  return (
    <div className="mb-5 bg-white border border-amber-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-amber-50 border-b border-amber-100">
        <div className="flex items-center gap-2">
          <MdEdit className="text-amber-600" />
          <span className="text-sm font-semibold text-slate-800">Editing — {student.full_name}</span>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-white transition-colors">
          <MdClose />
        </button>
      </div>
      <form onSubmit={onSubmit} className="p-5 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
            <input name="full_name" value={form.full_name} onChange={onChange} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Enrollment No.</label>
            <input name="enrollment_number" value={form.enrollment_number} onChange={onChange} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Roll No.</label>
            <input name="roll_number" value={form.roll_number} onChange={onChange} className={inputCls} />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Passing Year</label>
            <input name="passing_year" type="number" value={form.passing_year} onChange={onChange} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">10th %</label>
            <input name="marks_10th" type="number" step="0.01" value={form.marks_10th} onChange={onChange} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">12th %</label>
            <input name="marks_12th" type="number" step="0.01" value={form.marks_12th} onChange={onChange} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">CGPA</label>
            <input name="current_cgpa" type="number" step="0.01" value={form.current_cgpa} onChange={onChange} className={inputCls} />
          </div>
        </div>
        <div className="w-48">
          <label className="block text-xs font-medium text-slate-600 mb-1">Placement Status</label>
          <select name="placement_status" value={form.placement_status} onChange={onChange} className={inputCls}>
            <option value="unplaced">Unplaced</option>
            <option value="placed">Placed</option>
          </select>
        </div>
        <div className="flex gap-2 pt-1">
          <button type="submit" disabled={saving} className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors">
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AdminStudentsPage() {
  const { role } = useAuth();
  const [students, setStudents]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState(null);
  const [editForm, setEditForm]   = useState({});
  const [saving, setSaving]       = useState(false);
  const [search, setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all | placed | unplaced
  const [filterAccount, setFilterAccount] = useState("all"); // all | active | banned
  const [confirm, setConfirm]     = useState(null); // { student }

  const isAdminOrTpo = role === "tpo" || role === "admin";

  useEffect(() => {
    if (!isAdminOrTpo) { setLoading(false); return; }
    let cancelled = false;
    axios.get("/students/")
      .then((r) => {
        if (cancelled) return;
        const data = Array.isArray(r.data) ? r.data : r.data.results || [];
        setStudents(data);
      })
      .catch(() => { if (!cancelled) setStudents([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isAdminOrTpo]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return students.filter((s) => {
      const matchSearch = !q ||
        (s.full_name || "").toLowerCase().includes(q) ||
        (s.email || "").toLowerCase().includes(q) ||
        (s.roll_number || "").toLowerCase().includes(q) ||
        (s.department_name || "").toLowerCase().includes(q);
      const matchStatus = filterStatus === "all" || (s.placement_status || "unplaced") === filterStatus;
      const matchAccount = filterAccount === "all" ||
        (filterAccount === "active" ? s.is_active : !s.is_active);
      return matchSearch && matchStatus && matchAccount;
    });
  }, [students, search, filterStatus, filterAccount]);

  if (!isAdminOrTpo) return <div className="text-slate-500">Only TPO/Admin can view the students list.</div>;
  if (loading) return <div className="text-slate-500">Loading students…</div>;

  const handleBanToggle = async (student) => {
    const banned = !!student.is_active;
    try {
      const res = await axios.post(`/students/${student.id}/ban/`, { banned });
      setStudents((prev) => prev.map((s) => s.id === student.id ? { ...s, is_active: res.data.is_active } : s));
    } catch (_) {}
  };

  const handleDelete = async (student) => {
    try {
      await axios.delete(`/students/${student.id}/`);
      setStudents((prev) => prev.filter((s) => s.id !== student.id));
      if (editing?.id === student.id) { setEditing(null); setEditForm({}); }
    } catch (_) {}
    setConfirm(null);
  };

  const startEdit = (student) => {
    setEditing(student);
    setEditForm({
      full_name: student.full_name || "",
      enrollment_number: student.enrollment_number || "",
      roll_number: student.roll_number || "",
      passing_year: student.passing_year || "",
      marks_10th: student.marks_10th || "",
      marks_12th: student.marks_12th || "",
      current_cgpa: student.current_cgpa || "",
      placement_status: student.placement_status || "unplaced",
    });
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        ...editForm,
        passing_year: editForm.passing_year ? parseInt(editForm.passing_year, 10) : null,
        marks_10th: editForm.marks_10th || null,
        marks_12th: editForm.marks_12th || null,
        current_cgpa: editForm.current_cgpa || null,
      };
      const res = await axios.patch(`/students/${editing.id}/`, payload);
      setStudents((prev) => prev.map((s) => s.id === editing.id ? { ...s, ...res.data } : s));
      setEditing(null);
      setEditForm({});
    } catch (_) {}
    finally { setSaving(false); }
  };

  const placedCount = students.filter(s => s.placement_status === "placed").length;
  const activeCount = students.filter(s => s.is_active).length;

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Students</h1>
          <p className="text-slate-500 text-sm">Manage academic details, placement status and account access.</p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-600">{students.length} total</span>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700">{placedCount} placed</span>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-600">{activeCount} active</span>
        </div>
      </div>

      {editing && (
        <EditPanel
          student={editing}
          form={editForm}
          onChange={handleEditChange}
          onSubmit={submitEdit}
          onCancel={() => { setEditing(null); setEditForm({}); }}
          saving={saving}
        />
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-48">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, roll no, dept…"
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <MdClose className="text-sm" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-1 py-1">
          {[["all", "All Status"], ["placed", "Placed"], ["unplaced", "Unplaced"]].map(([val, lbl]) => (
            <button
              key={val}
              onClick={() => setFilterStatus(val)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${filterStatus === val ? "bg-emerald-500 text-white" : "text-slate-500 hover:bg-slate-50"}`}
            >
              {lbl}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-1 py-1">
          {[["all", "All"], ["active", "Active"], ["banned", "Banned"]].map(([val, lbl]) => (
            <button
              key={val}
              onClick={() => setFilterAccount(val)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${filterAccount === val ? "bg-slate-700 text-white" : "text-slate-500 hover:bg-slate-50"}`}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-slate-700">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Roll / Enroll</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Dept / Course</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Year</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">CGPA</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Placement</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Account</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <FaUserGraduate className="text-3xl" />
                      <span className="text-sm">No students found{search ? ` for "${search}"` : ""}.</span>
                    </div>
                  </td>
                </tr>
              )}
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  className={`hover:bg-slate-50 transition-colors ${editing?.id === s.id ? "bg-amber-50/40" : ""}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-700 text-xs font-bold shrink-0">
                        {(s.full_name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 text-sm leading-none mb-0.5">{s.full_name || "—"}</div>
                        <div className="text-xs text-slate-400">{s.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-xs text-slate-700 font-medium">{s.roll_number || "—"}</div>
                    <div className="text-xs text-slate-400">{s.enrollment_number || "—"}</div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-xs font-medium text-slate-700">{s.department_name || "—"}</div>
                    <div className="text-xs text-slate-400">{s.course_name || "—"}</div>
                  </td>

                  <td className="px-4 py-3 text-sm text-slate-600">{s.passing_year || "—"}</td>

                  <td className="px-4 py-3">
                    {s.current_cgpa
                      ? <span className="text-sm font-semibold text-slate-800">{s.current_cgpa}</span>
                      : <span className="text-slate-400 text-sm">—</span>}
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge placed={s.placement_status === "placed"} />
                  </td>

                  <td className="px-4 py-3">
                    <AccountBadge active={s.is_active} />
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(s)}
                        title="Edit"
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                      >
                        <MdEdit className="text-base" />
                      </button>
                      <button
                        onClick={() => handleBanToggle(s)}
                        title={s.is_active ? "Ban" : "Unban"}
                        className={`p-1.5 rounded-lg transition-colors ${s.is_active ? "text-slate-400 hover:bg-amber-50 hover:text-amber-600" : "text-slate-400 hover:bg-blue-50 hover:text-blue-600"}`}
                      >
                        {s.is_active ? <MdBlock className="text-base" /> : <MdCheckCircle className="text-base" />}
                      </button>
                      <button
                        onClick={() => setConfirm({ student: s })}
                        title="Delete"
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      >
                        <MdDelete className="text-base" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
            <span className="text-xs text-slate-400">
              Showing {filtered.length} of {students.length} students
            </span>
          </div>
        )}
      </div>

      {confirm && (
        <ConfirmDialog
          message={`This will permanently delete ${confirm.student.full_name}. This action cannot be undone.`}
          onConfirm={() => handleDelete(confirm.student)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}