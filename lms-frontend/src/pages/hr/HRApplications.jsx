import { useEffect, useState } from "react";
import {
  ClipboardList,
  Search,
  ChevronDown,
  X,
  MessageSquare,
  GraduationCap,
  Briefcase,
  MapPin,
  GitBranch,
  Link,
  Globe,
  ChevronRight,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

const STATUSES = ["applied", "interview", "hired", "rejected"];
const statusColors = {
  applied: { bg: "bg-[#89b4fa]/20", text: "text-[#89b4fa]", dot: "#89b4fa" },
  interview: { bg: "bg-[#fab387]/20", text: "text-[#fab387]", dot: "#fab387" },
  hired: { bg: "bg-[#a6e3a1]/20", text: "text-[#a6e3a1]", dot: "#a6e3a1" },
  rejected: { bg: "bg-[#f38ba8]/20", text: "text-[#f38ba8]", dot: "#f38ba8" },
};

export default function HRApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [noteModal, setNoteModal] = useState(null);
  const [noteText, setNoteText] = useState("");

  // ── applicant detail panel ──
  const [detailApp, setDetailApp] = useState(null);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

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
          a.applicant?.first_name
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          a.job?.title?.toLowerCase().includes(search.toLowerCase()),
      )
    : apps;

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.patch("/hr/applications/update-status/", {
        application_id: appId,
        status: newStatus,
      });
      toast.success(`Moved to ${newStatus}`);
      load();
      // Update detailApp status in place too
      if (detailApp?.id === appId)
        setDetailApp((a) => ({ ...a, status: newStatus }));
    } catch {
      toast.error("Failed to update");
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

  // Open detail panel: load full candidate profile from talent-pool endpoint
  const openDetail = (app) => {
    setDetailApp(app);
    setCandidateProfile(null);
    setProfileLoading(true);
    api
      .get(`/hr/talent-pool/${app.applicant?.id}/`)
      .then((r) => setCandidateProfile(r.data))
      .catch(() => setCandidateProfile(null))
      .finally(() => setProfileLoading(false));
  };

  if (loading) return <Spinner />;

  return (
    <div className="flex gap-5 animate-fade-in h-full">
      {/* ── LEFT: Applications list ── */}
      <div
        className={`flex flex-col gap-4 transition-all duration-300 ${detailApp ? "w-1/2" : "w-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#cdd6f4]">Applications</h1>
            <p className="text-[#9399b2] text-sm mt-1">{apps.length} total</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-40">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9399b2]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
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

        {/* List */}
        <div className="space-y-3">
          {filtered.map((app, i) => {
            const sc = statusColors[app.status] || statusColors.applied;
            const isOpen = detailApp?.id === app.id;
            return (
              <div
                key={app.id}
                className={`bg-[#1e1e2e] border rounded-2xl p-4 transition cursor-pointer ${
                  isOpen
                    ? "border-[#89dceb]"
                    : "border-[#313244] hover:border-[#585b70]"
                }`}
                onClick={() => (isOpen ? setDetailApp(null) : openDetail(app))}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      app.applicant?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(app.applicant?.first_name || "U")}&background=313244&color=cdd6f4`
                    }
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                    alt=""
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-[#cdd6f4] font-semibold text-sm">
                      {app.applicant?.first_name} {app.applicant?.last_name}
                      <span className="text-[#585b70] text-xs font-normal ml-1.5">
                        @{app.applicant?.username?.split("@")[0]}
                      </span>
                    </p>
                    <p className="text-[#9399b2] text-xs mt-0.5 truncate">
                      <span className="text-[#bac2de]">{app.job?.title}</span> ·{" "}
                      {app.job?.company}
                    </p>
                  </div>

                  <div
                    className="flex items-center gap-2 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Status select */}
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

                    {/* Note */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setNoteModal(app);
                        setNoteText(app.hr_notes || "");
                      }}
                      className="p-1.5 rounded-lg text-[#9399b2] hover:bg-[#313244] hover:text-[#cdd6f4] transition"
                      title="Add note"
                    >
                      <MessageSquare size={13} />
                    </button>

                    {/* Expand arrow */}
                    <ChevronRight
                      size={14}
                      className={`text-[#585b70] transition-transform ${isOpen ? "rotate-90" : ""}`}
                    />
                  </div>
                </div>

                {app.hr_notes && (
                  <p className="text-[#585b70] text-xs mt-2 pl-10 italic">
                    📝 {app.hr_notes}
                  </p>
                )}
                {app.cover_letter && !isOpen && (
                  <p className="text-[#585b70] text-xs mt-2 pl-10 line-clamp-1 italic">
                    "{app.cover_letter}"
                  </p>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl py-16 text-center">
              <ClipboardList
                size={32}
                className="mx-auto mb-3 text-[#313244]"
              />
              <p className="text-sm text-[#9399b2]">No applications found</p>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Applicant Detail Panel ── */}
      {detailApp && (
        <div className="w-1/2 sticky top-0 self-start">
          <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl overflow-hidden max-h-[calc(100vh-6rem)] overflow-y-auto">
            {/* Panel header */}
            <div className="flex items-center justify-between p-5 border-b border-[#313244]">
              <div className="flex items-center gap-3">
                <img
                  src={
                    detailApp.applicant?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(detailApp.applicant?.first_name || "U")}&background=89dceb&color=11111b`
                  }
                  className="w-10 h-10 rounded-full object-cover"
                  alt=""
                />
                <div>
                  <p className="text-[#cdd6f4] font-bold text-sm">
                    {detailApp.applicant?.first_name}{" "}
                    {detailApp.applicant?.last_name}
                  </p>
                  <p className="text-[#9399b2] text-xs">
                    {detailApp.applicant?.email ||
                      detailApp.applicant?.username}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetailApp(null)}
                className="text-[#585b70] hover:text-[#cdd6f4] transition p-1"
              >
                <X size={16} />
              </button>
            </div>

            {/* Applied for */}
            <div className="px-5 pt-4 pb-3 bg-[#89dceb]/5 border-b border-[#313244]">
              <p className="text-[#9399b2] text-xs mb-1">Applied for</p>
              <p className="text-[#cdd6f4] font-semibold text-sm">
                {detailApp.job?.title}
              </p>
              <p className="text-[#9399b2] text-xs">
                {detailApp.job?.company} · {detailApp.job?.location}
              </p>
              {detailApp.cover_letter && (
                <div className="mt-3">
                  <p className="text-[#9399b2] text-xs mb-1 font-medium">
                    Cover Letter
                  </p>
                  <p className="text-[#a6adc8] text-xs leading-relaxed italic bg-[#11111b] rounded-xl p-3">
                    "{detailApp.cover_letter}"
                  </p>
                </div>
              )}
            </div>

            {/* Status control in panel */}
            <div className="px-5 py-3 border-b border-[#313244] flex items-center justify-between">
              <span className="text-[#9399b2] text-xs font-medium">
                Decision
              </span>
              <div className="flex gap-2">
                {STATUSES.map((s) => {
                  const sc = statusColors[s];
                  const active = detailApp.status === s;
                  return (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(detailApp.id, s)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition capitalize border ${
                        active
                          ? `${sc.bg} ${sc.text} border-transparent`
                          : "border-[#313244] text-[#585b70] hover:border-[#585b70]"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Candidate info from talent pool */}
            {profileLoading ? (
              <div className="p-10 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full border-4 border-[#89dceb] border-t-transparent animate-spin" />
              </div>
            ) : candidateProfile ? (
              <div className="p-5 space-y-5">
                {/* Bio + location */}
                {(candidateProfile.profile?.headline ||
                  candidateProfile.profile?.bio ||
                  candidateProfile.profile?.location) && (
                  <div>
                    {candidateProfile.profile?.headline && (
                      <p className="text-[#89dceb] text-sm font-medium mb-1">
                        {candidateProfile.profile.headline}
                      </p>
                    )}
                    {candidateProfile.profile?.location && (
                      <p className="text-[#9399b2] text-xs flex items-center gap-1 mb-2">
                        <MapPin size={10} />
                        {candidateProfile.profile.location}
                      </p>
                    )}
                    {candidateProfile.profile?.bio && (
                      <p className="text-[#a6adc8] text-xs leading-relaxed">
                        {candidateProfile.profile.bio}
                      </p>
                    )}
                    {/* Social links */}
                    {(candidateProfile.profile?.github ||
                      candidateProfile.profile?.linkedin ||
                      candidateProfile.profile?.website) && (
                      <div className="flex gap-3 mt-2">
                        {candidateProfile.profile.github && (
                          <a
                            href={candidateProfile.profile.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#9399b2] hover:text-[#cdd6f4]"
                          >
                            <GitBranch size={14} />
                          </a>
                        )}
                        {candidateProfile.profile.linkedin && (
                          <a
                            href={candidateProfile.profile.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#9399b2] hover:text-[#89b4fa]"
                          >
                            <Link size={14} />
                          </a>
                        )}
                        {candidateProfile.profile.website && (
                          <a
                            href={candidateProfile.profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#9399b2] hover:text-[#a6e3a1]"
                          >
                            <Globe size={14} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      label: "Enrolled",
                      value: candidateProfile.courses_enrolled,
                    },
                    {
                      label: "Completed",
                      value: candidateProfile.courses_completed,
                    },
                    {
                      label: "Applied",
                      value: candidateProfile.total_applications,
                    },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="bg-[#11111b] rounded-xl p-3 text-center"
                    >
                      <p className="text-lg font-bold text-[#89dceb]">
                        {value}
                      </p>
                      <p className="text-[#585b70] text-[10px] mt-0.5">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Skills */}
                {candidateProfile.profile?.skills?.length > 0 && (
                  <div>
                    <p className="text-[#9399b2] text-xs font-medium uppercase tracking-wider mb-2">
                      Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {candidateProfile.profile.skills.map((s) => (
                        <span
                          key={s}
                          className="text-[11px] bg-[#89dceb]/15 text-[#89dceb] px-2.5 py-1 rounded-full"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certificates — THE KEY SECTION */}
                <div>
                  <p className="text-[#9399b2] text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <GraduationCap size={12} className="text-[#a6e3a1]" />{" "}
                    Certificates Earned
                    <span className="ml-auto text-[#a6e3a1] font-bold normal-case">
                      {candidateProfile.certificates?.length || 0}
                    </span>
                  </p>
                  {candidateProfile.certificates?.length > 0 ? (
                    <div className="space-y-2">
                      {candidateProfile.certificates.map((cert) => (
                        <div
                          key={cert.id}
                          className="flex items-center gap-3 bg-[#313244]/50 rounded-xl px-3 py-2.5"
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#a6e3a1]/20 flex items-center justify-center flex-shrink-0">
                            <GraduationCap
                              size={14}
                              className="text-[#a6e3a1]"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[#cdd6f4] text-xs font-medium truncate">
                              {cert.course_title}
                            </p>
                            <p className="text-[#585b70] text-[10px] font-mono mt-0.5">
                              {cert.certificate_id}
                            </p>
                          </div>
                          <span className="text-[#9399b2] text-[10px] flex-shrink-0">
                            {new Date(cert.issued_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#11111b] rounded-xl px-3 py-4 text-center">
                      <GraduationCap
                        size={20}
                        className="mx-auto mb-1 text-[#313244]"
                      />
                      <p className="text-[#585b70] text-xs">
                        No certificates yet
                      </p>
                    </div>
                  )}
                </div>

                {/* Application history */}
                {candidateProfile.application_history?.length > 0 && (
                  <div>
                    <p className="text-[#9399b2] text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Briefcase size={12} /> Application History
                    </p>
                    <div className="space-y-1.5">
                      {candidateProfile.application_history.map((a, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between py-1.5 border-b border-[#313244]/50 last:border-0"
                        >
                          <div>
                            <p className="text-[#cdd6f4] text-xs font-medium">
                              {a.job}
                            </p>
                            <p className="text-[#585b70] text-[10px]">
                              {a.company}
                            </p>
                          </div>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              a.status === "hired"
                                ? "bg-[#a6e3a1]/20 text-[#a6e3a1]"
                                : a.status === "interview"
                                  ? "bg-[#fab387]/20 text-[#fab387]"
                                  : a.status === "rejected"
                                    ? "bg-[#f38ba8]/20 text-[#f38ba8]"
                                    : "bg-[#89b4fa]/20 text-[#89b4fa]"
                            }`}
                          >
                            {a.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* HR Notes */}
                <div>
                  <p className="text-[#9399b2] text-xs font-medium uppercase tracking-wider mb-2">
                    HR Notes
                  </p>
                  <textarea
                    defaultValue={detailApp.hr_notes || ""}
                    onBlur={async (e) => {
                      if (e.target.value !== detailApp.hr_notes) {
                        await api.patch("/hr/applications/update-status/", {
                          application_id: detailApp.id,
                          status: detailApp.status,
                          hr_notes: e.target.value,
                        });
                        toast.success("Notes saved");
                        load();
                      }
                    }}
                    rows={3}
                    placeholder="Write internal notes about this candidate..."
                    className="w-full bg-[#11111b] border border-[#313244] rounded-xl px-3 py-2.5 text-xs text-[#cdd6f4] placeholder-[#45475a] focus:outline-none focus:border-[#89dceb] transition resize-none"
                  />
                  <p className="text-[#585b70] text-[10px] mt-1">
                    Notes auto-save when you click away
                  </p>
                </div>
              </div>
            ) : (
              /* Not in talent pool yet (no certificates) — still show what we have */
              <div className="p-5 space-y-4">
                <div className="bg-[#fab387]/10 border border-[#fab387]/30 rounded-xl px-4 py-3 text-xs text-[#fab387]">
                  ⚠️ This candidate hasn't earned any certificates yet. Review
                  their cover letter and application carefully.
                </div>

                {/* applicant basic info from application data */}
                {detailApp.applicant?.headline && (
                  <p className="text-[#89dceb] text-sm font-medium">
                    {detailApp.applicant.headline}
                  </p>
                )}
                {detailApp.applicant?.skills?.length > 0 && (
                  <div>
                    <p className="text-[#9399b2] text-xs font-medium mb-2">
                      Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {detailApp.applicant.skills.map((s) => (
                        <span
                          key={s}
                          className="text-[11px] bg-[#89dceb]/15 text-[#89dceb] px-2.5 py-1 rounded-full"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-[#9399b2] text-xs font-medium uppercase tracking-wider mb-2">
                    HR Notes
                  </p>
                  <textarea
                    defaultValue={detailApp.hr_notes || ""}
                    onBlur={async (e) => {
                      await api.patch("/hr/applications/update-status/", {
                        application_id: detailApp.id,
                        status: detailApp.status,
                        hr_notes: e.target.value,
                      });
                      toast.success("Notes saved");
                      load();
                    }}
                    rows={3}
                    placeholder="Write internal notes..."
                    className="w-full bg-[#11111b] border border-[#313244] rounded-xl px-3 py-2.5 text-xs text-[#cdd6f4] placeholder-[#45475a] focus:outline-none focus:border-[#89dceb] transition resize-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Note modal */}
      {noteModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
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
