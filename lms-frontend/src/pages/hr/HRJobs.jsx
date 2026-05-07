import { useEffect, useState } from "react";
import {
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  X,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

const JOB_TYPES = ["full-time", "part-time", "remote", "internship"];
const EMPTY_FORM = {
  title: "",
  company: "",
  company_logo: "",
  location: "",
  description: "",
  requirements: "",
  job_type: "full-time",
  salary_range: "",
  required_certificate: "",
};

export default function HRJobs() {
  const [jobs, setJobs] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [myOnly, setMyOnly] = useState(false);

  const load = () => {
    Promise.all([
      api.get(`/hr/jobs/${myOnly ? "?mine=true" : ""}`),
      api.get("/courses/"),
    ])
      .then(([j, c]) => {
        setJobs(j.data);
        setCourses(c.data);
      })
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, [myOnly]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };
  const openEdit = (job) => {
    setEditing(job.id);
    setForm({
      title: job.title,
      company: job.company,
      company_logo: job.company_logo,
      location: job.location,
      description: job.description,
      requirements: job.requirements,
      job_type: job.job_type,
      salary_range: job.salary_range,
      required_certificate: job.required_certificate || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.company || !form.location || !form.description)
      return toast.error("Fill required fields");
    setSaving(true);
    try {
      const payload = {
        ...form,
        required_certificate: form.required_certificate || null,
      };
      if (editing) {
        await api.patch(`/hr/jobs/${editing}/update/`, payload);
        toast.success("Job updated");
      } else {
        await api.post("/hr/jobs/create/", payload);
        toast.success("Job posted");
      }
      setShowModal(false);
      load();
    } catch (e) {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Deactivate this job?")) return;
    try {
      await api.delete(`/hr/jobs/${id}/delete/`);
      toast.success("Job deactivated");
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed");
    }
  };

  const typeColors = {
    "full-time": "#89b4fa",
    "part-time": "#cba6f7",
    remote: "#a6e3a1",
    internship: "#fab387",
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-[#cdd6f4]">Jobs</h1>
          <p className="text-[#9399b2] text-sm mt-1">{jobs.length} listings</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMyOnly(!myOnly)}
            className={`flex items-center gap-2 text-sm px-3 py-2 rounded-xl border transition ${myOnly ? "border-[#89dceb] text-[#89dceb] bg-[#89dceb]/10" : "border-[#313244] text-[#9399b2] hover:border-[#585b70]"}`}
          >
            {myOnly ? <ToggleRight size={16} /> : <ToggleLeft size={16} />} My
            Jobs
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-[#89dceb] text-[#11111b] px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition"
          >
            <Plus size={15} /> Post Job
          </button>
        </div>
      </div>

      <div className="space-y-3 animate-fade-in-up stagger-1">
        {jobs.map((job, i) => (
          <div
            key={job.id}
            className={`bg-[#1e1e2e] border border-[#313244] rounded-2xl p-4 hover:border-[#585b70] transition animate-fade-in-up stagger-${Math.min(i + 1, 5)}`}
          >
            <div className="flex items-center gap-4">
              <img
                src={
                  job.company_logo ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=313244&color=cdd6f4`
                }
                className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
                alt=""
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[#cdd6f4] font-semibold">{job.title}</p>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium`}
                    style={{
                      background:
                        (typeColors[job.job_type] || "#cba6f7") + "22",
                      color: typeColors[job.job_type] || "#cba6f7",
                    }}
                  >
                    {job.job_type}
                  </span>
                  {!job.is_active && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#585b70]/30 text-[#585b70]">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-[#9399b2] text-xs mt-0.5">
                  {job.company} · {job.location}
                </p>
                {job.salary_range && (
                  <p className="text-[#a6e3a1] text-xs mt-0.5">
                    {job.salary_range}
                  </p>
                )}
                {job.required_certificate_title && (
                  <p className="text-[#fab387] text-xs mt-0.5">
                    Requires: {job.required_certificate_title}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => openEdit(job)}
                  className="p-2 rounded-lg text-[#a6e3a1] hover:bg-[#a6e3a1]/20 transition"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(job.id)}
                  className="p-2 rounded-lg text-[#f38ba8] hover:bg-[#f38ba8]/20 transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {jobs.length === 0 && (
          <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl py-16 text-center">
            <Briefcase size={32} className="mx-auto mb-3 text-[#313244]" />
            <p className="text-sm text-[#9399b2]">No jobs yet. Post one!</p>
          </div>
        )}
      </div>

      {/* Job Modal */}
      {showModal && (
        <Modal
          title={editing ? "Edit Job" : "Post New Job"}
          onClose={() => setShowModal(false)}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Job Title *">
                <Input
                  value={form.title}
                  onChange={(v) => setForm({ ...form, title: v })}
                  placeholder="e.g. Frontend Developer"
                />
              </Field>
              <Field label="Company *">
                <Input
                  value={form.company}
                  onChange={(v) => setForm({ ...form, company: v })}
                  placeholder="Company name"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Location *">
                <Input
                  value={form.location}
                  onChange={(v) => setForm({ ...form, location: v })}
                  placeholder="Kathmandu, Nepal"
                />
              </Field>
              <Field label="Job Type">
                <select
                  value={form.job_type}
                  onChange={(e) =>
                    setForm({ ...form, job_type: e.target.value })
                  }
                  className={inputCls}
                >
                  {JOB_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Description *">
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                className={inputCls + " resize-none"}
                placeholder="Job description..."
              />
            </Field>
            <Field label="Requirements">
              <textarea
                value={form.requirements}
                onChange={(e) =>
                  setForm({ ...form, requirements: e.target.value })
                }
                rows={2}
                className={inputCls + " resize-none"}
                placeholder="Required skills..."
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Salary Range">
                <Input
                  value={form.salary_range}
                  onChange={(v) => setForm({ ...form, salary_range: v })}
                  placeholder="NPR 50,000 - 80,000"
                />
              </Field>
              <Field label="Required Certificate">
                <select
                  value={form.required_certificate}
                  onChange={(e) =>
                    setForm({ ...form, required_certificate: e.target.value })
                  }
                  className={inputCls}
                >
                  <option value="">None</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Company Logo URL">
              <Input
                value={form.company_logo}
                onChange={(v) => setForm({ ...form, company_logo: v })}
                placeholder="https://..."
              />
            </Field>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-[#313244] text-[#9399b2] py-2.5 rounded-xl text-sm hover:border-[#585b70] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-[#89dceb] text-[#11111b] py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
              >
                {saving ? "Saving..." : editing ? "Update" : "Post Job"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

const inputCls =
  "w-full bg-[#11111b] border border-[#313244] rounded-xl px-3 py-2.5 text-sm text-[#cdd6f4] placeholder-[#45475a] focus:outline-none focus:border-[#89dceb] transition";
function Input({ value, onChange, placeholder }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputCls}
    />
  );
}
function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs text-[#9399b2] mb-1.5 font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}
function Modal({ title, children, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#1e1e2e] border border-[#313244] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[#cdd6f4] font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#585b70] hover:text-[#cdd6f4] transition"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-4 border-[#89dceb] border-t-transparent animate-spin" />
    </div>
  );
}
