import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Briefcase,
  User,
  GraduationCap,
  FileCheck,
  LogOut,
  Layers,
  Users,
  Settings,
  UserCheck,
  ClipboardList,
  Calendar,
  Bell,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const customerNav = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/courses", icon: BookOpen, label: "Courses" },
  { to: "/my-courses", icon: Layers, label: "My Learning" },
  { to: "/jobs", icon: Briefcase, label: "Jobs" },
  { to: "/my-applications", icon: FileCheck, label: "Applications" },
  { to: "/events", icon: Calendar, label: "Events" },
  { to: "/certificates", icon: GraduationCap, label: "Certificates" },
  { to: "/profile", icon: User, label: "Profile" },
];

const adminNav = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/courses", icon: BookOpen, label: "Courses" },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/categories", icon: Settings, label: "Categories" },
  { to: "/admin/events", icon: Calendar, label: "Events" },
  { to: "/admin/profile", icon: User, label: "Profile" },
];

const hrNav = [
  { to: "/hr", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/hr/jobs", icon: Briefcase, label: "Jobs" },
  { to: "/hr/applications", icon: ClipboardList, label: "Applications" },
  { to: "/hr/talent-pool", icon: UserCheck, label: "Talent Pool" },
  { to: "/hr/profile", icon: User, label: "Profile" },
];

const roleAccentColor = {
  admin: "#f38ba8", // red - power
  hr: "#89dceb", // teal - people
  customer: "#cba6f7", // purple - default
};

export default function Sidebar() {
  const { user, logout, isAdmin, isHR } = useAuth();

  const navItems = isAdmin ? adminNav : isHR ? hrNav : customerNav;
  const accent = roleAccentColor[user?.role] || "#cba6f7";
  const roleLabel = isAdmin ? "Admin Panel" : isHR ? "HR Panel" : "Connect LMS";

  return (
    <div className="w-64 bg-[#181825] border-r border-[#313244] flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-[#313244]">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${accent}, #89b4fa)`,
            }}
          >
            <GraduationCap size={16} className="text-[#11111b]" />
          </div>
          <div>
            <p className="font-bold text-[#cdd6f4] text-sm leading-tight">
              Leapfrog
            </p>
            <p className="text-[10px] text-[#9399b2] leading-tight">
              {roleLabel}
            </p>
          </div>
        </div>
        {/* Role badge */}
        {user?.role !== "customer" && (
          <div
            className="mt-3 text-[10px] font-semibold px-2 py-1 rounded-lg inline-block uppercase tracking-wider"
            style={{ background: accent + "22", color: accent }}
          >
            {user?.role}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to + label}
            to={to}
            end={to === "/" || to === "/admin" || to === "/hr"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#313244] text-[--accent]"
                  : "text-[#a6adc8] hover:bg-[#1e1e2e] hover:text-[#cdd6f4]"
              }`
            }
            style={({ isActive }) => (isActive ? { color: accent } : {})}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-[#313244]">
        <div className="flex items-center gap-3 mb-3">
          <img
            src={
              user?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.first_name || user?.username || "U")}&background=313244&color=cdd6f4`
            }
            className="w-8 h-8 rounded-full object-cover"
            alt="avatar"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[#cdd6f4] text-xs font-medium truncate">
              {user?.first_name || user?.username}
            </p>
            <p className="text-[#9399b2] text-[10px] truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-xs text-[#a6adc8] hover:text-[#f38ba8] transition w-full px-2 py-1.5 rounded-lg hover:bg-[#1e1e2e]"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </div>
  );
}
