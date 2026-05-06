import { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  Briefcase,
  GraduationCap,
  TrendingUp,
  UserCheck,
  UserX,
  BarChart2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/dashboard/")
      .then((r) => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const statCards = [
    {
      label: "Total Users",
      value: stats?.total_users ?? 0,
      icon: Users,
      color: "#cba6f7",
    },
    {
      label: "Active Courses",
      value: stats?.active_courses ?? 0,
      icon: BookOpen,
      color: "#89b4fa",
    },
    {
      label: "Active Jobs",
      value: stats?.active_jobs ?? 0,
      icon: Briefcase,
      color: "#a6e3a1",
    },
    {
      label: "Certificates Issued",
      value: stats?.total_certificates ?? 0,
      icon: GraduationCap,
      color: "#fab387",
    },
  ];

  const userRoleData = [
    { name: "Students", value: stats?.total_customers ?? 0, fill: "#cba6f7" },
    { name: "Admins", value: stats?.total_admins ?? 0, fill: "#f38ba8" },
    { name: "HR", value: stats?.total_hr ?? 0, fill: "#89dceb" },
  ];

  const appStatusData = stats?.applications_by_status
    ? Object.entries(stats.applications_by_status).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  const appColors = {
    applied: "#89b4fa",
    interview: "#fab387",
    hired: "#a6e3a1",
    rejected: "#f38ba8",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-[#cdd6f4]">
          Admin Dashboard <span className="text-[#f38ba8]">⚙️</span>
        </h1>
        <p className="text-[#9399b2] text-sm mt-1">
          Platform-wide overview — welcome back,{" "}
          {user?.first_name || user?.username}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }, i) => (
          <div
            key={label}
            className={`bg-[#1e1e2e] border border-[#313244] rounded-2xl p-4 hover:border-[#585b70] transition animate-fade-in-up stagger-${i + 1}`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[#bac2de] text-xs font-medium">{label}</p>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: color + "22" }}
              >
                <Icon size={15} style={{ color }} />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#cdd6f4]">{value}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-4 animate-fade-in-up stagger-3">
        {/* Application Pipeline */}
        <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={16} className="text-[#89b4fa]" />
            <h2 className="text-[#cdd6f4] font-semibold text-sm">
              Application Pipeline
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={appStatusData} barCategoryGap="35%">
              <XAxis
                dataKey="name"
                tick={{ fill: "#9399b2", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#9399b2", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#313244",
                  border: "none",
                  borderRadius: "8px",
                  color: "#cdd6f4",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {appStatusData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={appColors[entry.name] || "#cba6f7"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* User Roles */}
        <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-[#cba6f7]" />
            <h2 className="text-[#cdd6f4] font-semibold text-sm">
              User Breakdown
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={userRoleData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                dataKey="value"
                paddingAngle={3}
              >
                {userRoleData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Legend
                formatter={(v) => (
                  <span style={{ color: "#9399b2", fontSize: 11 }}>{v}</span>
                )}
              />
              <Tooltip
                contentStyle={{
                  background: "#313244",
                  border: "none",
                  borderRadius: "8px",
                  color: "#cdd6f4",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up stagger-4">
        {[
          {
            label: "Total Enrollments",
            value: stats?.total_enrollments ?? 0,
            sub: `${stats?.completed_enrollments ?? 0} completed`,
            color: "#89b4fa",
          },
          {
            label: "Total Applications",
            value: stats?.total_applications ?? 0,
            sub: `${stats?.applications_by_status?.hired ?? 0} hired`,
            color: "#a6e3a1",
          },
          {
            label: "Total Courses",
            value: stats?.total_courses ?? 0,
            sub: `${stats?.active_courses ?? 0} active`,
            color: "#cba6f7",
          },
          {
            label: "Total Jobs",
            value: stats?.total_jobs ?? 0,
            sub: `${stats?.active_jobs ?? 0} active`,
            color: "#fab387",
          },
        ].map(({ label, value, sub, color }) => (
          <div
            key={label}
            className="bg-[#1e1e2e] border border-[#313244] rounded-2xl p-4"
          >
            <p className="text-[#9399b2] text-xs mb-1">{label}</p>
            <p className="text-2xl font-bold text-[#cdd6f4]" style={{ color }}>
              {value}
            </p>
            <p className="text-[#585b70] text-xs mt-1">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-4 border-[#f38ba8] border-t-transparent animate-spin" />
    </div>
  );
}
