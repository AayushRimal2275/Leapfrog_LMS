import { useEffect, useState } from "react";
import {
  ClipboardList,
  Search,
  ChevronDown,
  X,
  MessageSquare,
  GraduationCap,
  User,
  Briefcase,
  MapPin,
  GitBranch,
  Globe,
  Link,
  CheckCircle2,
  XCircle,
  CalendarClock,
  UserCheck,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

const STATUSES = ["applied", "interview", "hired", "rejected"];
const statusColors = {
  applied: {
    bg: "bg-[#89b4fa]/20",
    text: "text-[#89b4fa]",
    border: "border-[#89b4fa]/40",
    color: "#89b4fa",
  },
  interview: {
    bg: "bg-[#fab387]/20",
    text: "text-[#fab387]",
    border: "border-[#fab387]/40",
    color: "#fab387",
  },
  hired: {
    bg: "bg-[#a6e3a1]/20",
    text: "text-[#a6e3a1]",
    border: "border-[#a6e3a1]/40",
    color: "#a6e3a1",
  },
  rejected: {
    bg: "bg-[#f38ba8]/20",
    text: "text-[#f38ba8]",
    border: "border-[#f38ba8]/40",
    color: "#f38ba8",
  },
};

export default function HRApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState([]);

  // Candidate detail modal state
  const [detailApp, setDetailApp] = useState(null); // the application row clicked
  const [candidate, setCandidate] = useState(null); // full candidate profile from API
  const [candidateLoading, setCandidateLoading] = useState(false);

  // Note modal state
  const [noteModal, setNoteModal] = useState(null);
  const [noteText, setNoteText] = useState("");

  const load = () => {
    let url = "/hr/applications/";
    if (statusFilter !== "all") url += `?status=${statusFilter}`;
    api
      .get(url)
      .then((r) => setApps(r.data))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, [statusFilter]);

  const filtered = search
    ? apps.filter(
        (a) =>
          a.applicant?.username?.toLowerCase().includes(search.toLowerCase()) ||
          `${a.applicant?.first_name} ${a.applicant?.last_name}`
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          a.job?.title?.toLowerCase().includes(search.toLowerCase()),
      )
    : apps;

  // Open the big candidate modal
  const openCandidate = (app) => {
    setDetailApp(app);
    setCandidate(null);
    setCandidateLoading(true);
    api
      .get(`/hr/talent-pool/${app.applicant?.id}/`)
      .then((r) => setCandidate(r.data))
      .catch(() => setCandidate(null))
      .finally(() => setCandidateLoading(false));
  };

  const handleStatusChange = async (appId, newStatus, closeModal = false) => {
    try {
      await api.patch("/hr/applications/update-status/", {
        application_id: appId,
        status: newStatus,
      });
      const labels = {
        hired: "✅ Hired!",
        interview: "📅 Moved to Interview",
        rejected: "❌ Rejected",
        applied: "↩️ Moved back to Applied",
      };
      toast.success(labels[newStatus] || `Moved to ${newStatus}`);
      if (closeModal) setDetailApp(null);
      load();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleNote = async () => {
    try {
      await api.patch("/hr/applications/update-status/", {
        application_id: noteModal.id,
        status: noteModal.status,
        hr_notes: noteText,
      });
      toast.success("Note saved");
      setNoteModal(null);
      setNoteText("");
      load();
    } catch {
      toast.error("Failed");
    }
  };

  const handleBulkReject = async () => {
    if (!selected.length) return toast.error("Select applications first");
    if (!confirm(`Reject ${selected.length} applications?`)) return;
    await api.patch("/hr/applications/bulk-update/", {
      application_ids: selected,
      status: "rejected",
    });
    toast.success(`${selected.length} applications rejected`);
    setSelected([]);
    load();
  };

  const toggleSelect = (id) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-[#cdd6f4]">Applications</h1>
          <p className="text-[#9399b2] text-sm mt-1">
            {apps.length} total — click any applicant to review their profile
          </p>
        </div>
        {selected.length > 0 && (
          <button
            onClick={handleBulkReject}
            className="bg-[#f38ba8]/20 text-[#f38ba8] border border-[#f38ba8]/30 px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#f38ba8]/30 transition"
          >
            Reject {selected.length} selected
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 animate-fade-in-up stagger-1">
        <div className="relative flex-1 min-w-48">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9399b2]"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or job..."
            className="w-full bg-[#1e1e2e] border border-[#313244] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#cdd6f4] placeholder-[#45475a] focus:outline-none focus:border-[#89dceb] transition"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition capitalize ${statusFilter === s ? "bg-[#89dceb] text-[#11111b]" : "bg-[#1e1e2e] border border-[#313244] text-[#9399b2] hover:border-[#585b70]"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Application cards */}
      <div className="space-y-3 animate-fade-in-up stagger-2">
        {filtered.map((app, i) => {
          const sc = statusColors[app.status] || statusColors.applied;
          const isSelected = selected.includes(app.id);
          return (
            <div
              key={app.id}
              className={`bg-[#1e1e2e] border rounded-2xl p-4 transition cursor-pointer animate-fade-in-up stagger-${Math.min(i + 1, 5)} ${isSelected ? "border-[#89dceb]/50" : "border-[#313244] hover:border-[#89dceb]/50"}`}
              onClick={() => openCandidate(app)}
            >
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleSelect(app.id);
                  }}
                  className="accent-[#89dceb] w-4 h-4 flex-shrink-0 cursor-pointer"
                />

                <img
                  src={
                    app.applicant?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent((app.applicant?.first_name || "U") + " " + (app.applicant?.last_name || ""))}&background=313244&color=cdd6f4`
                  }
                  className="w-11 h-11 rounded-full object-cover flex-shrink-0 ring-2 ring-[#313244]"
                  alt=""
                />

                <div className="flex-1 min-w-0">
                  <p className="text-[#cdd6f4] font-semibold">
                    {app.applicant?.first_name} {app.applicant?.last_name}
                    <span className="text-[#585b70] text-xs font-normal ml-2">
                      @{app.applicant?.username?.split("@")[0]}
                    </span>
                  </p>
                  <p className="text-[#9399b2] text-xs mt-0.5">
                    Applied for{" "}
                    <span className="text-[#bac2de] font-medium">
                      {app.job?.title}
                    </span>
                    <span className="text-[#585b70]">
                      {" "}
                      at {app.job?.company}
                    </span>
                  </p>
                  {app.hr_notes && (
                    <p className="text-[#585b70] text-xs mt-1 italic">
                      📝 {app.hr_notes}
                    </p>
                  )}
                </div>

                <div
                  className="flex items-center gap-2 flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative">
                    <select
                      value={app.status}
                      onChange={(e) =>
                        handleStatusChange(app.id, e.target.value)
                      }
                      className={`appearance-none text-xs px-3 py-1.5 pr-7 rounded-full font-medium cursor-pointer border-0 outline-none ${sc.bg} ${sc.text}`}
                    >
                      {STATUSES.map((s) => (
                        <option
                          key={s}
                          value={s}
                          className="bg-[#1e1e2e] text-[#cdd6f4]"
                        >
                          {s}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={10}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${sc.text}`}
                    />
                  </div>
                  <button
                    onClick={() => {
                      setNoteModal(app);
                      setNoteText(app.hr_notes || "");
                    }}
                    className="p-2 rounded-lg text-[#9399b2] hover:bg-[#313244] hover:text-[#cdd6f4] transition"
                    title="Add note"
                  >
                    <MessageSquare size={14} />
                  </button>
                </div>
              </div>
              {app.cover_letter && (
                <p className="text-[#585b70] text-xs mt-3 pl-10 line-clamp-1 italic">
                  "{app.cover_letter}"
                </p>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl py-16 text-center">
            <ClipboardList size={32} className="mx-auto mb-3 text-[#313244]" />
            <p className="text-sm text-[#9399b2]">No applications found</p>
          </div>
        )}
      </div>

      {/* ── CANDIDATE DETAIL MODAL ── */}
      {detailApp && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setDetailApp(null)}
        >
          <div
            className="bg-[#1e1e2e] border border-[#313244] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="sticky top-0 bg-[#1e1e2e] border-b border-[#313244] px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-[#cdd6f4] font-bold">Candidate Review</h2>
                <p className="text-[#9399b2] text-xs mt-0.5">
                  {detailApp.job?.title} at {detailApp.job?.company}
                </p>
              </div>
              <button
                onClick={() => setDetailApp(null)}
                className="text-[#585b70] hover:text-[#cdd6f4] transition p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* ── Applicant header ── */}
              <div className="flex items-center gap-4">
                <img
                  src={
                    detailApp.applicant?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent((detailApp.applicant?.first_name || "U") + " " + (detailApp.applicant?.last_name || ""))}&background=313244&color=cdd6f4&size=128`
                  }
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#313244]"
                  alt=""
                />
                <div className="flex-1">
                  <h3 className="text-[#cdd6f4] font-bold text-lg">
                    {detailApp.applicant?.first_name}{" "}
                    {detailApp.applicant?.last_name}
                  </h3>
                  {candidateLoading ? (
                    <p className="text-[#585b70] text-xs mt-1">
                      Loading profile...
                    </p>
                  ) : candidate?.profile?.headline ? (
                    <p className="text-[#89dceb] text-sm font-medium mt-0.5">
                      {candidate.profile.headline}
                    </p>
                  ) : null}
                  {candidate?.profile?.location && (
                    <p className="text-[#9399b2] text-xs flex items-center gap-1 mt-1">
                      <MapPin size={11} />
                      {candidate.profile.location}
                    </p>
                  )}
                </div>
                {/* Current status badge */}
                <div
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize border ${statusColors[detailApp.status]?.bg} ${statusColors[detailApp.status]?.text} ${statusColors[detailApp.status]?.border}`}
                >
                  {detailApp.status}
                </div>
              </div>

              {/* ── Quick stats ── */}
              {candidateLoading ? (
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="bg-[#313244]/50 rounded-xl h-16 animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                candidate && (
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        label: "Courses Enrolled",
                        value: candidate.courses_enrolled,
                        color: "#89b4fa",
                      },
                      {
                        label: "Completed",
                        value: candidate.courses_completed,
                        color: "#a6e3a1",
                      },
                      {
                        label: "Certificates",
                        value: candidate.certificates?.length ?? 0,
                        color: "#cba6f7",
                      },
                    ].map(({ label, value, color }) => (
                      <div
                        key={label}
                        className="bg-[#11111b] rounded-xl p-3 text-center"
                      >
                        <p className="text-xl font-bold" style={{ color }}>
                          {value}
                        </p>
                        <p className="text-[#585b70] text-xs mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* ── Bio ── */}
              {candidate?.profile?.bio && (
                <div className="bg-[#11111b] rounded-xl p-4">
                  <p className="text-[#9399b2] text-xs font-semibold uppercase tracking-wider mb-2">
                    About
                  </p>
                  <p className="text-[#a6adc8] text-sm leading-relaxed">
                    {candidate.profile.bio}
                  </p>
                </div>
              )}

              {/* ── Skills ── */}
              {candidate?.profile?.skills?.length > 0 && (
                <div>
                  <p className="text-[#9399b2] text-xs font-semibold uppercase tracking-wider mb-2">
                    Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {candidate.profile.skills.map((s) => (
                      <span
                        key={s}
                        className="text-xs bg-[#89dceb]/15 text-[#89dceb] px-2.5 py-1 rounded-full"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Certificates ── */}
              <div>
                <p className="text-[#9399b2] text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <GraduationCap size={12} /> Certificates Earned
                </p>
                {candidateLoading ? (
                  <div className="space-y-2">
                    {[1, 2].map((n) => (
                      <div
                        key={n}
                        className="h-12 bg-[#313244]/50 rounded-xl animate-pulse"
                      />
                    ))}
                  </div>
                ) : candidate?.certificates?.length > 0 ? (
                  <div className="space-y-2">
                    {candidate.certificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="flex items-center gap-3 bg-[#11111b] rounded-xl px-4 py-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#a6e3a1]/20 flex items-center justify-center flex-shrink-0">
                          <GraduationCap size={14} className="text-[#a6e3a1]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[#cdd6f4] text-sm font-medium truncate">
                            {cert.course_title}
                          </p>
                          <p className="text-[#585b70] text-[11px] font-mono">
                            {cert.certificate_id}
                          </p>
                        </div>
                        <p className="text-[#585b70] text-xs flex-shrink-0">
                          {new Date(cert.issued_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#585b70] text-sm bg-[#11111b] rounded-xl px-4 py-3">
                    No certificates yet
                  </p>
                )}
              </div>

              {/* ── Cover Letter ── */}
              {detailApp.cover_letter && (
                <div>
                  <p className="text-[#9399b2] text-xs font-semibold uppercase tracking-wider mb-2">
                    Cover Letter
                  </p>
                  <div className="bg-[#11111b] rounded-xl p-4">
                    <p className="text-[#a6adc8] text-sm leading-relaxed italic">
                      "{detailApp.cover_letter}"
                    </p>
                  </div>
                </div>
              )}

              {/* ── Social links ── */}
              {(candidate?.profile?.github ||
                candidate?.profile?.linkedin ||
                candidate?.profile?.website) && (
                <div className="flex gap-4">
                  {candidate.profile.github && (
                    <a
                      href={candidate.profile.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-[#9399b2] hover:text-[#cdd6f4] transition bg-[#11111b] px-3 py-2 rounded-xl"
                    >
                      <GitBranch size={13} /> GitHub
                    </a>
                  )}
                  {candidate.profile.linkedin && (
                    <a
                      href={candidate.profile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-[#9399b2] hover:text-[#89b4fa] transition bg-[#11111b] px-3 py-2 rounded-xl"
                    >
                      <Link size={13} /> LinkedIn
                    </a>
                  )}
                  {candidate.profile.website && (
                    <a
                      href={candidate.profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-[#9399b2] hover:text-[#a6e3a1] transition bg-[#11111b] px-3 py-2 rounded-xl"
                    >
                      <Globe size={13} /> Website
                    </a>
                  )}
                </div>
              )}

              {/* ── HR Decision buttons ── */}
              <div className="border-t border-[#313244] pt-5">
                <p className="text-[#9399b2] text-xs font-semibold uppercase tracking-wider mb-3">
                  Decision
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() =>
                      handleStatusChange(detailApp.id, "interview", true)
                    }
                    disabled={detailApp.status === "interview"}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed bg-[#fab387]/20 text-[#fab387] border border-[#fab387]/30 hover:bg-[#fab387]/30"
                  >
                    <CalendarClock size={15} /> Move to Interview
                  </button>
                  <button
                    onClick={() =>
                      handleStatusChange(detailApp.id, "hired", true)
                    }
                    disabled={detailApp.status === "hired"}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed bg-[#a6e3a1]/20 text-[#a6e3a1] border border-[#a6e3a1]/30 hover:bg-[#a6e3a1]/30"
                  >
                    <CheckCircle2 size={15} /> Hire ✓
                  </button>
                  <button
                    onClick={() =>
                      handleStatusChange(detailApp.id, "rejected", true)
                    }
                    disabled={detailApp.status === "rejected"}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed bg-[#f38ba8]/20 text-[#f38ba8] border border-[#f38ba8]/30 hover:bg-[#f38ba8]/30"
                  >
                    <XCircle size={15} /> Reject
                  </button>
                  <button
                    onClick={() => {
                      setNoteModal(detailApp);
                      setNoteText(detailApp.hr_notes || "");
                    }}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition bg-[#313244] text-[#9399b2] hover:text-[#cdd6f4] border border-[#45475a] hover:border-[#585b70]"
                  >
                    <MessageSquare size={15} />{" "}
                    {detailApp.hr_notes ? "Edit Note" : "Add Note"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Note modal */}
      {noteModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4"
          onClick={() => setNoteModal(null)}
        >
          <div
            className="bg-[#1e1e2e] border border-[#313244] rounded-2xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#cdd6f4] font-semibold text-sm">HR Notes</h2>
              <button
                onClick={() => setNoteModal(null)}
                className="text-[#585b70] hover:text-[#cdd6f4]"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-[#9399b2] text-xs mb-3">
              {noteModal.applicant?.first_name} — {noteModal.job?.title}
            </p>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={4}
              className="w-full bg-[#11111b] border border-[#313244] rounded-xl px-3 py-2.5 text-sm text-[#cdd6f4] placeholder-[#45475a] focus:outline-none focus:border-[#89dceb] transition resize-none"
              placeholder="Internal notes about this candidate..."
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setNoteModal(null)}
                className="flex-1 border border-[#313244] text-[#9399b2] py-2 rounded-xl text-sm hover:border-[#585b70] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleNote}
                className="flex-1 bg-[#89dceb] text-[#11111b] py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
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
