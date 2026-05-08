import { useEffect, useState } from "react";
import {
  Mail,
  MapPin,
  Globe,
  FileText,
  Plus,
  X,
  Save,
  Download,
  Pencil,
  GraduationCap,
  Briefcase,
  Flame,
  Link,
  User,
  GitBranch,
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

function Field({
  icon: Icon,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  textarea,
}) {
  const inputClass =
    "w-full bg-[#313244] border border-[#45475a] rounded-xl py-2.5 text-sm text-[#cdd6f4] placeholder-[#6c7086] focus:outline-none focus:border-[#cba6f7] transition " +
    (Icon ? "pl-9 pr-3.5" : "px-3.5");

  return (
    <div>
      {label && (
        <label className="block text-xs text-[#bac2de] font-medium mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-2.5 text-[#bac2de] pointer-events-none flex">
            <Icon size={14} />
          </span>
        )}
        {textarea ? (
          <textarea
            value={value}
            onChange={onChange}
            rows={3}
            placeholder={placeholder}
            className={inputClass + " resize-none"}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={inputClass}
          />
        )}
      </div>
    </div>
  );
}

export default function Profile() {
  const { refreshUser } = useAuth();
  const [user, setUser] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [applications, setApplications] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/profile/"),
      api.get("/my-certificates/"),
      api.get("/my-applications/"),
    ])
      .then(([profileRes, certsRes, appsRes]) => {
        const d = profileRes.data;
        setUser({
          ...d,
          skills: Array.isArray(d.skills) ? d.skills : [],
          bio: d.bio || "",
          headline: d.headline || "",
          location: d.location || "",
          github: d.github || "",
          linkedin: d.linkedin || "",
          website: d.website || "",
          avatar: d.avatar || "",
        });
        setCertificates(certsRes.data);
        setApplications(appsRes.data);
      })
      .catch(() => toast.error("Failed to load profile"));
  }, []);

  const set = (k) => (e) => setUser((u) => ({ ...u, [k]: e.target.value }));

  const addSkill = () => {
    const t = newSkill.trim();
    if (!t) return;
    if (user.skills.includes(t)) return toast.error("Skill already added");
    setUser((u) => ({ ...u, skills: [...u.skills, t] }));
    setNewSkill("");
  };

  const removeSkill = (i) =>
    setUser((u) => ({ ...u, skills: u.skills.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put("/profile/update/", {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        bio: user.bio,
        headline: user.headline,
        location: user.location,
        github: user.github,
        linkedin: user.linkedin,
        website: user.website,
        avatar: user.avatar,
        skills: user.skills,
      });
      setUser((u) => ({
        ...u,
        ...res.data,
        skills: Array.isArray(res.data.skills) ? res.data.skills : u.skills,
      }));
      await refreshUser();
      toast.success("Profile updated!");
      setEditing(false);
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const downloadCV = () => {
    const fullName =
      `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
      user.username;
    const lines = [
      "CURRICULUM VITAE",
      "================",
      "",
      fullName,
      user.headline || "",
      user.email,
      user.location ? `Location: ${user.location}` : "",
      user.github ? `GitHub: ${user.github}` : "",
      user.linkedin ? `LinkedIn: ${user.linkedin}` : "",
      user.website ? `Website: ${user.website}` : "",
      "",
      "ABOUT",
      "-----",
      user.bio || "No bio provided.",
      "",
      "SKILLS",
      "------",
      user.skills.length ? user.skills.join(" • ") : "No skills listed.",
      "",
      "CERTIFICATES",
      "------------",
      ...(certificates.length
        ? certificates.map(
            (c) =>
              `[x] ${c.course_title}  |  ${c.certificate_id}  |  ${new Date(c.issued_at).toLocaleDateString()}`,
          )
        : ["No certificates yet."]),
      "",
      "JOB APPLICATIONS",
      "----------------",
      ...(applications.length
        ? applications.map(
            (a) =>
              `- ${a.job.title} @ ${a.job.company} — ${a.status.toUpperCase()}`,
          )
        : ["No applications yet."]),
      "",
      "---",
      `Generated by Leapfrog Connect LMS • ${new Date().toLocaleDateString()}`,
    ].filter((l) => l !== undefined);

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fullName.replace(/\s+/g, "_")}_CV.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CV downloaded!");
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-4 border-[#cba6f7] border-t-transparent animate-spin" />
      </div>
    );
  }

  const fullName =
    `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username;
  const avatarUrl =
    user.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=cba6f7&color=11111b&size=200`;

  const statusColors = {
    applied: "bg-[#89b4fa]/20 text-[#89b4fa]",
    interview: "bg-[#fab387]/20 text-[#fab387]",
    hired: "bg-[#a6e3a1]/20 text-[#a6e3a1]",
    rejected: "bg-[#f38ba8]/20 text-[#f38ba8]",
  };

  return (
    <div className="max-w-3xl space-y-4">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#cdd6f4]">Profile</h1>
          <p className="text-[#bac2de] text-sm mt-0.5">
            {editing
              ? "Editing your profile"
              : "Your public professional profile"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={downloadCV}
            className="flex items-center gap-2 border border-[#313244] text-[#bac2de] hover:text-[#cdd6f4] px-3 py-2 rounded-xl text-sm hover:bg-[#1e1e2e] transition"
          >
            <Download size={14} />
            CV
          </button>
          {editing ? (
            <>
              <button
                onClick={() => setEditing(false)}
                className="border border-[#313244] text-[#bac2de] px-3 py-2 rounded-xl text-sm hover:bg-[#1e1e2e] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-gradient-to-r from-[#cba6f7] to-[#89b4fa] text-[#11111b] px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
              >
                <Save size={14} />
                {saving ? "Saving..." : "Save"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 bg-[#1e1e2e] border border-[#313244] text-[#cdd6f4] px-3 py-2 rounded-xl text-sm hover:bg-[#313244] transition"
            >
              <Pencil size={14} />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* ── Profile card ── */}
      <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-[#cba6f7]/30 via-[#89b4fa]/30 to-[#a6e3a1]/30" />

        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-5">
            <div className="relative">
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-20 h-20 rounded-2xl border-4 border-[#1e1e2e] object-cover"
              />
              {user.streak > 0 && (
                <div className="absolute -bottom-1 -right-1 bg-[#fab387] rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
                  <Flame size={9} className="text-white" />
                  <span className="text-white text-[9px] font-bold">
                    {user.streak}
                  </span>
                </div>
              )}
            </div>
            <div className="text-right pb-1">
              <p className="text-[#bac2de] text-xs">Public profile</p>
              <p className="text-[#7f849c] text-[10px] font-mono mt-0.5">
                /profile/
                {user.username?.toLowerCase().replace(/[^a-z0-9]/g, "-")}
              </p>
            </div>
          </div>

          {/* VIEW MODE */}
          {!editing && (
            <div>
              <h2 className="text-xl font-bold text-[#cdd6f4]">{fullName}</h2>
              {user.headline && (
                <p className="text-[#89b4fa] text-sm mt-0.5 font-medium">
                  {user.headline}
                </p>
              )}

              <div className="flex flex-col gap-1 mt-2">
                {user.email && (
                  <p className="text-[#bac2de] text-xs flex items-center gap-1.5">
                    <Mail size={12} className="flex-shrink-0" />
                    {user.email}
                  </p>
                )}
                {user.location && (
                  <p className="text-[#bac2de] text-xs flex items-center gap-1.5">
                    <MapPin size={12} className="flex-shrink-0" />
                    {user.location}
                  </p>
                )}
              </div>

              {user.bio && (
                <p className="text-[#cdd6f4] text-sm mt-3 leading-relaxed">
                  {user.bio}
                </p>
              )}

              {(user.github || user.linkedin || user.website) && (
                <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-[#313244]">
                  {user.github && (
                    <a
                      href={user.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[#bac2de] hover:text-[#cdd6f4] transition text-xs"
                    >
                      <GitBranch size={14} />
                      GitHub
                    </a>
                  )}
                  {user.linkedin && (
                    <a
                      href={user.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[#bac2de] hover:text-[#89b4fa] transition text-xs"
                    >
                      <Link size={14} />
                      LinkedIn
                    </a>
                  )}
                  {user.website && (
                    <a
                      href={user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[#bac2de] hover:text-[#a6e3a1] transition text-xs"
                    >
                      <Globe size={14} />
                      Website
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* EDIT MODE */}
          {editing && (
            <div className="space-y-4">
              <Field
                icon={User}
                label="Avatar URL"
                value={user.avatar}
                onChange={set("avatar")}
                placeholder="https://example.com/avatar.jpg"
              />

              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="First name"
                  value={user.first_name || ""}
                  onChange={set("first_name")}
                  placeholder="First name"
                />
                <Field
                  label="Last name"
                  value={user.last_name || ""}
                  onChange={set("last_name")}
                  placeholder="Last name"
                />
              </div>

              <Field
                label="Headline"
                value={user.headline}
                onChange={set("headline")}
                placeholder="e.g. Full Stack Developer | Node.js & React"
              />

              <Field
                icon={Mail}
                label="Email"
                type="email"
                value={user.email}
                onChange={set("email")}
              />

              <Field
                icon={MapPin}
                label="Location"
                value={user.location}
                onChange={set("location")}
                placeholder="Kathmandu, Nepal"
              />

              <Field
                label="Bio"
                value={user.bio}
                onChange={set("bio")}
                placeholder="Tell your story..."
                textarea
              />

              <div className="space-y-2.5">
                <p className="text-xs text-[#bac2de] font-medium uppercase tracking-wider">
                  Social links
                </p>
                <Field
                  icon={GitBranch}
                  value={user.github}
                  onChange={set("github")}
                  placeholder="https://github.com/username"
                />
                <Field
                  icon={Link}
                  value={user.linkedin}
                  onChange={set("linkedin")}
                  placeholder="https://linkedin.com/in/username"
                />
                <Field
                  icon={Globe}
                  value={user.website}
                  onChange={set("website")}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Skills ── */}
      <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl p-5">
        <h3 className="text-[#cdd6f4] font-semibold mb-4 flex items-center gap-2">
          <FileText size={15} className="text-[#cba6f7]" />
          Skills
        </h3>

        <div className="flex flex-wrap gap-2 mb-3">
          {user.skills.length === 0 && !editing && (
            <p className="text-[#bac2de] text-sm">No skills added yet.</p>
          )}
          {user.skills.map((skill, i) => (
            <span
              key={i}
              className="flex items-center gap-1.5 bg-[#313244] text-[#cdd6f4] px-3 py-1.5 rounded-xl text-xs font-medium"
            >
              {skill}
              {editing && (
                <button
                  onClick={() => removeSkill(i)}
                  className="text-[#bac2de] hover:text-[#f38ba8] transition"
                >
                  <X size={11} />
                </button>
              )}
            </span>
          ))}
        </div>

        {editing && (
          <div className="flex gap-2">
            <input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSkill()}
              className="flex-1 bg-[#313244] border border-[#45475a] rounded-xl py-2.5 px-3.5 text-sm text-[#cdd6f4] placeholder-[#6c7086] focus:outline-none focus:border-[#cba6f7] transition"
              placeholder="Type a skill and press Enter"
            />
            <button
              onClick={addSkill}
              className="bg-[#cba6f7]/20 text-[#cba6f7] border border-[#cba6f7]/30 px-4 py-2.5 rounded-xl text-sm hover:bg-[#cba6f7]/30 transition"
            >
              <Plus size={15} />
            </button>
          </div>
        )}
      </div>

      {/* ── Certificates ── */}
      <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl p-5">
        <h3 className="text-[#cdd6f4] font-semibold mb-4 flex items-center gap-2">
          <GraduationCap size={15} className="text-[#a6e3a1]" />
          Certificates
          <span className="ml-auto text-xs text-[#bac2de] font-normal">
            {certificates.length} earned
          </span>
        </h3>

        {certificates.length === 0 ? (
          <p className="text-[#bac2de] text-sm">
            No certificates yet. Complete a course and pass the exam.
          </p>
        ) : (
          <div className="space-y-2">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="flex items-center gap-3 bg-[#313244] rounded-xl p-3"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#a6e3a1]/20 to-[#89b4fa]/20 flex items-center justify-center flex-shrink-0">
                  <GraduationCap size={16} className="text-[#a6e3a1]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#cdd6f4] text-sm font-medium truncate">
                    {cert.course_title}
                  </p>
                  <p className="text-[#7f849c] text-[11px] font-mono mt-0.5">
                    {cert.certificate_id}
                  </p>
                </div>
                <p className="text-[#bac2de] text-xs flex-shrink-0">
                  {new Date(cert.issued_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Job Applications ── */}
      <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl p-5">
        <h3 className="text-[#cdd6f4] font-semibold mb-4 flex items-center gap-2">
          <Briefcase size={15} className="text-[#89b4fa]" />
          Job Applications
          <span className="ml-auto text-xs text-[#bac2de] font-normal">
            {applications.length} total
          </span>
        </h3>

        {applications.length === 0 ? (
          <p className="text-[#bac2de] text-sm">No applications yet.</p>
        ) : (
          <div className="space-y-2">
            {applications.map((app) => (
              <div
                key={app.id}
                className="flex items-center gap-3 bg-[#313244] rounded-xl p-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[#cdd6f4] text-sm font-medium">
                    {app.job.title}
                  </p>
                  <p className="text-[#bac2de] text-xs mt-0.5">
                    {app.job.company}
                    {app.job.location ? ` · ${app.job.location}` : ""}
                  </p>
                </div>
                <span
                  className={`flex-shrink-0 text-[10px] px-2.5 py-1 rounded-full font-medium capitalize ${
                    statusColors[app.status] || "bg-[#313244] text-[#bac2de]"
                  }`}
                >
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
