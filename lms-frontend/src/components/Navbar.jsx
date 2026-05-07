import { useEffect, useRef, useState } from "react";
import {
  Bell,
  CheckCheck,
  Megaphone,
  Calendar,
  XCircle,
  CheckCircle2,
  MessageSquare,
  GraduationCap,
  BookOpen,
  Briefcase,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const typeIcon = {
  hired: <CheckCircle2 size={14} className="text-[#a6e3a1] flex-shrink-0" />,
  interview: <Calendar size={14} className="text-[#fab387] flex-shrink-0" />,
  rejected: <XCircle size={14} className="text-[#f38ba8] flex-shrink-0" />,
  feedback: (
    <MessageSquare size={14} className="text-[#89b4fa] flex-shrink-0" />
  ),
  status: <Megaphone size={14} className="text-[#cba6f7] flex-shrink-0" />,
  new_course: <BookOpen size={14} className="text-[#89b4fa] flex-shrink-0" />,
  new_job: <Briefcase size={14} className="text-[#fab387] flex-shrink-0" />,
  new_event: <Calendar size={14} className="text-[#f38ba8] flex-shrink-0" />,
  certificate: (
    <GraduationCap size={14} className="text-[#a6e3a1] flex-shrink-0" />
  ),
};

const typeBorder = {
  hired: "border-l-[#a6e3a1]",
  interview: "border-l-[#fab387]",
  rejected: "border-l-[#f38ba8]",
  feedback: "border-l-[#89b4fa]",
  status: "border-l-[#cba6f7]",
  new_course: "border-l-[#89b4fa]",
  new_job: "border-l-[#fab387]",
  new_event: "border-l-[#f38ba8]",
  certificate: "border-l-[#a6e3a1]",
};

export default function Navbar() {
  const { user, isAdmin, isHR } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  // All roles get the bell — admins get notified of enrollments, HR of job applications
  const showBell = true;

  const loadNotifs = () => {
    api
      .get("/notifications/")
      .then((r) => {
        setNotifs(r.data.notifications || []);
        setUnread(r.data.unread_count || 0);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadNotifs();
    const interval = setInterval(loadNotifs, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    setOpen((o) => !o);
    if (!open && unread > 0) {
      api
        .post("/notifications/read-all/")
        .then(loadNotifs)
        .catch(() => {});
    }
  };

  const fullName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username
    : "";

  return (
    <div className="h-14 border-b border-[#313244] bg-[#11111b] flex items-center justify-end px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {showBell && (
          <div className="relative" ref={ref}>
            <button
              onClick={handleOpen}
              className={`relative p-2 rounded-xl transition ${open ? "bg-[#313244]" : "hover:bg-[#1e1e2e]"}`}
            >
              <Bell size={18} className="text-[#9399b2]" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] bg-[#f38ba8] text-[#11111b] text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>

            {open && (
              <div className="absolute right-0 top-11 w-80 bg-[#1e1e2e] border border-[#313244] rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#313244]">
                  <p className="text-[#cdd6f4] font-semibold text-sm">
                    Notifications
                  </p>
                  {unread > 0 && (
                    <button
                      onClick={() =>
                        api.post("/notifications/read-all/").then(loadNotifs)
                      }
                      className="flex items-center gap-1 text-[10px] text-[#9399b2] hover:text-[#cdd6f4] transition"
                    >
                      <CheckCheck size={12} /> Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifs.length === 0 ? (
                    <div className="py-10 text-center">
                      <Bell size={24} className="mx-auto mb-2 text-[#313244]" />
                      <p className="text-[#585b70] text-xs">
                        No notifications yet
                      </p>
                    </div>
                  ) : (
                    notifs.map((n) => (
                      <div
                        key={n.id}
                        className={`flex gap-3 px-4 py-3 border-l-2 border-b border-b-[#313244]/50 transition ${!n.is_read ? "bg-[#313244]/40" : "bg-transparent"} ${typeBorder[n.type] || "border-l-[#585b70]"}`}
                      >
                        <div className="mt-0.5">
                          {typeIcon[n.type] || (
                            <Bell size={14} className="text-[#585b70]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-xs font-semibold leading-tight ${!n.is_read ? "text-[#d82b2b]" : "text-[#9aa3c7]"}`}
                          >
                            {n.title}
                          </p>
                          <p className="text-[#eef0ff] text-[11px] mt-0.5 line-clamp-2 leading-relaxed">
                            {n.message}
                          </p>
                          <p className="text-[#adb5ff] text-[10px] mt-1">
                            {new Date(n.created_at).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                        {!n.is_read && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#cba6f7] flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <img
          src={
            user?.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || "U")}&background=313244&color=cdd6f4`
          }
          className="w-8 h-8 rounded-full object-cover ring-2 ring-[#313244]"
          alt=""
        />
      </div>
    </div>
  );
}
