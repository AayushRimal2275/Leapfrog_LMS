import { useEffect, useState } from "react";
import { Tag, Plus, Trash2, X } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function AdminCategories() {
  const [cats, setCats] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    api
      .get("/admin/categories/")
      .then((r) => setCats(r.data))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return toast.error("Enter a category name");
    setSaving(true);
    try {
      await api.post("/admin/categories/create/", { name: name.trim() });
      toast.success("Category created");
      setName("");
      load();
    } catch (e) {
      toast.error(e.response?.data?.name?.[0] || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this category? Courses in it won't be deleted."))
      return;
    await api.delete(`/admin/categories/${id}/delete/`);
    toast.success("Deleted");
    load();
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6 animate-fade-in max-w-lg">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-[#cdd6f4]">Categories</h1>
        <p className="text-[#9399b2] text-sm mt-1">
          Organise courses into categories
        </p>
        <div className="mt-3 bg-[#313244]/40 border border-[#313244] rounded-xl px-4 py-3 text-xs text-[#9399b2] leading-relaxed">
          💡 <strong className="text-[#cdd6f4]">What are categories?</strong>{" "}
          They group courses by topic (e.g. "Web Development", "Data Science",
          "Design"). When creating a course, you pick a category so learners can
          filter and find relevant content easily.
        </div>
      </div>

      {/* Create */}
      <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl p-5 animate-fade-in-up stagger-1">
        <h2 className="text-[#cdd6f4] font-semibold text-sm mb-4">
          New Category
        </h2>
        <div className="flex gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="e.g. Programming"
            className="flex-1 bg-[#11111b] border border-[#313244] rounded-xl px-3 py-2.5 text-sm text-[#cdd6f4] placeholder-[#45475a] focus:outline-none focus:border-[#f38ba8] transition"
          />
          <button
            onClick={handleCreate}
            disabled={saving}
            className="flex items-center gap-2 bg-[#f38ba8] text-[#11111b] px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl overflow-hidden animate-fade-in-up stagger-2">
        {cats.map((cat, i) => (
          <div
            key={cat.id}
            className={`flex items-center justify-between px-5 py-3.5 hover:bg-[#313244]/30 transition ${i < cats.length - 1 ? "border-b border-[#313244]/50" : ""}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#f38ba8]/20 flex items-center justify-center">
                <Tag size={13} className="text-[#f38ba8]" />
              </div>
              <p className="text-[#cdd6f4] text-sm font-medium">{cat.name}</p>
            </div>
            <button
              onClick={() => handleDelete(cat.id)}
              className="p-1.5 rounded-lg text-[#f38ba8] hover:bg-[#f38ba8]/20 transition"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {cats.length === 0 && (
          <div className="py-12 text-center">
            <Tag size={28} className="mx-auto mb-3 text-[#313244]" />
            <p className="text-sm text-[#9399b2]">No categories yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-4 border-[#f38ba8] border-t-transparent animate-spin" />
    </div>
  );
}
