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
  X,
  Menu,
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
  admin: "#f38ba8",
  hr: "#89dceb",
  customer: "#cba6f7",
};

export default function Sidebar({
  open,
  onClose,
  collapsed,
  onToggleCollapse,
  onMobileOpen,
}) {
  const { user, logout, isAdmin, isHR } = useAuth();

  const navItems = isAdmin ? adminNav : isHR ? hrNav : customerNav;
  const accent = roleAccentColor[user?.role] || "#cba6f7";
  const roleLabel = isAdmin ? "Admin Panel" : isHR ? "HR Panel" : "Connect LMS";

  const sidebarContent = (isMobile = false) => (
    <div
      className="bg-[#181825] border-r border-[#313244] flex flex-col h-full transition-all duration-300"
      style={{ width: !isMobile && collapsed ? "68px" : "256px" }}
    >
      {/* Header */}
      <div className="p-4 border-b border-[#313244]">
        <div className="flex items-center justify-between">
          {/* Logo — hidden when collapsed on desktop */}
          {(!collapsed || isMobile) && (
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${accent}, #89b4fa)`,
                }}
              >
                <GraduationCap size={16} className="text-[#11111b]" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-[#cdd6f4] text-sm leading-tight">
                  Leapfrog
                </p>
                <p className="text-[10px] text-[#9399b2] leading-tight">
                  {roleLabel}
                </p>
              </div>
            </div>
          )}

          {/* Collapsed desktop — show only logo icon */}
          {collapsed && !isMobile && (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mx-auto"
              style={{
                background: `linear-gradient(135deg, ${accent}, #89b4fa)`,
              }}
            >
              <GraduationCap size={16} className="text-[#11111b]" />
            </div>
          )}

          {/* Toggle button */}
          {isMobile ? (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#585b70] hover:text-[#cdd6f4] hover:bg-[#313244] transition"
            >
              <X size={16} />
            </button>
          ) : (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-[#585b70] hover:text-[#cdd6f4] hover:bg-[#313244] transition flex-shrink-0"
              aria-label="Toggle sidebar"
            >
              <Menu size={16} />
            </button>
          )}
        </div>

        {(!collapsed || isMobile) && user?.role !== "customer" && (
          <div
            className="mt-3 text-[10px] font-semibold px-2 py-1 rounded-lg inline-block uppercase tracking-wider"
            style={{ background: accent + "22", color: accent }}
          >
            {user?.role}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to + label}
            to={to}
            end={to === "/" || to === "/admin" || to === "/hr"}
            onClick={isMobile ? onClose : undefined}
            title={collapsed && !isMobile ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                collapsed && !isMobile ? "justify-center" : ""
              } ${
                isActive
                  ? "bg-[#313244] text-[--accent]"
                  : "text-[#a6adc8] hover:bg-[#1e1e2e] hover:text-[#cdd6f4]"
              }`
            }
            style={({ isActive }) => (isActive ? { color: accent } : {})}
          >
            <Icon size={17} className="flex-shrink-0" />
            {(!collapsed || isMobile) && label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-[#313244]">
        {!collapsed || isMobile ? (
          <div className="flex items-center gap-3 mb-3">
            <img
              src={
                user?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.first_name || user?.username || "U")}&background=313244&color=cdd6f4`
              }
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              alt="avatar"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[#cdd6f4] text-xs font-medium truncate">
                {user?.first_name || user?.username}
              </p>
              <p className="text-[#9399b2] text-[10px] truncate">
                {user?.email}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-2">
            <img
              src={
                user?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.first_name || user?.username || "U")}&background=313244&color=cdd6f4`
              }
              className="w-8 h-8 rounded-full object-cover"
              alt="avatar"
            />
          </div>
        )}
        <button
          onClick={logout}
          title={collapsed && !isMobile ? "Sign out" : undefined}
          className={`flex items-center gap-2 text-xs text-[#a6adc8] hover:text-[#f38ba8] transition w-full px-2 py-1.5 rounded-lg hover:bg-[#1e1e2e] ${
            collapsed && !isMobile ? "justify-center" : ""
          }`}
        >
          <LogOut size={14} />
          {(!collapsed || isMobile) && "Sign out"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop — always visible, collapsible */}
      <div
        className="hidden lg:flex flex-shrink-0 h-screen sticky top-0 transition-all duration-300"
        style={{ width: collapsed ? "68px" : "256px" }}
      >
        {sidebarContent(false)}
      </div>

      {/* Mobile hamburger button — shown when sidebar is closed */}
      {!open && (
        <button
          onClick={onMobileOpen}
          className="lg:hidden fixed top-3 left-3 z-40 p-2 rounded-xl bg-[#181825] border border-[#313244] text-[#9399b2] hover:text-[#cdd6f4] transition"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Mobile — slide-in overlay */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={onClose}
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden flex">
            {sidebarContent(true)}
          </div>
        </>
      )}
    </>
  );
}
