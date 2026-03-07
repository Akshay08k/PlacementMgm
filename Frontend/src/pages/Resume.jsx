import { useEffect, useState } from "react";
import axios from "../utils/AxiosInstance";
import { useAuth } from "../contexts/AuthContext";


function ClassicPreview() {
  return (
    <div className="w-full h-full bg-white p-3 font-serif text-[5px] leading-tight overflow-hidden rounded">
      <div className="border-b-2 border-slate-800 pb-1 mb-1">
        <div className="text-[7px] font-bold text-slate-800 text-center">JOHN DOE</div>
        <div className="text-center text-slate-500">Ahmedabad · 9876543210 · john@email.com</div>
      </div>
      <div className="mb-1">
        <div className="text-[6px] font-bold text-slate-800 uppercase tracking-widest border-b border-slate-300 mb-0.5">Education</div>
        <div className="text-slate-600">B.Tech Computer Science — LJ University · CGPA 8.5</div>
        <div className="text-slate-400">12th: 89% · 10th: 92%</div>
      </div>
      <div className="mb-1">
        <div className="text-[6px] font-bold text-slate-800 uppercase tracking-widest border-b border-slate-300 mb-0.5">Skills</div>
        <div className="text-slate-600">React · Node.js · Python · SQL · Git</div>
      </div>
      <div>
        <div className="text-[6px] font-bold text-slate-800 uppercase tracking-widest border-b border-slate-300 mb-0.5">Experience</div>
        <div className="text-slate-600">Intern — XYZ Corp (2023) · Built REST APIs</div>
      </div>
    </div>
  );
}

