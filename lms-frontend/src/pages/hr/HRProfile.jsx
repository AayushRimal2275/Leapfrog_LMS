import { useEffect, useState } from "react";
import {
  Mail,
  MapPin,
  Globe,
  Plus,
  X,
  Save,
  Pencil,
  Link,
  GitBranch,
  Users,
  Briefcase,
  ClipboardList,
  UserCheck,
  TrendingUp,
  Shield,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

function Field({ icon: Icon, label, value, onChange, placeholder, textarea }) {
  const base =
    "w-full bg-[#11111b] border border-[#313244] rounded-xl py-2.5 text-sm text-[#cdd6f4] placeholder-[#45475a] focus:outline-none focus:border-[#89dceb] transition ";
  return (
    <div>
      {label && (
        <label className="block text-xs text-[#9399b2] font-medium mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-2.5 text-[#585b70] pointer-events-none">
            <Icon size={14} />
          </span>
        )}
        {textarea ? (
          <textarea
            value={value}
            onChange={onChange}
            rows={3}
            placeholder={placeholder}
            className={base + (Icon ? "pl-9 pr-3" : "px-3") + " resize-none"}
          />
        ) : (
          <input
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={base + (Icon ? "pl-9 pr-3" : "px-3")}
          />
        )}
      </div>
    </div>
  );
}

export default function HRProfile() {
  const { user: authUser, refreshUser } = useAuth();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [newSkill, setNewSkill] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.get("/profile/"), api.get("/hr/dashboard/")])
      .then(([p, s]) => {
        const d = p.data;
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
        setStats(s.data);
      })
      .catch(() => toast.error("Failed to load profile"));
  }, []);

  const set = (k) => (e) => setUser((u) => ({ ...u, [k]: e.target.value }));

  const addSkill = () => {
    const t = newSkill.trim();
    if (!t) return;
    if (user.skills.includes(t)) return toast.error("Already added");
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
    } catch (err) {
      toast.error(err.response?.data?.detail || "Save failed");
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
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=313244&color=89dceb&size=200`;

  const statCards = [
    {
      label: "Active Jobs",
      value: stats?.my_jobs_active ?? "—",
      icon: Briefcase,
      color: "#89dceb",
    },
    {
      label: "Applications",
      value: stats?.total_applications ?? "—",
      icon: ClipboardList,
      color: "#fab387",
    },
    {
      label: "Hired",
      value: stats?.pipeline?.hired ?? "—",
      icon: TrendingUp,
      color: "#a6e3a1",
    },
    {
      label: "Talent Pool",
      value: stats?.talent_pool_size ?? "—",
      icon: UserCheck,
      color: "#cba6f7",
    },
  ];

  return (
    <div className="max-w-3xl space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-[#cdd6f4]">My Profile</h1>
          <p className="text-[#9399b2] text-sm mt-0.5">
            {editing ? "Editing your HR profile" : "Your HR profile & stats"}
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
                className="flex items-center gap-2 bg-[#89dceb] text-[#11111b] font-semibold px-4 py-2 rounded-xl text-sm hover:opacity-90 transition disabled:opacity-60"
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

      {/* Profile card */}
      <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl overflow-hidden animate-fade-in-up stagger-1">
        {/* Teal banner */}
        <div
          className="h-24 relative"
          style={{
            background: "linear-gradient(135deg, #89dceb33, #cba6f722)",
          }}
        >
          <div className="absolute top-3 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#89dceb]/20 text-[#89dceb] border border-[#89dceb]/30">
            <Users size={11} /> HR Team
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="-mt-10 mb-5">
            <img
              src={avatarUrl}
              alt={fullName}
              className="w-20 h-20 rounded-2xl border-4 border-[#1e1e2e] object-cover"
            />
          </div>

          {!editing ? (
            <div>
              <h2 className="text-xl font-bold text-[#cdd6f4]">{fullName}</h2>
              {user.headline && (
                <p className="text-[#89dceb] text-sm font-medium mt-0.5">
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
                      className="flex items-center gap-1.5 text-[#9399b2] hover:text-[#cdd6f4] text-xs transition"
                    >
                      <GitBranch size={13} />
                      GitHub
                    </a>
                  )}
                  {user.linkedin && (
                    <a
                      href={user.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[#9399b2] hover:text-[#89b4fa] text-xs transition"
                    >
                      <Link size={13} />
                      LinkedIn
                    </a>
                  )}
                  {user.website && (
                    <a
                      href={user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[#9399b2] hover:text-[#a6e3a1] text-xs transition"
                    >
                      <Globe size={13} />
                      Website
                    </a>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Field
                label="Avatar URL"
                value={user.avatar}
                onChange={set("avatar")}
                placeholder="https://..."
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
                label="Headline / Title"
                value={user.headline}
                onChange={set("headline")}
                placeholder="e.g. HR Manager at Leapfrog"
              />
              <Field
                icon={Mail}
                label="Email"
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
                placeholder="About you..."
                textarea
              />
              <div className="space-y-2">
                <p className="text-xs text-[#9399b2] font-medium uppercase tracking-wider">
                  Social Links
                </p>
                <Field
                  icon={GitBranch}
                  value={user.github}
                  onChange={set("github")}
                  placeholder="https://github.com/..."
                />
                <Field
                  icon={Link}
                  value={user.linkedin}
                  onChange={set("linkedin")}
                  placeholder="https://linkedin.com/in/..."
                />
                <Field
                  icon={Globe}
                  value={user.website}
                  onChange={set("website")}
                  placeholder="https://..."
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* HR Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-in-up stagger-2">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-[#1e1e2e] border border-[#313244] rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[#9399b2] text-xs">{label}</p>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: color + "22" }}
              >
                <Icon size={13} style={{ color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#cdd6f4]">{value}</p>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl p-5 animate-fade-in-up stagger-3">
        <h3 className="text-[#cdd6f4] font-semibold mb-4 text-sm">
          Skills & Expertise
        </h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {user.skills.length === 0 && !editing && (
            <p className="text-[#585b70] text-sm">No skills listed yet.</p>
          )}
          {user.skills.map((s, i) => (
            <span
              key={i}
              className="flex items-center gap-1.5 bg-[#89dceb]/15 text-[#89dceb] px-3 py-1.5 rounded-xl text-xs font-medium"
            >
              {s}
              {editing && (
                <button
                  onClick={() => removeSkill(i)}
                  className="hover:text-[#f38ba8] transition"
                >
                  <X size={10} />
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
              className="flex-1 bg-[#11111b] border border-[#313244] rounded-xl py-2.5 px-3 text-sm text-[#cdd6f4] placeholder-[#45475a] focus:outline-none focus:border-[#89dceb] transition"
              placeholder="Add a skill, press Enter"
            />
            <button
              onClick={addSkill}
              className="px-4 py-2.5 rounded-xl bg-[#89dceb]/20 text-[#89dceb] border border-[#89dceb]/30 hover:bg-[#89dceb]/30 transition"
            >
              <Plus size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Account Info */}
      <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl p-5 animate-fade-in-up stagger-4">
        <h3 className="text-[#cdd6f4] font-semibold mb-3 text-sm flex items-center gap-2">
          <Shield size={14} className="text-[#89dceb]" /> Account Info
        </h3>
        <div className="space-y-2 text-sm">
          {[
            [
              "Role",
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#89dceb]/20 text-[#89dceb]">
                HR
              </span>,
            ],
            [
              "Username",
              <span className="text-[#cdd6f4] font-mono text-xs">
                @{user.username?.split("@")[0]}
              </span>,
            ],
            [
              "Email",
              <span className="text-[#9399b2] text-xs">{user.email}</span>,
            ],
            [
              "Status",
              <span className="text-[#a6e3a1] text-xs font-medium">
                Active
              </span>,
            ],
          ].map(([label, val], i, arr) => (
            <div
              key={label}
              className={`flex justify-between items-center py-2 ${i < arr.length - 1 ? "border-b border-[#313244]" : ""}`}
            >
              <span className="text-[#9399b2]">{label}</span>
              {val}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
