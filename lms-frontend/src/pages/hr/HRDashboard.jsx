import { useEffect, useState } from "react";
import {
  Briefcase,
  ClipboardList,
  UserCheck,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const pipelineColors = {
  applied: "#89b4fa",
  interview: "#fab387",
  hired: "#a6e3a1",
  rejected: "#f38ba8",
};

export default function HRDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/hr/dashboard/")
      .then((r) => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const pipelineData = stats?.pipeline
    ? Object.entries(stats.pipeline).map(([name, value]) => ({ name, value }))
    : [];

  const statCards = [
    {
      label: "My Active Jobs",
      value: stats?.my_jobs_active ?? 0,
      icon: Briefcase,
      color: "#89dceb",
      to: "/hr/jobs",
    },
    {
      label: "Total Applications",
      value: stats?.total_applications ?? 0,
      icon: ClipboardList,
      color: "#fab387",
      to: "/hr/applications",
    },
    {
      label: "Talent Pool",
      value: stats?.talent_pool_size ?? 0,
      icon: UserCheck,
      color: "#cba6f7",
      to: "/hr/talent-pool",
    },
    {
      label: "Hired",
      value: stats?.pipeline?.hired ?? 0,
      icon: TrendingUp,
      color: "#a6e3a1",
      to: "/hr/applications?status=hired",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-[#cdd6f4]">
          HR Dashboard <span className="text-[#89dceb]">👥</span>
        </h1>

        <p className="text-sm font-semibold text-[#cdd6f4]">
          Good{" "}
          {new Date().getHours() < 12
            ? "morning"
            : new Date().getHours() < 17
              ? "afternoon"
              : "evening"}
          , <span className="text-[#89dceb]">{user.first_name}</span> 👋
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, to }, i) => (
          <Link
            key={label}
            to={to}
            className={`bg-[#1e1e2e] border border-[#313244] rounded-2xl p-4 hover:border-[#585b70] transition animate-fade-in-up stagger-${i + 1} group`}
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
            <p className="text-[10px] text-[#76f0ea] mt-2 group-hover:text-[#9399b2] transition flex items-center gap-1">
              View <ArrowRight size={10} />
            </p>
          </Link>
        ))}
      </div>

      {/* Pipeline chart */}
      <div className="grid lg:grid-cols-2 gap-4 animate-fade-in-up stagger-3">
        <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl p-5">
          <h2 className="text-[#cdd6f4] font-semibold text-sm mb-4">
            Hiring Pipeline
          </h2>
          {pipelineData.some((d) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pipelineData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {pipelineData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={pipelineColors[entry.name] || "#cba6f7"}
                    />
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
          ) : (
            <div className="h-[200px] flex items-center justify-center text-[#585b70]">
              <p className="text-sm text-[#9399b2]">No applications yet</p>
            </div>
          )}
        </div>

        {/* Pipeline breakdown */}
        <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl p-5">
          <h2 className="text-[#cdd6f4] font-semibold text-sm mb-4">
            Pipeline Breakdown
          </h2>
          <div className="space-y-3">
            {pipelineData.map(({ name, value }) => {
              const total = pipelineData.reduce((s, d) => s + d.value, 0);
              const pct = total ? Math.round((value / total) * 100) : 0;
              return (
                <div key={name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="capitalize text-[#babdc9] text-xs font-medium">
                      {name}
                    </span>
                    <span className="text-[#cdd6f4] text-xs font-semibold">
                      {value}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#313244] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: pipelineColors[name] || "#cba6f7",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            to="/hr/applications"
            className="mt-6 flex items-center justify-center gap-2 border border-[#313244] text-[#89dceb] py-2.5 rounded-xl text-sm hover:border-[#89dceb] transition w-full"
          >
            Manage Applications <ArrowRight size={14} />
          </Link>
        </div>
      </div>
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