function ModernPreview() {
  return (
    <div className="w-full h-full flex overflow-hidden rounded text-[5px] leading-tight">
      <div className="w-1/3 bg-emerald-700 text-white p-2 flex flex-col gap-1">
        <div className="w-8 h-8 rounded-full bg-emerald-400 mx-auto mb-1 flex items-center justify-center text-[8px] font-bold">JD</div>
        <div className="text-[6px] font-bold text-center">JOHN DOE</div>
        <div className="text-emerald-200 text-center">Engineer</div>
        <div className="mt-1 border-t border-emerald-600 pt-1">
          <div className="text-[5.5px] font-bold text-emerald-300 uppercase mb-0.5">Contact</div>
          <div className="text-emerald-100">9876543210</div>
          <div className="text-emerald-100">john@email.com</div>
          <div className="text-emerald-100">Ahmedabad</div>
        </div>
        <div className="mt-1 border-t border-emerald-600 pt-1">
          <div className="text-[5.5px] font-bold text-emerald-300 uppercase mb-0.5">Skills</div>
          {["React", "Node.js", "Python"].map(s => (
            <div key={s} className="mb-0.5">
              <div className="text-emerald-100 mb-0.5">{s}</div>
              <div className="h-0.5 bg-emerald-900 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-300 rounded-full" style={{ width: "75%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 bg-white p-2">
        <div className="mb-1">
          <div className="text-[6px] font-bold text-emerald-700 uppercase tracking-wider border-b border-emerald-100 mb-0.5">Education</div>
          <div className="text-slate-700 font-semibold">B.Tech CS — LJ University</div>
          <div className="text-slate-500">CGPA: 8.5 · 2024</div>
        </div>
        <div className="mb-1">
          <div className="text-[6px] font-bold text-emerald-700 uppercase tracking-wider border-b border-emerald-100 mb-0.5">Experience</div>
          <div className="text-slate-700 font-semibold">Intern — XYZ Corp</div>
          <div className="text-slate-500">Built REST APIs in Node.js</div>
        </div>
        <div>
          <div className="text-[6px] font-bold text-emerald-700 uppercase tracking-wider border-b border-emerald-100 mb-0.5">Projects</div>
          <div className="text-slate-700 font-semibold">E-commerce App</div>
          <div className="text-slate-500">React · Redux · Stripe</div>
        </div>
      </div>
    </div>
  );
}

function MinimalPreview() {
  return (
    <div className="w-full h-full bg-white p-3 text-[5px] leading-tight overflow-hidden rounded">
      <div className="flex items-end justify-between border-b border-slate-200 pb-1 mb-1.5">
        <div>
          <div className="text-[8px] font-black text-slate-900 tracking-tight">John Doe</div>
          <div className="text-slate-400">B.Tech Computer Science</div>
        </div>
        <div className="text-right text-slate-400">
          <div>john@email.com</div>
          <div>9876543210</div>
        </div>
      </div>
      <div className="mb-1.5">
        <div className="text-[6px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Education</div>
        <div className="flex justify-between">
          <span className="text-slate-700 font-semibold">LJ University</span>
          <span className="text-slate-400">8.5 CGPA</span>
        </div>
        <div className="text-slate-400">12th: 89% · 10th: 92%</div>
      </div>
      <div className="mb-1.5">
        <div className="text-[6px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Skills</div>
        <div className="flex flex-wrap gap-0.5">
          {["React", "Node.js", "Python", "SQL", "Git"].map(s => (
            <span key={s} className="bg-slate-100 text-slate-600 px-1 py-0.5 rounded">{s}</span>
          ))}
        </div>
      </div>
      <div>
        <div className="text-[6px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Experience</div>
        <div className="flex justify-between">
          <span className="text-slate-700 font-semibold">XYZ Corp · Intern</span>
          <span className="text-slate-400">2023</span>
        </div>
        <div className="text-slate-400">Developed REST APIs using Node.js</div>
      </div>
    </div>
  );
}

function ExecutivePreview() {
  return (
    <div className="w-full h-full bg-slate-900 text-white p-3 text-[5px] leading-tight overflow-hidden rounded">
      <div className="border-b border-slate-600 pb-1.5 mb-1.5">
        <div className="text-[8px] font-black tracking-widest uppercase text-white">John Doe</div>
        <div className="text-slate-400 uppercase tracking-widest text-[5px]">Senior Software Engineer</div>
        <div className="flex gap-2 mt-0.5 text-slate-400">
          <span>john@email.com</span><span>·</span><span>9876543210</span><span>·</span><span>Ahmedabad</span>
        </div>
      </div>
      <div className="mb-1.5">
        <div className="text-[5.5px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Education</div>
        <div className="text-white font-semibold">B.Tech Computer Science</div>
        <div className="text-slate-400">LJ University · CGPA 8.5 · 2024</div>
      </div>
      <div className="mb-1.5">
        <div className="text-[5.5px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Core Skills</div>
        <div className="flex flex-wrap gap-0.5">
          {["React", "Node.js", "Python", "AWS"].map(s => (
            <span key={s} className="border border-slate-600 text-slate-300 px-1 py-0.5 rounded">{s}</span>
          ))}
        </div>
      </div>
      <div>
        <div className="text-[5.5px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Experience</div>
        <div className="text-white font-semibold">Intern — XYZ Corp · 2023</div>
        <div className="text-slate-400">Built and deployed REST APIs in Node.js</div>
      </div>
    </div>
  );
}

const TEMPLATES = [
  {
    id: "classic",
    name: "Classic",
    desc: "Traditional layout with clean sections",
    Preview: ClassicPreview,
  },
  {
    id: "modern",
    name: "Modern",
    desc: "Sidebar design with skill bars",
    Preview: ModernPreview,
  },
  {
    id: "minimal",
    name: "Minimal",
    desc: "Clean typography, lots of whitespace",
    Preview: MinimalPreview,
  },
  {
    id: "executive",
    name: "Executive",
    desc: "Dark theme, bold and professional",
    Preview: ExecutivePreview,
  },
];

function Steps({ current }) {
  const steps = ["Choose Template", "Fill Details", "Download"];
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors
            ${i < current ? "bg-emerald-600 text-white" : i === current ? "bg-emerald-600 text-white ring-4 ring-emerald-100" : "bg-slate-100 text-slate-400"}`}>
            {i < current ? "✓" : i + 1}
          </div>
          <span className={`text-sm ${i === current ? "font-semibold text-slate-800" : "text-slate-400"}`}>{s}</span>
          {i < steps.length - 1 && <div className={`w-8 h-px ${i < current ? "bg-emerald-600" : "bg-slate-200"}`} />}
        </div>
      ))}
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400";
const readonlyCls = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50 text-slate-500";

export default function ResumePage() {
  const { role } = useAuth();
  const [step, setStep] = useState(0); // 0 = pick template, 1 = form, 2 = download
  const [template, setTemplate] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [form, setForm] = useState({
    full_name: "", enrollment_number: "", roll_number: "", phone: "",
    location: "", date_of_birth: "", gender: "", current_address: "",
    permanent_address: "", passing_year: "", marks_10th: "", marks_12th: "",
    current_cgpa: "", skills: "", education_history: "",
  });

  if (role !== "student") {
    return <div className="text-slate-500">Only students can access resume tools.</div>;
  }

  useEffect(() => {
    axios.get("/students/me/")
      .then((r) => {
        const data = r.data || {};
        setForm((prev) => ({ ...prev, ...data, date_of_birth: data.date_of_birth || "" }));
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const notify = (text, type = "info") => setMessage({ text, type });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });
    try {
      await axios.patch("/students/me/", form);
      notify("Details saved successfully!", "success");
      setStep(2);
    } catch (_) {
      notify("Failed to save details.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage({ text: "", type: "" });
    const fd = new FormData();
    fd.append("file", file);
    try {
      await axios.post("/students/upload-resume/", fd, { headers: { "Content-Type": "multipart/form-data" } });
      notify("Resume uploaded and linked to your profile.", "success");
    } catch (err) {
      notify(err.response?.data?.error || "Upload failed.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleGeneratePdf = () => {
    setGenerating(true);
    setMessage({ text: "", type: "" });
    axios.get(`/students/generate-resume-pdf/?template=${encodeURIComponent(template)}`, { responseType: "blob" })
      .then((r) => {
        const url = window.URL.createObjectURL(r.data);
        const a = document.createElement("a");
        a.href = url;
        a.download = "resume.pdf";
        a.click();
        window.URL.revokeObjectURL(url);
        notify("Resume downloaded!", "success");
      })
      .catch(() => notify("Failed to generate PDF.", "error"))
      .finally(() => setGenerating(false));
  };

  const selectedTpl = TEMPLATES.find(t => t.id === template);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Resume Builder</h1>
        <p className="text-slate-500 text-sm">Pick a template, fill in your details, and download a polished PDF.</p>
      </div>

      <Steps current={step} />
      {step === 0 && (
        <div className="max-w-4xl">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Select a template to get started</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTemplate(t.id)}
                className={`group text-left rounded-xl border-2 overflow-hidden transition-all duration-200 hover:shadow-md focus:outline-none
                  ${template === t.id ? "border-emerald-500 shadow-md shadow-emerald-100" : "border-slate-200 hover:border-emerald-300"}`}
              >
                <div className="h-44 bg-slate-50 relative overflow-hidden">
                  <t.Preview />
                  {template === t.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                  )}
                </div>
                <div className="p-3 bg-white">
                  <div className="text-sm font-semibold text-slate-800">{t.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{t.desc}</div>
                </div>
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={!template}
            onClick={() => setStep(1)}
            className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium"
          >
            Continue with {selectedTpl ? selectedTpl.name : "a template"} →
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="max-w-3xl space-y-6">
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-14 rounded overflow-hidden border border-emerald-200 shrink-0">
                {selectedTpl && <selectedTpl.Preview />}
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">{selectedTpl?.name} template selected</div>
                <div className="text-xs text-slate-500">{selectedTpl?.desc}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStep(0)}
              className="text-xs text-emerald-700 hover:underline font-medium shrink-0"
            >
              Change
            </button>
          </div>

          <form onSubmit={handleSaveProfile} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <div>
              <h2 className="font-semibold text-slate-800">Personal Information</h2>
              <p className="text-slate-500 text-xs mt-0.5">This data is saved to your profile and used to generate your resume.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Full Name">
                <input name="full_name" value={form.full_name || ""} onChange={handleChange} className={inputCls} />
              </Field>
              <Field label="Enrollment Number">
                <input name="enrollment_number" value={form.enrollment_number || ""} onChange={handleChange} className={inputCls} />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Field label="Roll No.">
                <input name="roll_number" value={form.roll_number || ""} readOnly className={readonlyCls} />
              </Field>
              <Field label="Contact Number">
                <input name="phone" value={form.phone || ""} onChange={handleChange} className={inputCls} />
              </Field>
              <Field label="Location (City)">
                <input name="location" value={form.location || ""} onChange={handleChange} className={inputCls} />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Field label="Date of Birth">
                <input type="date" name="date_of_birth" value={form.date_of_birth || ""} onChange={handleChange} className={inputCls} />
              </Field>
              <Field label="Gender">
                <select name="gender" value={form.gender || ""} onChange={handleChange} className={inputCls}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Current Address">
                <textarea name="current_address" value={form.current_address || ""} onChange={handleChange} rows={2} className={inputCls} />
              </Field>
              <Field label="Permanent Address">
                <textarea name="permanent_address" value={form.permanent_address || ""} onChange={handleChange} rows={2} className={inputCls} />
              </Field>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Academic Details</h3>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Passing Year">
                  <input type="number" name="passing_year" value={form.passing_year || ""} onChange={handleChange} className={inputCls} />
                </Field>
                <Field label="10th %">
                  <input type="number" step="0.01" name="marks_10th" value={form.marks_10th || ""} onChange={handleChange} className={inputCls} />
                </Field>
                <Field label="12th %">
                  <input type="number" step="0.01" name="marks_12th" value={form.marks_12th || ""} onChange={handleChange} className={inputCls} />
                </Field>
              </div>
              <div className="mt-4 w-1/3">
                <Field label="Current CGPA">
                  <input type="number" step="0.01" name="current_cgpa" value={form.current_cgpa || ""} onChange={handleChange} className={inputCls} />
                </Field>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-4">
              <h3 className="text-sm font-semibold text-slate-700">Skills & Experience</h3>
              <Field label="Skills" hint="Comma or newline separated — e.g. React, Node.js, Python">
                <textarea name="skills" value={form.skills || ""} onChange={handleChange} rows={2} className={inputCls} placeholder="React, Node.js, Python, SQL…" />
              </Field>
              <Field label="Past Education / Projects / Internships" hint="Each entry on a new line works well">
                <textarea name="education_history" value={form.education_history || ""} onChange={handleChange} rows={4} className={inputCls} placeholder="e.g. Intern at XYZ Corp (2023) — Built REST APIs in Node.js" />
              </Field>
            </div>

            {message.text && (
              <div className={`text-sm px-3 py-2 rounded-lg ${message.type === "success" ? "bg-emerald-50 text-emerald-700" : message.type === "error" ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-600"}`}>
                {message.text}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setStep(0)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm">← Back</button>
              <button type="submit" disabled={saving} className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 text-sm font-medium">
                {saving ? "Saving…" : "Save & Continue →"}
              </button>
            </div>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-2xl space-y-4">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-5 py-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm">✓</div>
            <div>
              <div className="text-sm font-semibold text-slate-800">Details saved</div>
              <div className="text-xs text-slate-500">Your profile is up to date. Generate your PDF below.</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Generate PDF Resume</h2>

            <div className="mb-5">
              <p className="text-xs text-slate-500 mb-3">Template — <button type="button" onClick={() => setStep(0)} className="text-emerald-600 hover:underline">change</button></p>
              <div className="grid grid-cols-4 gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemplate(t.id)}
                    className={`rounded-lg border-2 overflow-hidden transition-all focus:outline-none
                      ${template === t.id ? "border-emerald-500" : "border-slate-200 hover:border-emerald-300"}`}
                  >
                    <div className="h-24 relative overflow-hidden bg-slate-50">
                      <t.Preview />
                      {template === t.id && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[9px]">✓</div>
                      )}
                    </div>
                    <div className="py-1 px-1.5 bg-white text-center">
                      <span className={`text-xs font-medium ${template === t.id ? "text-emerald-700" : "text-slate-600"}`}>{t.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {message.text && (
              <div className={`text-sm px-3 py-2 rounded-lg mb-4 ${message.type === "success" ? "bg-emerald-50 text-emerald-700" : message.type === "error" ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-600"}`}>
                {message.text}
              </div>
            )}

            <div className="flex gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleGeneratePdf}
                disabled={!template || generating}
                className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2"
              >
                {generating ? (
                  <><span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating…</>
                ) : (
                  "↓ Download PDF"
                )}
              </button>
              <button type="button" onClick={() => setStep(1)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm">Edit Details</button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-800 mb-1">Or Upload Your Own Resume</h2>
            <p className="text-slate-500 text-sm mb-3">PDF or Word document. Stored and linked to your profile.</p>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFile}
              disabled={uploading}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700 file:text-sm file:font-medium hover:file:bg-emerald-100"
            />
            {uploading && <p className="text-sm mt-2 text-slate-500">Uploading…</p>}
          </div>
        </div>
      )}
    </div>
  );
}