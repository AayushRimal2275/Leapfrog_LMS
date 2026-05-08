import { useEffect, useState } from "react";
import {
  Calendar,
  Plus,
  Pencil,
  Trash2,
  Users,
  MapPin,
  Clock,
  X,
  ChevronDown,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

const TYPE_COLORS = {
  hackathon: "text-[#f38ba8] bg-[#f38ba8]/15",
  workshop: "text-[#fab387] bg-[#fab387]/15",
  webinar: "text-[#89b4fa] bg-[#89b4fa]/15",
  bootcamp: "text-[#cba6f7] bg-[#cba6f7]/15",
};

const EMPTY = {
  title: "",
  description: "",
  event_type: "workshop",
  status: "upcoming",
  start_date: "",
  end_date: "",
  location: "Online",
  max_participants: 100,
  registration_fee: 0,
  is_free: true,
  thumbnail: "",
};

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | 'edit' | 'regs'
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [regs, setRegs] = useState([]);
  const [selEvent, setSelEvent] = useState(null);

  const load = () => {
    api
      .get("/admin/events/")
      .then((r) => setEvents(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);

  const set = (k) => (e) =>
    setForm((f) => ({
      ...f,
      [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const openCreate = () => {
    setForm(EMPTY);
    setEditId(null);
    setModal("create");
  };
  const openEdit = (ev) => {
    setForm({
      ...ev,
      start_date: ev.start_date?.slice(0, 16),
      end_date: ev.end_date?.slice(0, 16),
    });
    setEditId(ev.id);
    setModal("edit");
  };

  const openRegs = async (ev) => {
    setSelEvent(ev);
    try {
      const r = await api.get(`/admin/events/${ev.id}/registrations/`);
      setRegs(r.data);
    } catch {
      setRegs([]);
    }
    setModal("regs");
  };

  const handleSave = async () => {
    if (!form.title || !form.start_date || !form.end_date)
      return toast.error("Title, start and end date required");
    setSaving(true);
    let success = false;
    try {
      if (editId) {
        await api.put(`/admin/events/${editId}/update/`, form);
        toast.success("Event updated");
      } else {
        await api.post("/admin/events/create/", form);
        toast.success("Event created & customers notified!");
      }
      success = true;
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to save event");
    } finally {
      setSaving(false);
    }
    if (success) {
      setModal(null);
      load();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this event?")) return;
    try {
      await api.delete(`/admin/events/${id}/delete/`);
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleRegStatus = async (regId, status) => {
    try {
      await api.patch(`/admin/events/registrations/${regId}/update/`, {
        status,
      });
      toast.success("Updated");
      const r = await api.get(`/admin/events/${selEvent.id}/registrations/`);
      setRegs(r.data);
    } catch {
      toast.error("Failed to update");
    }
  };

  const inputCls =
    "w-full bg-[#313244] border border-[#45475a] rounded-xl px-3.5 py-2.5 text-sm text-[#cdd6f4] placeholder-[#45475a] focus:outline-none focus:border-[#a6e3a1] transition";

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-4 border-[#a6e3a1] border-t-transparent animate-spin" />
      </div>
    );

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#cdd6f4]">Events</h1>
          <p className="text-[#9399b2] text-sm mt-1">
            Manage hackathons, workshops & more
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#a6e3a1] text-[#11111b] px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition"
        >
          <Plus size={15} /> Create Event
        </button>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((e) => (
          <div
            key={e.id}
            className="bg-[#1e1e2e] border border-[#313244] rounded-2xl overflow-hidden"
          >
            {e.thumbnail ? (
              <img
                src={e.thumbnail}
                className="w-full h-32 object-cover"
                alt=""
              />
            ) : (
              <div className="w-full h-32 bg-[#313244]/50 flex items-center justify-center">
                <Calendar size={24} className="text-[#585b70]" />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${TYPE_COLORS[e.event_type] || "text-[#9399b2] bg-[#313244]"}`}
                >
                  {e.event_type}
                </span>
                <span className="text-[10px] text-[#a0a8e4] capitalize">
                  {e.status}
                </span>
              </div>
              <h3 className="text-[#cdd6f4] font-semibold text-sm mb-2 truncate">
                {e.title}
              </h3>
              <div className="space-y-1 mb-3">
                <p className="text-[#acadb1] text-xs flex items-center gap-1">
                  <Clock size={10} />
                  {new Date(e.start_date).toLocaleDateString()}
                </p>
                <p className="text-[#acadb1] text-xs flex items-center gap-1">
                  <MapPin size={10} />
                  {e.location}
                </p>
                <p className="text-[#adb8b8] text-xs flex items-center gap-1">
                  <Users size={10} />
                  {e.registered_count}/{e.max_participants} registered
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openRegs(e)}
                  className="flex-1 text-xs py-1.5 rounded-lg bg-[#313244] text-[#9399b2] hover:text-[#cdd6f4] transition"
                >
                  View Registrations
                </button>
                <button
                  onClick={() => openEdit(e)}
                  className="p-1.5 rounded-lg text-[#9399b2] hover:bg-[#313244] hover:text-[#cdd6f4] transition"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => handleDelete(e.id)}
                  className="p-1.5 rounded-lg text-[#9399b2] hover:bg-[#f38ba8]/10 hover:text-[#f38ba8] transition"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="col-span-3 bg-[#1e1e2e] border border-[#313244] rounded-2xl py-20 text-center">
            <Calendar size={36} className="mx-auto mb-3 text-[#313244]" />
            <p className="text-[#9399b2]">
              No events yet. Create your first one!
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(modal === "create" || modal === "edit") && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setModal(null)}
        >
          <div
            className="bg-[#1e1e2e] border border-[#313244] rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[#cdd6f4] font-bold">
                {editId ? "Edit Event" : "Create Event"}
              </h2>
              <button
                onClick={() => setModal(null)}
                className="text-[#585b70] hover:text-[#cdd6f4]"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#9399b2] mb-1.5 block">
                  Title *
                </label>
                <input
                  value={form.title}
                  onChange={set("title")}
                  className={inputCls}
                  placeholder="Event title"
                />
              </div>
              <div>
                <label className="text-xs text-[#9399b2] mb-1.5 block">
                  Description *
                </label>
                <textarea
                  value={form.description}
                  onChange={set("description")}
                  rows={3}
                  className={inputCls + " resize-none"}
                  placeholder="What is this event about?"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#9399b2] mb-1.5 block">
                    Type
                  </label>
                  <select
                    value={form.event_type}
                    onChange={set("event_type")}
                    className={inputCls}
                  >
                    {["hackathon", "workshop", "webinar", "bootcamp"].map(
                      (t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ),
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#9399b2] mb-1.5 block">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={set("status")}
                    className={inputCls}
                  >
                    {["upcoming", "ongoing", "completed", "cancelled"].map(
                      (s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#9399b2] mb-1.5 block">
                    Start Date *
                  </label>
                  <input
                    type="datetime-local"
                    value={form.start_date}
                    onChange={set("start_date")}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-xs text-[#9399b2] mb-1.5 block">
                    End Date *
                  </label>
                  <input
                    type="datetime-local"
                    value={form.end_date}
                    onChange={set("end_date")}
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-[#9399b2] mb-1.5 block">
                  Location
                </label>
                <input
                  value={form.location}
                  onChange={set("location")}
                  className={inputCls}
                  placeholder="Online / Kathmandu"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#9399b2] mb-1.5 block">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    value={form.max_participants}
                    onChange={set("max_participants")}
                    className={inputCls}
                    min={1}
                  />
                </div>
                <div>
                  <label className="text-xs text-[#9399b2] mb-1.5 block">
                    Registration Fee (NPR)
                  </label>
                  <input
                    type="number"
                    value={form.registration_fee}
                    onChange={set("registration_fee")}
                    className={inputCls}
                    min={0}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-[#9399b2] mb-1.5 block">
                  Thumbnail URL
                </label>
                <input
                  value={form.thumbnail}
                  onChange={set("thumbnail")}
                  className={inputCls}
                  placeholder="https://..."
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_free}
                  onChange={set("is_free")}
                  className="accent-[#a6e3a1]"
                />
                <span className="text-sm text-[#cdd6f4]">Free event</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModal(null)}
                className="flex-1 border border-[#313244] text-[#9399b2] py-2.5 rounded-xl text-sm hover:border-[#585b70] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-[#a6e3a1] text-[#11111b] py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editId
                    ? "Update Event"
                    : "Create & Notify"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registrations Modal */}
      {modal === "regs" && selEvent && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setModal(null)}
        >
          <div
            className="bg-[#1e1e2e] border border-[#313244] rounded-2xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[#cdd6f4] font-bold">Registrations</h2>
                <p className="text-[#9399b2] text-xs mt-0.5">
                  {selEvent.title}
                </p>
              </div>
              <button
                onClick={() => setModal(null)}
                className="text-[#585b70] hover:text-[#cdd6f4]"
              >
                <X size={16} />
              </button>
            </div>
            {regs.length === 0 ? (
              <p className="text-center text-[#9399b2] py-10">
                No registrations yet
              </p>
            ) : (
              <div className="space-y-2">
                {regs.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 py-2.5 border-b border-[#313244]/50 last:border-0"
                  >
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(r.name)}&background=313244&color=cdd6f4`}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                      alt=""
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[#cdd6f4] text-sm font-medium">
                        {r.name}
                      </p>
                      <p className="text-[#585b70] text-xs">{r.email}</p>
                    </div>
                    <select
                      value={r.status}
                      onChange={(e) => handleRegStatus(r.id, e.target.value)}
                      className="text-xs bg-[#313244] border border-[#45475a] text-[#cdd6f4] rounded-lg px-2 py-1 focus:outline-none"
                    >
                      {[
                        "registered",
                        "waitlisted",
                        "attended",
                        "cancelled",
                      ].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
