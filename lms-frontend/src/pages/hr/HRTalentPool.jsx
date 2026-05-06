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
      .finally(() => setLoading(false));
  };
  useEffect(load, [courseFilter]);

  const filtered = search
    ? talent.filter(
        (t) =>
          t.user?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
          t.user?.username?.toLowerCase().includes(search.toLowerCase()) ||
          t.user?.headline?.toLowerCase().includes(search.toLowerCase()),
      )
    : talent;

  const openProfile = (userId) => {
    setProfileLoading(true);
    api
      .get(`/hr/talent-pool/${userId}/`)
      .then((r) => setProfile(r.data))
      .finally(() => setProfileLoading(false));
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-[#cdd6f4]">Talent Pool</h1>
        <p className="text-[#9399b2] text-sm mt-1">
          {filtered.length} certified candidates
        </p>
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
            placeholder="Search by name or headline..."
            className="w-full bg-[#1e1e2e] border border-[#313244] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#cdd6f4] placeholder-[#45475a] focus:outline-none focus:border-[#89dceb] transition"
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
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up stagger-2">
        {filtered.map((item, i) => (
          <div
            key={item.user?.id}
            className={`bg-[#1e1e2e] border border-[#313244] rounded-2xl p-4 hover:border-[#89dceb] transition cursor-pointer animate-fade-in-up stagger-${Math.min(i + 1, 5)}`}
            onClick={() => openProfile(item.user?.id)}
          >
            <div className="flex items-center gap-3 mb-4">
              <img
                src={
                  item.user?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(item.user?.first_name || item.user?.username || "U")}&background=313244&color=cdd6f4`
                }
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                alt=""
              />
              <div className="flex-1 min-w-0">
                <p className="text-[#cdd6f4] font-semibold text-sm">
                  {item.user?.first_name} {item.user?.last_name}
                </p>
                <p className="text-[#9399b2] text-xs truncate">
                  {item.user?.headline || item.user?.email}
                </p>
              </div>
            </div>

            {/* Certs */}
            <div className="space-y-1.5 mb-3">
              {item.certificates?.slice(0, 2).map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center gap-2 bg-[#313244]/50 rounded-lg px-2.5 py-1.5"
                >
                  <GraduationCap
                    size={12}
                    className="text-[#a6e3a1] flex-shrink-0"
                  />
                  <span className="text-[#a6e3a1] text-xs truncate">
                    {cert.course_title}
                  </span>
                </div>
              ))}
              {item.certificates?.length > 2 && (
                <p className="text-[#585b70] text-xs pl-1">
                  +{item.certificates.length - 2} more certificates
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-[#585b70]">
              <span className="flex items-center gap-1">
                <BookOpen size={11} /> {item.completed_courses} courses
              </span>
              <span className="flex items-center gap-1">
                <GraduationCap size={11} /> {item.certificates?.length} certs
              </span>
            </div>

            {/* Skills */}
            {item.user?.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {item.user.skills.slice(0, 3).map((s) => (
                  <span
                    key={s}
                    className="text-[10px] bg-[#89dceb]/15 text-[#89dceb] px-2 py-0.5 rounded-full"
                  >
                    {s}
                  </span>
                ))}
                {item.user.skills.length > 3 && (
                  <span className="text-[10px] text-[#585b70]">
                    +{item.user.skills.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 bg-[#1e1e2e] border border-[#313244] rounded-2xl py-16 text-center">
            <UserCheck size={32} className="mx-auto mb-3 text-[#313244]" />
            <p className="text-sm text-[#9399b2]">
              No certified candidates yet
            </p>
          </div>
        )}
      </div>

      {/* Candidate Profile Modal */}
      {(profile || profileLoading) && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setProfile(null)}
        >
          <div
            className="bg-[#1e1e2e] border border-[#313244] rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {profileLoading ? (
              <div className="p-10 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-[#89dceb] border-t-transparent animate-spin" />
              </div>
            ) : (
              <>
                {/* Profile header */}
                <div className="p-6 border-b border-[#313244]">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          profile.profile?.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.profile?.first_name || "U")}&background=313244&color=cdd6f4`
                        }
                        className="w-16 h-16 rounded-full object-cover"
                        alt=""
                      />
                      <div>
                        <h2 className="text-[#cdd6f4] font-bold text-lg">
                          {profile.profile?.first_name}{" "}
                          {profile.profile?.last_name}
                        </h2>
                        <p className="text-[#9399b2] text-sm">
                          {profile.profile?.headline}
                        </p>
                        <p className="text-[#585b70] text-xs mt-0.5">
                          {profile.profile?.location}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          {profile.profile?.github && (
                            <a
                              href={profile.profile.github}
                              target="_blank"
                              className="text-[#9399b2] hover:text-[#89dceb] transition"
                            >
                              <GitBranch size={14} />
                            </a>
                          )}
                          {profile.profile?.linkedin && (
                            <a
                              href={profile.profile.linkedin}
                              target="_blank"
                              className="text-[#9399b2] hover:text-[#89dceb] transition"
                            >
                              <Link size={14} />
                            </a>
                          )}
                          {profile.profile?.website && (
                            <a
                              href={profile.profile.website}
                              target="_blank"
                              className="text-[#9399b2] hover:text-[#89dceb] transition"
                            >
                              <Globe size={14} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setProfile(null)}
                      className="text-[#585b70] hover:text-[#cdd6f4] transition"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {profile.profile?.bio && (
                    <p className="text-[#9399b2] text-sm mt-4">
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

                <div className="p-6 space-y-5">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        label: "Courses Enrolled",
                        value: profile.courses_enrolled,
                      },
                      { label: "Completed", value: profile.courses_completed },
                      {
                        label: "Applications",
                        value: profile.total_applications,
                      },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="bg-[#11111b] rounded-xl p-3 text-center"
                      >
                        <p className="text-xl font-bold text-[#89dceb]">
                          {value}
                        </p>
                        <p className="text-[#585b70] text-xs mt-1">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Certificates */}
                  {profile.certificates?.length > 0 && (
                    <div>
                      <h3 className="text-[#cdd6f4] font-semibold text-sm mb-3">
                        Certificates
                      </h3>
                      <div className="space-y-2">
                        {profile.certificates.map((cert) => (
                          <div
                            key={cert.id}
                            className="flex items-center justify-between bg-[#313244]/50 rounded-xl px-3 py-2.5"
                          >
                            <div className="flex items-center gap-2">
                              <GraduationCap
                                size={14}
                                className="text-[#a6e3a1]"
                              />
                              <span className="text-[#cdd6f4] text-sm">
                                {cert.course_title}
                              </span>
                            </div>
                            <span className="text-[#585b70] text-xs">
                              {new Date(cert.issued_at).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Application history */}
                  {profile.application_history?.length > 0 && (
                    <div>
                      <h3 className="text-[#cdd6f4] font-semibold text-sm mb-3">
                        Application History
                      </h3>
                      <div className="space-y-2">
                        {profile.application_history.map((a, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between"
                          >
                            <div>
                              <p className="text-[#cdd6f4] text-xs font-medium">
                                {a.job}
                              </p>
                              <p className="text-[#585b70] text-xs">
                                {a.company}
                              </p>
                            </div>
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
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
