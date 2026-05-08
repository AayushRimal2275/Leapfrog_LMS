import { useEffect, useState } from "react";
import {
  UserCheck,
  Search,
  GraduationCap,
  BookOpen,
  Briefcase,
  X,
  GitBranch,
  Link,
  Globe,
  MapPin,
  Calendar,
  Code,
} from "lucide-react";
import api from "../../services/api";

export default function HRTalentPool() {
  const [talent, setTalent] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const load = () => {
    const url = courseFilter
      ? `/hr/talent-pool/?course_id=${courseFilter}`
      : "/hr/talent-pool/";
    Promise.all([api.get(url), api.get("/courses/")])
      .then(([t, c]) => {
        setTalent(t.data);
        setCourses(c.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, [courseFilter]);

  const filtered = search
    ? talent.filter(
        (t) =>
          `${t.first_name} ${t.last_name}`
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          t.username?.toLowerCase().includes(search.toLowerCase()) ||
          t.headline?.toLowerCase().includes(search.toLowerCase()) ||
          t.skills?.some((s) => s.toLowerCase().includes(search.toLowerCase())),
      )
    : talent;

  const openProfile = (userId) => {
    setProfileLoading(true);
    setProfile(null);
    api
      .get(`/hr/talent-pool/${userId}/`)
      .then((r) => setProfile(r.data))
      .catch(() => setProfile(null))
      .finally(() => setProfileLoading(false));
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[#cdd6f4]">Talent Pool</h1>
        <p className="text-[#bac2de] text-sm mt-1">
          {filtered.length} certified candidates
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bac2de]"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, headline or skill..."
            className="w-full bg-[#1e1e2e] border border-[#313244] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#cdd6f4] placeholder-[#6c7086] focus:outline-none focus:border-[#89dceb] transition"
          />
        </div>
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="bg-[#1e1e2e] border border-[#313244] rounded-xl px-3 py-2.5 text-sm text-[#cdd6f4] focus:outline-none focus:border-[#89dceb] transition"
        >
          <option value="">All certificates</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {/* Candidates grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => {
          const fullName =
            `${item.first_name || ""} ${item.last_name || ""}`.trim() ||
            item.username ||
            "User";
          const avatarUrl =
            item.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=313244&color=cdd6f4`;
          return (
            <div
              key={item.id}
              className="bg-[#1e1e2e] border border-[#313244] rounded-2xl p-4 hover:border-[#89dceb] transition cursor-pointer"
              onClick={() => openProfile(item.id)}
            >
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={avatarUrl}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  alt=""
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[#cdd6f4] font-semibold text-sm">
                    {fullName}
                  </p>
                  <p className="text-[#bac2de] text-xs truncate">
                    {item.headline || item.email}
                  </p>
                  {item.location && (
                    <p className="text-[#bac2de] text-xs flex items-center gap-1 mt-0.5">
                      <MapPin size={9} />
                      {item.location}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[
                  {
                    label: "Certs",
                    value: item.certificates_count,
                    color: "text-[#a6e3a1]",
                  },
                  {
                    label: "Courses",
                    value: item.courses_completed,
                    color: "text-[#89b4fa]",
                  },
                  {
                    label: "Hackathons",
                    value: item.hackathons,
                    color: "text-[#f38ba8]",
                  },
                  {
                    label: "Workshops",
                    value: item.workshops,
                    color: "text-[#fab387]",
                  },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="bg-[#313244]/40 rounded-xl p-2 text-center"
                  >
                    <p className={`text-sm font-bold ${color}`}>{value ?? 0}</p>
                    <p className="text-[#bac2de] text-[9px] mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Projects badge */}
              {item.projects_count > 0 && (
                <div className="flex items-center gap-1.5 text-[#cba6f7] text-xs mb-2">
                  <Code size={10} />
                  {item.projects_count} project
                  {item.projects_count > 1 ? "s" : ""}
                </div>
              )}

              {/* Skills */}
              {item.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {item.skills.slice(0, 3).map((s) => (
                    <span
                      key={s}
                      className="text-[10px] bg-[#89dceb]/15 text-[#89dceb] px-2 py-0.5 rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                  {item.skills.length > 3 && (
                    <span className="text-[10px] text-[#7f849c]">
                      +{item.skills.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-3 bg-[#1e1e2e] border border-[#313244] rounded-2xl py-16 text-center">
            <UserCheck size={32} className="mx-auto mb-3 text-[#313244]" />
            <p className="text-sm text-[#bac2de]">
              No certified candidates yet
            </p>
          </div>
        )}
      </div>

      {/* Candidate Profile Modal */}
      {(profile || profileLoading) && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setProfile(null);
            setProfileLoading(false);
          }}
        >
          <div
            className="bg-[#1e1e2e] border border-[#313244] rounded-2xl w-full max-w-2xl max-h-[88vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {profileLoading ? (
              <div className="p-16 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-[#89dceb] border-t-transparent animate-spin" />
              </div>
            ) : (
              profile && (
                <>
                  {/* Header */}
                  <div className="p-6 border-b border-[#313244]">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            profile.profile?.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(`${profile.profile?.first_name || ""} ${profile.profile?.last_name || ""}`.trim() || "U")}&background=89dceb&color=11111b&size=200`
                          }
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-[#313244]"
                          alt=""
                        />
                        <div>
                          <h2 className="text-[#cdd6f4] font-bold text-lg">
                            {profile.profile?.first_name}{" "}
                            {profile.profile?.last_name}
                          </h2>
                          {profile.profile?.headline && (
                            <p className="text-[#89dceb] text-sm font-medium">
                              {profile.profile.headline}
                            </p>
                          )}
                          {profile.profile?.location && (
                            <p className="text-[#bac2de] text-xs flex items-center gap-1 mt-1">
                              <MapPin size={10} />
                              {profile.profile.location}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            {profile.profile?.github && (
                              <a
                                href={profile.profile.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#bac2de] hover:text-[#cdd6f4]"
                              >
                                <GitBranch size={14} />
                              </a>
                            )}
                            {profile.profile?.linkedin && (
                              <a
                                href={profile.profile.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#bac2de] hover:text-[#89b4fa]"
                              >
                                <Link size={14} />
                              </a>
                            )}
                            {profile.profile?.website && (
                              <a
                                href={profile.profile.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#bac2de] hover:text-[#a6e3a1]"
                              >
                                <Globe size={14} />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setProfile(null)}
                        className="text-[#7f849c] hover:text-[#cdd6f4] transition p-1"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {profile.profile?.bio && (
                      <p className="text-[#bac2de] text-sm mt-4 leading-relaxed">
                        {profile.profile.bio}
                      </p>
                    )}

                    {profile.profile?.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {profile.profile.skills.map((s) => (
                          <span
                            key={s}
                            className="text-[11px] bg-[#89dceb]/15 text-[#89dceb] px-2.5 py-1 rounded-full"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        {
                          label: "Enrolled",
                          value: profile.courses_enrolled,
                          color: "text-[#89b4fa]",
                        },
                        {
                          label: "Completed",
                          value: profile.courses_completed,
                          color: "text-[#a6e3a1]",
                        },
                        {
                          label: "Hackathons",
                          value: profile.hackathons,
                          color: "text-[#f38ba8]",
                        },
                        {
                          label: "Workshops",
                          value: profile.workshops,
                          color: "text-[#fab387]",
                        },
                      ].map(({ label, value, color }) => (
                        <div
                          key={label}
                          className="bg-[#11111b] rounded-xl p-3 text-center"
                        >
                          <p className={`text-xl font-bold ${color}`}>
                            {value ?? 0}
                          </p>
                          <p className="text-[#7f849c] text-xs mt-1">{label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Platform Certificates */}
                    <div>
                      <p className="text-[#bac2de] text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-2">
                        <GraduationCap size={12} className="text-[#a6e3a1]" />
                        Platform Certificates
                        <span className="ml-auto text-[#a6e3a1] font-bold normal-case">
                          {profile.certificates?.length || 0}
                        </span>
                      </p>
                      {profile.certificates?.length > 0 ? (
                        <div className="space-y-2">
                          {profile.certificates.map((cert) => (
                            <div
                              key={cert.id}
                              className="flex items-center gap-3 bg-[#313244]/50 rounded-xl px-3 py-2.5"
                            >
                              <div className="w-8 h-8 rounded-lg bg-[#a6e3a1]/20 flex items-center justify-center flex-shrink-0">
                                <GraduationCap
                                  size={13}
                                  className="text-[#a6e3a1]"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[#cdd6f4] text-xs font-medium truncate">
                                  {cert.course_title}
                                </p>
                                <p className="text-[#7f849c] text-[10px] font-mono">
                                  {cert.certificate_id}
                                </p>
                              </div>
                              <span className="text-[#bac2de] text-[10px] flex-shrink-0">
                                {new Date(cert.issued_at).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[#7f849c] text-xs bg-[#11111b] rounded-xl px-3 py-4 text-center">
                          No platform certificates yet
                        </p>
                      )}
                    </div>

                    {/* Extra Certificates (uploaded) */}
                    {profile.extra_certificates?.length > 0 && (
                      <div>
                        <p className="text-[#bac2de] text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-2">
                          <GraduationCap size={12} className="text-[#cba6f7]" />
                          External Certificates
                          <span className="ml-auto text-[#cba6f7] font-bold normal-case">
                            {profile.extra_certificates.length}
                          </span>
                        </p>
                        <div className="space-y-2">
                          {profile.extra_certificates.map((cert) => (
                            <div
                              key={cert.id}
                              className="flex items-center gap-3 bg-[#313244]/50 rounded-xl px-3 py-2.5"
                            >
                              <div className="w-8 h-8 rounded-lg bg-[#cba6f7]/20 flex items-center justify-center flex-shrink-0">
                                <GraduationCap
                                  size={13}
                                  className="text-[#cba6f7]"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[#cdd6f4] text-xs font-medium truncate">
                                  {cert.title}
                                </p>
                                {cert.issuer && (
                                  <p className="text-[#7f849c] text-[10px]">
                                    {cert.issuer}
                                  </p>
                                )}
                              </div>
                              {cert.file_url && (
                                <a
                                  href={cert.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-[#cba6f7] hover:underline flex-shrink-0"
                                >
                                  View
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects */}
                    {profile.projects?.length > 0 && (
                      <div>
                        <p className="text-[#bac2de] text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Code size={12} className="text-[#cba6f7]" />
                          Projects
                          <span className="ml-auto text-[#cba6f7] font-bold normal-case">
                            {profile.projects.length}
                          </span>
                        </p>
                        <div className="space-y-2">
                          {profile.projects.map((p) => (
                            <div
                              key={p.id}
                              className="bg-[#313244]/50 rounded-xl px-3 py-3"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-[#cdd6f4] text-xs font-semibold">
                                    {p.title}
                                  </p>
                                  {p.description && (
                                    <p className="text-[#7f849c] text-[11px] mt-0.5 line-clamp-2">
                                      {p.description}
                                    </p>
                                  )}
                                  {p.tech_stack?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                      {p.tech_stack.map((t) => (
                                        <span
                                          key={t}
                                          className="text-[9px] bg-[#cba6f7]/15 text-[#cba6f7] px-1.5 py-0.5 rounded"
                                        >
                                          {t}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2 ml-3 flex-shrink-0">
                                  {p.github_url && (
                                    <a
                                      href={p.github_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[#bac2de] hover:text-[#cdd6f4]"
                                    >
                                      <GitBranch size={13} />
                                    </a>
                                  )}
                                  {p.live_url && (
                                    <a
                                      href={p.live_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[#bac2de] hover:text-[#a6e3a1]"
                                    >
                                      <Globe size={13} />
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Event participations */}
                    {profile.events?.length > 0 && (
                      <div>
                        <p className="text-[#bac2de] text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Calendar size={12} className="text-[#f38ba8]" />
                          Event Participation
                          <span className="ml-auto text-[#f38ba8] font-bold normal-case">
                            {profile.events.length}
                          </span>
                        </p>
                        <div className="space-y-1.5">
                          {profile.events.map((e) => (
                            <div
                              key={e.id}
                              className="flex items-center justify-between py-1.5 border-b border-[#313244]/50 last:border-0"
                            >
                              <div>
                                <p className="text-[#cdd6f4] text-xs font-medium">
                                  {e.title}
                                </p>
                                <p className="text-[#7f849c] text-[10px]">
                                  {new Date(e.start_date).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                                    e.event_type === "hackathon"
                                      ? "bg-[#f38ba8]/15 text-[#f38ba8]"
                                      : e.event_type === "workshop"
                                        ? "bg-[#fab387]/15 text-[#fab387]"
                                        : "bg-[#89b4fa]/15 text-[#89b4fa]"
                                  }`}
                                >
                                  {e.event_type}
                                </span>
                                <span className="text-[10px] text-[#a6e3a1] capitalize">
                                  {e.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Application history */}
                    {profile.application_history?.length > 0 && (
                      <div>
                        <p className="text-[#bac2de] text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Briefcase size={12} />
                          Application History
                        </p>
                        <div className="space-y-1.5">
                          {profile.application_history.map((a, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between py-1.5 border-b border-[#313244]/50 last:border-0"
                            >
                              <div>
                                <p className="text-[#cdd6f4] text-xs font-medium">
                                  {a.job}
                                </p>
                                <p className="text-[#7f849c] text-[10px]">
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
                  </div>
                </>
              )
            )}
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
