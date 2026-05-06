import { useEffect, useState } from "react";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  X,
  Check,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

const LEVELS = ["beginner", "intermediate", "advanced"];
const EMPTY_FORM = {
  title: "",
  description: "",
  thumbnail: "",
  level: "beginner",
  duration: "",
  tags: "",
  is_featured: false,
  category_id: "",
};

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [lessonModal, setLessonModal] = useState(null); // course for lesson add
  const [lessonForm, setLessonForm] = useState({
    title: "",
    youtube_url: "",
    content: "",
    order: 0,
    duration_minutes: 0,
  });

  const load = () => {
    Promise.all([api.get("/courses/"), api.get("/admin/categories/")])
      .then(([c, cat]) => {
        setCourses(c.data);
        setCategories(cat.data);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };
  const openEdit = (course) => {
    setEditing(course.id);
    setForm({
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      level: course.level,
      duration: course.duration,
      tags: Array.isArray(course.tags) ? course.tags.join(", ") : course.tags,
      is_featured: course.is_featured,
      category_id: course.category?.id || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.description)
      return toast.error("Title and description required");
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: JSON.stringify(
          form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        ),
      };
      if (editing) {
        await api.patch(`/admin/courses/${editing}/update/`, payload);
        toast.success("Course updated");
      } else {
        await api.post("/admin/courses/create/", payload);
        toast.success("Course created");
      }
      setShowModal(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.title?.[0] || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Deactivate this course?")) return;
    await api.delete(`/admin/courses/${id}/delete/`);
    toast.success("Course deactivated");
    load();
  };

  const handleAddLesson = async () => {
    try {
      await api.post(
        `/admin/courses/${lessonModal.id}/lessons/create/`,
        lessonForm,
      );
      toast.success("Lesson added");
      setLessonModal(null);
      setLessonForm({
        title: "",
        youtube_url: "",
        content: "",
        order: 0,
        duration_minutes: 0,
      });
      load();
    } catch (e) {
      toast.error("Failed to add lesson");
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-[#cdd6f4]">Courses</h1>
          <p className="text-[#9399b2] text-sm mt-1">
            {courses.length} total courses
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#f38ba8] text-[#11111b] px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition"
        >
          <Plus size={15} /> New Course
        </button>
      </div>

      {/* Course table */}
      <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl overflow-hidden animate-fade-in-up stagger-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#313244]">
              {["Course", "Level", "Lessons", "Status", "Actions"].map((h) => (
                <th
                  key={h}
                  className="text-left text-[#9399b2] font-medium px-5 py-3 text-xs"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courses.map((course, i) => (
              <tr
                key={course.id}
                className={`border-b border-[#313244]/50 hover:bg-[#313244]/30 transition animate-fade-in-up stagger-${Math.min(i + 1, 5)}`}
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#313244] flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen size={15} className="text-[#585b70]" />
                      )}
                    </div>
                    <div>
                      <p className="text-[#cdd6f4] font-medium">
                        {course.title}
                      </p>
                      {course.is_featured && (
                        <span className="text-[10px] bg-[#fab387]/20 text-[#fab387] px-1.5 py-0.5 rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <LevelBadge level={course.level} />
                </td>
                <td className="px-5 py-3 text-[#9399b2]">
                  {course.lesson_count}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`text-[11px] px-2 py-1 rounded-full font-medium ${course.is_active !== false ? "bg-[#a6e3a1]/20 text-[#a6e3a1]" : "bg-[#f38ba8]/20 text-[#f38ba8]"}`}
                  >
                    {course.is_active !== false ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setLessonModal(course)}
                      className="p-1.5 rounded-lg text-[#89b4fa] hover:bg-[#89b4fa]/20 transition"
                      title="Add Lesson"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={() => openEdit(course)}
                      className="p-1.5 rounded-lg text-[#a6e3a1] hover:bg-[#a6e3a1]/20 transition"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="p-1.5 rounded-lg text-[#f38ba8] hover:bg-[#f38ba8]/20 transition"
                      title="Deactivate"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {courses.length === 0 && (
          <div className="py-16 text-center text-[#585b70]">
            <BookOpen size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm text-[#9399b2]">
              No courses yet. Create one!
            </p>
          </div>
        )}
      </div>

      {/* Course Modal */}
      {showModal && (
        <Modal
          title={editing ? "Edit Course" : "New Course"}
          onClose={() => setShowModal(false)}
        >
          <div className="space-y-4">
            <Field label="Title">
              <Input
                value={form.title}
                onChange={(v) => setForm({ ...form, title: v })}
                placeholder="Course title"
              />
            </Field>
            <Field label="Description">
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                className={inputCls + " resize-none"}
                placeholder="Course description"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Level">
                <select
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                  className={inputCls}
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Duration">
                <Input
                  value={form.duration}
                  onChange={(v) => setForm({ ...form, duration: v })}
                  placeholder="e.g. 12 hours"
                />
              </Field>
            </div>
            <Field label="Thumbnail URL">
              <Input
                value={form.thumbnail}
                onChange={(v) => setForm({ ...form, thumbnail: v })}
                placeholder="https://i.ytimg.com/vi/VIDEO_ID/hqdefault.jpg"
              />
            </Field>
            <div className="bg-[#313244]/60 border border-[#45475a] rounded-xl p-3 text-xs text-[#9399b2] leading-relaxed">
              <p className="text-[#fab387] font-semibold mb-1">
                📌 How to get YouTube thumbnail URL:
              </p>
              <p>1. Open the YouTube video → copy its URL</p>
              <p>
                2. Find the video ID (after{" "}
                <span className="font-mono text-[#cdd6f4]">?v=</span>)
              </p>
              <p>
                3. Thumbnail:{" "}
                <span className="font-mono text-[#a6e3a1]">
                  https://i.ytimg.com/vi/VIDEO_ID/hqdefault.jpg
                </span>
              </p>
              <p className="mt-1 text-[#585b70]">
                Example for Django course: use
                djangoproject.com/s/img/logos/django-logo-negative.png
              </p>
            </div>
            <Field label="Tags (comma separated)">
              <Input
                value={form.tags}
                onChange={(v) => setForm({ ...form, tags: v })}
                placeholder="JavaScript, React, ES6"
              />
            </Field>
            <Field label="Category">
              <select
                value={form.category_id}
                onChange={(e) =>
                  setForm({ ...form, category_id: e.target.value })
                }
                className={inputCls}
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) =>
                  setForm({ ...form, is_featured: e.target.checked })
                }
                className="accent-[#f38ba8]"
              />
              <span className="text-[#9399b2] text-sm">Featured course</span>
            </label>
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
                className="flex-1 bg-[#f38ba8] text-[#11111b] py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
              >
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Lesson Modal */}
      {lessonModal && (
        <Modal
          title={`Add Lesson → ${lessonModal.title}`}
          onClose={() => setLessonModal(null)}
        >
          <div className="space-y-4">
            <Field label="Lesson Title">
              <Input
                value={lessonForm.title}
                onChange={(v) => setLessonForm({ ...lessonForm, title: v })}
                placeholder="Lesson title"
              />
            </Field>
            <Field label="YouTube Embed URL">
              <Input
                value={lessonForm.youtube_url}
                onChange={(v) =>
                  setLessonForm({ ...lessonForm, youtube_url: v })
                }
                placeholder="https://www.youtube.com/embed/..."
              />
            </Field>
            <Field label="Content / Notes">
              <textarea
                value={lessonForm.content}
                onChange={(e) =>
                  setLessonForm({ ...lessonForm, content: e.target.value })
                }
                rows={3}
                className={inputCls + " resize-none"}
                placeholder="Lesson description..."
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Order">
                <Input
                  type="number"
                  value={lessonForm.order}
                  onChange={(v) => setLessonForm({ ...lessonForm, order: +v })}
                />
              </Field>
              <Field label="Duration (min)">
                <Input
                  type="number"
                  value={lessonForm.duration_minutes}
                  onChange={(v) =>
                    setLessonForm({ ...lessonForm, duration_minutes: +v })
                  }
                />
              </Field>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setLessonModal(null)}
                className="flex-1 border border-[#313244] text-[#9399b2] py-2.5 rounded-xl text-sm hover:border-[#585b70] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLesson}
                className="flex-1 bg-[#89b4fa] text-[#11111b] py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition"
              >
                Add Lesson
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Shared helpers ──
const inputCls =
  "w-full bg-[#11111b] border border-[#313244] rounded-xl px-3 py-2.5 text-sm text-[#cdd6f4] placeholder-[#45475a] focus:outline-none focus:border-[#f38ba8] transition";

function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
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
function LevelBadge({ level }) {
  const colors = {
    beginner: "bg-[#a6e3a1]/20 text-[#a6e3a1]",
    intermediate: "bg-[#fab387]/20 text-[#fab387]",
    advanced: "bg-[#f38ba8]/20 text-[#f38ba8]",
  };
  return (
    <span
      className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${colors[level] || ""}`}
    >
      {level}
    </span>
  );
}
function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-4 border-[#f38ba8] border-t-transparent animate-spin" />
    </div>
  );
}
