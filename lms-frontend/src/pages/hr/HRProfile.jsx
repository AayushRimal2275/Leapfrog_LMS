import { useEffect, useState } from "react";
import {
  Mail,
  MapPin,
  Globe,
  FileText,
  Plus,
  X,
  Save,
  Pencil,
  Briefcase,
  GitBranch,
  Link,
  User,
  Key,
  ClipboardList,
  Users,
  CheckCircle,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

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
    "w-full bg-[#313244] border border-[#45475a] rounded-xl py-2.5 text-sm text-[#cdd6f4] placeholder-[#45475a] focus:outline-none focus:border-[#89dceb] transition " +
    (Icon ? "pl-9 pr-3.5" : "px-3.5");
  return (
    <div>
      {label && (
        <label className="block text-xs text-[#9399b2] font-medium mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-2.5 text-[#9399b2] pointer-events-none flex">
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

export default function HRProfile() {
  const { refreshUser } = useAuth();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [newSkill, setNewSkill] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    Promise.all([api.get("/profile/"), api.get("/hr/dashboard/")])
      .then(([profileRes, statsRes]) => {
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
        setStats(statsRes.data);
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

  if (!user)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-4 border-[#89dceb] border-t-transparent animate-spin" />
      </div>
    );

  const fullName =
    `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username;
  const avatarUrl =
    user.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=89dceb&color=11111b&size=200`;

  return (
    <div className="max-w-3xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#cdd6f4]">HR Profile</h1>
          <p className="text-[#9399b2] text-sm mt-0.5">
            {editing ? "Editing your profile" : "Your recruiter account"}
          </p>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                onClick={() => setEditing(false)}
                className="border border-[#313244] text-[#9399b2] px-3 py-2 rounded-xl text-sm hover:bg-[#1e1e2e] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-[#89dceb] text-[#11111b] px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
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

      {/* HR Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "My Jobs",
              value: stats.my_jobs_total,
              color: "text-[#89dceb]",
            },
            {
              label: "Active Jobs",
              value: stats.my_jobs_active,
              color: "text-[#a6e3a1]",
            },
            {
              label: "Total Apps",
              value: stats.total_applications,
              color: "text-[#fab387]",
            },
            {
              label: "Talent Pool",
              value: stats.talent_pool_size,
              color: "text-[#cba6f7]",
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-[#1e1e2e] border border-[#313244] rounded-xl p-3 text-center"
            >
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-[#585b70] text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pipeline quick view */}
      {stats?.pipeline && (
        <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl px-5 py-3 flex items-center gap-6 flex-wrap">
          <span className="text-[#9399b2] text-xs font-medium uppercase tracking-wider">
            Pipeline
          </span>
          {Object.entries(stats.pipeline).map(([status, count]) => {
            const colors = {
              applied: "text-[#89b4fa]",
              interview: "text-[#fab387]",
              hired: "text-[#a6e3a1]",
              rejected: "text-[#f38ba8]",
            };
            return (
              <div key={status} className="flex items-center gap-1.5">
                <span className={`font-bold text-lg ${colors[status]}`}>
                  {count}
                </span>
                <span className="text-[#585b70] text-xs capitalize">
                  {status}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Role badge */}
      <div className="bg-[#89dceb]/10 border border-[#89dceb]/30 rounded-xl px-4 py-2.5 flex items-center gap-2">
        <Users size={15} className="text-[#89dceb]" />
        <span className="text-[#89dceb] text-sm font-medium">
          HR / Recruiter Account
        </span>
        <span className="text-[#9399b2] text-xs ml-auto">
          Hiring & talent management
        </span>
      </div>

      {/* Profile card */}
      <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-[#89dceb]/30 via-[#89b4fa]/30 to-[#cba6f7]/30" />
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-5">
            <img
              src={avatarUrl}
              alt={fullName}
              className="w-20 h-20 rounded-2xl border-4 border-[#1e1e2e] object-cover"
            />
            <span className="text-[10px] bg-[#89dceb]/20 text-[#89dceb] px-2 py-0.5 rounded-full font-medium mb-1">
              HR
            </span>
          </div>

          {!editing && (
            <div>
              <h2 className="text-xl font-bold text-[#cdd6f4]">{fullName}</h2>
              {user.headline && (
                <p className="text-[#89dceb] text-sm mt-0.5 font-medium">
                  {user.headline}
                </p>
              )}
              <div className="flex flex-col gap-1 mt-2">
                {user.email && (
                  <p className="text-[#9399b2] text-xs flex items-center gap-1.5">
                    <Mail size={12} />
                    {user.email}
                  </p>
                )}
                {user.location && (
                  <p className="text-[#9399b2] text-xs flex items-center gap-1.5">
                    <MapPin size={12} />
                    {user.location}
                  </p>
                )}
              </div>
              {user.bio && (
                <p className="text-[#a6adc8] text-sm mt-3 leading-relaxed">
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
                      className="flex items-center gap-1.5 text-[#9399b2] hover:text-[#cdd6f4] transition text-xs"
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
                      className="flex items-center gap-1.5 text-[#9399b2] hover:text-[#89b4fa] transition text-xs"
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
                      className="flex items-center gap-1.5 text-[#9399b2] hover:text-[#a6e3a1] transition text-xs"
                    >
                      <Globe size={14} />
                      Website
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

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
                placeholder="e.g. Senior Recruiter @ Leapfrog"
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
                placeholder="About you as a recruiter..."
                textarea
              />
              <div className="space-y-2.5">
                <p className="text-xs text-[#9399b2] font-medium uppercase tracking-wider">
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

      {/* Skills */}
      <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl p-5">
        <h3 className="text-[#cdd6f4] font-semibold mb-4 flex items-center gap-2">
          <FileText size={15} className="text-[#89dceb]" />
          Skills & Expertise
        </h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {user.skills.length === 0 && !editing && (
            <p className="text-[#9399b2] text-sm">No skills added.</p>
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
                  className="text-[#9399b2] hover:text-[#f38ba8] transition"
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
              className="flex-1 bg-[#313244] border border-[#45475a] rounded-xl py-2.5 px-3.5 text-sm text-[#cdd6f4] placeholder-[#45475a] focus:outline-none focus:border-[#89dceb] transition"
              placeholder="e.g. Talent Acquisition, Screening..."
            />
            <button
              onClick={addSkill}
              className="bg-[#89dceb]/20 text-[#89dceb] border border-[#89dceb]/30 px-4 py-2.5 rounded-xl text-sm hover:bg-[#89dceb]/30 transition"
            >
              <Plus size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Account info */}
      <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl p-5">
        <h3 className="text-[#cdd6f4] font-semibold mb-4 flex items-center gap-2">
          <Key size={15} className="text-[#fab387]" />
          Account Info
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-[#313244]">
            <span className="text-[#9399b2]">Username</span>
            <span className="text-[#cdd6f4] font-mono text-xs">
              {user.username}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[#313244]">
            <span className="text-[#9399b2]">Role</span>
            <span className="text-[#89dceb] font-medium text-xs uppercase">
              HR / Recruiter
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-[#9399b2]">Email</span>
            <span className="text-[#cdd6f4] text-xs">{user.email}</span>
          </div>
        </div>
        <p className="text-[#585b70] text-xs mt-4">
          To change your password, contact your system administrator.
        </p>
      </div>
    </div>
  );
}
