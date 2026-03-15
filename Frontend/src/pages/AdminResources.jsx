import { useEffect, useState } from "react";
import { FaCopy,FaPlus,FaUpload,FaLink,FaDownload,FaTrash, FaFile } from "react-icons/fa";
import axios from "../utils/AxiosInstance";
import { Link } from "react-router-dom";

export default function AdminResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isAdding, setIsAdding] = useState(false);
  const [addingType, setAddingType] = useState("link"); // 'link' or 'file'
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState("student");
  const [linkUrl, setLinkUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchResources = () => {
    setLoading(true);
    axios
      .get("/reports/resources/")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.results || [];
        setResources(data);
      })
      .catch((err) => {
        console.error("Failed to fetch resources", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    if (!title) {
      setErrorMsg("Title is required.");
      return;
    }

    setUploading(true);

    let finalLink = linkUrl;
    let resourceTypeStr = "link";

    try {
      if (addingType === "file") {
        if (!selectedFile) {
          setErrorMsg("Please select a file to upload.");
          setUploading(false);
          return;
        }
        resourceTypeStr = "pdf"; // or file depending on what we prefer
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadRes = await axios.post("/reports/resources/upload/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        
        if (uploadRes.data && uploadRes.data.url) {
          finalLink = uploadRes.data.url;
        } else {
          throw new Error("Upload response did not contain URL.");
        }
      } else {
        if (!linkUrl) {
          setErrorMsg("Please provide a link URL.");
          setUploading(false);
          return;
        }
      }

      await axios.post("/reports/resources/", {
        title,
        description,
        link: finalLink,
        resource_type: resourceTypeStr,
        audience,
      });

      setSuccessMsg("Resource successfully added.");
      setIsAdding(false);
      resetForm();
      fetchResources();

    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || err.message || "Failed to create resource.");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLinkUrl("");
    setSelectedFile(null);
    setAudience("student");
  };

  const cancelAdding = () => {
    setIsAdding(false);
    resetForm();
    setErrorMsg("");
    setSuccessMsg("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Resources</h1>
          <p className="text-slate-500 text-sm">
            Upload PDFs or share links with students and companies.
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors whitespace-nowrap"
          >
            <FaPlus className="w-4 h-4" />
            Add Resource
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-700 rounded-lg text-sm border border-emerald-100">
          {successMsg}
        </div>
      )}

      {isAdding && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Add New Resource</h2>
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
              {errorMsg}
            </div>
          )}
          
          <form onSubmit={handleCreate} className="space-y-4 max-w-2xl">
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                className={`flex-1 py-2 px-4 rounded-lg border font-medium transition text-sm flex items-center justify-center gap-2 ${addingType === "link" ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                onClick={() => setAddingType("link")}
              >
                <FaLink className="w-4 h-4" /> Direct Link
              </button>
              <button
                type="button"
                className={`flex-1 py-2 px-4 rounded-lg border font-medium transition text-sm flex items-center justify-center gap-2 ${addingType === "file" ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                onClick={() => setAddingType("file")}
              >
                <FaUpload className="w-4 h-4" /> Upload File (PDF/Docs)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Interview Prep Guide 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Audience</label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="student">Students Only</option>
                  <option value="company">Companies Only</option>
                  <option value="all">Everyone</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24"
                placeholder="Optional description..."
              />
            </div>

            {addingType === "link" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL Link *</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://..."
                />
              </div>
            )}

            {addingType === "file" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select File *</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-slate-200 rounded-lg p-2 bg-white"
                />
              </div>
            )}

            <div className="pt-4 flex gap-3">
              <button
                type="submit"
                disabled={uploading}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Resource"
                )}
              </button>
              <button
                type="button"
                onClick={cancelAdding}
                disabled={uploading}
                className="px-5 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Resources List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading resources...</div>
        ) : resources.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <FaFile className="w-12 h-12 text-slate-300 mb-3" />
            <p>No resources found.</p>
            <p className="text-sm mt-1">Click "Add Resource" to share something with students.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {resources.map((resource) => (
              <div key={resource.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl flex-shrink-0 ${resource.resource_type === 'link' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                    {resource.resource_type === 'link' ? <FaLink className="w-5 h-5" /> : <FaFile className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 line-clamp-1">{resource.title}</h3>
                    {resource.description && (
                      <p className="text-slate-500 text-sm mt-1 line-clamp-2 md:line-clamp-1">{resource.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs font-medium text-slate-500">
                      <span className="bg-slate-100 px-2 py-1 rounded-md capitalize">
                        For: {resource.audience}
                      </span>
                      <span>
                        {new Date(resource.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:self-center self-end mt-2 sm:mt-0">
                  <a
                    href={resource.link}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                    title="View Resource"
                  >
                     <FaDownload className="w-4 h-4" /> View/Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
