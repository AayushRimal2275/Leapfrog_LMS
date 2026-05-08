import { useEffect, useState } from "react";
import { Calendar, MapPin, Users, Clock, Zap, Filter } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const TYPE_COLORS = {
  hackathon: {
    bg: "bg-[#f38ba8]/15",
    text: "text-[#f38ba8]",
    border: "border-[#f38ba8]/30",
  },
  workshop: {
    bg: "bg-[#fab387]/15",
    text: "text-[#fab387]",
    border: "border-[#fab387]/30",
  },
  webinar: {
    bg: "bg-[#89b4fa]/15",
    text: "text-[#89b4fa]",
    border: "border-[#89b4fa]/30",
  },
  bootcamp: {
    bg: "bg-[#cba6f7]/15",
    text: "text-[#cba6f7]",
    border: "border-[#cba6f7]/30",
  },
};
const STATUS_COLORS = {
  upcoming: "text-[#a6e3a1]",
  ongoing: "text-[#fab387]",
  completed: "text-[#7f849c]",
  cancelled: "text-[#f38ba8]",
};

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [tab, setTab] = useState("all");

  const load = () => {
    Promise.all([api.get("/events/"), api.get("/my-events/")])
      .then(([ev, my]) => {
        setEvents(ev.data);
        setMyEvents(my.data.map((r) => r.event_id));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);

  const handleRegister = async (eventId) => {
    try {
      const r = await api.post(`/events/${eventId}/register/`);
      toast.success(r.data.message);
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to register");
    }
  };

  const handleCancel = async (eventId) => {
    if (!confirm("Cancel your registration?")) return;
    try {
      await api.delete(`/events/${eventId}/cancel/`);
      toast.success("Registration cancelled");
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to cancel");
    }
  };

  const filtered = events
    .filter((e) => typeFilter === "all" || e.event_type === typeFilter)
    .filter((e) => (tab === "mine" ? myEvents.includes(e.id) : true));

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-4 border-[#f38ba8] border-t-transparent animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#cdd6f4]">Events</h1>
          <p className="text-[#bac2de] text-sm mt-1">
            Hackathons, workshops, webinars & bootcamps
          </p>
        </div>
      </div>

      {/* Tabs + Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex bg-[#1e1e2e] border border-[#313244] rounded-xl p-1 gap-1">
          {["all", "mine"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition capitalize ${tab === t ? "bg-[#f38ba8] text-[#11111b]" : "text-[#bac2de] hover:text-[#cdd6f4]"}`}
            >
              {t === "mine" ? `My Events (${myEvents.length})` : "All Events"}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "hackathon", "workshop", "webinar", "bootcamp"].map((t) => {
            const c = TYPE_COLORS[t];
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition capitalize border ${
                  typeFilter === t
                    ? c
                      ? `${c.bg} ${c.text} ${c.border}`
                      : "bg-[#f38ba8]/15 text-[#f38ba8] border-[#f38ba8]/30"
                    : "bg-[#1e1e2e] border-[#313244] text-[#bac2de] hover:border-[#585b70]"
                }`}
              >
                {t === "all" ? "All Types" : t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl py-20 text-center">
          <Calendar size={36} className="mx-auto mb-3 text-[#313244]" />
          <p className="text-[#bac2de]">No events found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((e) => {
            const tc = TYPE_COLORS[e.event_type] || TYPE_COLORS.webinar;
            const isRegistered = myEvents.includes(e.id);
            const isFull = e.is_full && !isRegistered;
            const isPast = e.status === "completed" || e.status === "cancelled";

            return (
              <div
                key={e.id}
                className="bg-[#1e1e2e] border border-[#313244] rounded-2xl overflow-hidden hover:border-[#585b70] transition flex flex-col"
              >
                {e.thumbnail ? (
                  <img
                    src={e.thumbnail}
                    alt={e.title}
                    className="w-full h-36 object-cover"
                  />
                ) : (
                  <div
                    className={`w-full h-36 flex items-center justify-center ${tc.bg}`}
                  >
                    <Calendar
                      size={32}
                      style={{
                        color: tc.text.replace("text-[", "").replace("]", ""),
                      }}
                      className={tc.text}
                    />
                  </div>
                )}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-medium capitalize border ${tc.bg} ${tc.text} ${tc.border}`}
                    >
                      {e.event_type}
                    </span>
                    <span
                      className={`text-[10px] font-medium capitalize ${STATUS_COLORS[e.status]}`}
                    >
                      ● {e.status}
                    </span>
                  </div>

                  <h3 className="text-[#cdd6f4] font-semibold text-sm mb-2 leading-snug">
                    {e.title}
                  </h3>
                  <p className="text-[#bac2de] text-xs leading-relaxed line-clamp-2 mb-3 flex-1">
                    {e.description}
                  </p>

                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-1.5 text-[#7f849c] text-xs">
                      <Clock size={11} />
                      {new Date(e.start_date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      {" – "}
                      {new Date(e.end_date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="flex items-center gap-1.5 text-[#7f849c] text-xs">
                      <MapPin size={11} />
                      {e.location}
                    </div>
                    <div className="flex items-center gap-1.5 text-[#7f849c] text-xs">
                      <Users size={11} />
                      {e.registered_count}/{e.max_participants} registered
                      {e.is_full && !isRegistered && (
                        <span className="text-[#f38ba8] ml-1">· Full</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">
                      {e.is_free ? (
                        <span className="text-[#a6e3a1]">Free</span>
                      ) : (
                        <span className="text-[#fab387]">
                          NPR {e.registration_fee}
                        </span>
                      )}
                    </span>
                    {isPast ? (
                      <span className="text-[#7f849c] text-xs capitalize">
                        {e.status}
                      </span>
                    ) : isRegistered ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[#a6e3a1] text-xs font-medium">
                          ✓ Registered
                        </span>
                        <button
                          onClick={() => handleCancel(e.id)}
                          className="text-[#f38ba8] text-xs hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRegister(e.id)}
                        disabled={isFull}
                        className={`text-xs px-4 py-2 rounded-xl font-semibold transition ${
                          isFull
                            ? "bg-[#313244] text-[#7f849c] cursor-not-allowed"
                            : `${tc.bg} ${tc.text} border ${tc.border} hover:opacity-80`
                        }`}
                      >
                        {isFull ? "Full" : "Register"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
