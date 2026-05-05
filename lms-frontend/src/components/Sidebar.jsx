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
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/courses", icon: BookOpen, label: "Courses" },
  { to: "/my-courses", icon: Layers, label: "My Learning" },
  { to: "/jobs", icon: Briefcase, label: "Jobs" },
  { to: "/my-applications", icon: FileCheck, label: "Applications" },
  { to: "/certificates", icon: GraduationCap, label: "Certificates" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <div className="w-64 bg-[#181825] border-r border-[#313244] flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-[#313244]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#cba6f7] to-[#89b4fa] flex items-center justify-center">
            <GraduationCap size={16} className="text-[#11111b]" />
          </div>
          <div>
            <p className="font-bold text-[#cdd6f4] text-sm leading-tight">
              Leapfrog
            </p>
            {/* was #6c7086 — too dim; lifted to #9399b2 for readable subtitle */}
            <p className="text-[10px] text-[#9399b2] leading-tight">
              Connect LMS
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#313244] text-[#cba6f7]"
                  : /* inactive: was #6c7086 (barely readable) → #a6adc8 (soft lavender-gray, LMS-fitting) */
                    "text-[#a6adc8] hover:bg-[#1e1e2e] hover:text-[#cdd6f4]"
              }`
            }
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
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.first_name || user?.username || "U")}&background=cba6f7&color=11111b`
            }
            className="w-8 h-8 rounded-full object-cover"
            alt="avatar"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[#cdd6f4] text-xs font-medium truncate">
              {user?.first_name || user?.username}
            </p>
            {/* email: was #6c7086 → #9399b2 — visible but clearly secondary */}
            <p className="text-[#9399b2] text-[10px] truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          /* was #6c7086 → #a6adc8 so "Sign out" is legible, red on hover still works */
          className="flex items-center gap-2 text-xs text-[#a6adc8] hover:text-[#f38ba8] transition w-full px-2 py-1.5 rounded-lg hover:bg-[#1e1e2e]"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </div>
  );
}
