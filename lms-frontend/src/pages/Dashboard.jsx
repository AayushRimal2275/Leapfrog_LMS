import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Briefcase,
  GraduationCap,
  Flame,
  TrendingUp,
  ArrowRight,
  Clock,
  Calendar,
  Zap,
  Users,
  MapPin,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const EVENT_COLORS = {
  hackathon: { bg: "bg-[#f38ba8]/15", text: "text-[#f38ba8]", dot: "#f38ba8" },
  workshop: { bg: "bg-[#fab387]/15", text: "text-[#fab387]", dot: "#fab387" },
  webinar: { bg: "bg-[#89b4fa]/15", text: "text-[#89b4fa]", dot: "#89b4fa" },
  bootcamp: { bg: "bg-[#cba6f7]/15", text: "text-[#cba6f7]", dot: "#cba6f7" },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/")
      .then((r) => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-4 border-[#cba6f7] border-t-transparent animate-spin" />
      </div>
    );

  const firstName =
    user?.first_name || user?.username?.split("@")[0] || "Learner";

  const statCards = [
    {
      label: "Enrolled",
      value: stats?.courses_enrolled ?? 0,
      icon: BookOpen,
      color: "#cba6f7",
    },
    {
      label: "Jobs Applied",
      value: stats?.jobs_applied ?? 0,
      icon: Briefcase,
      color: "#89b4fa",
    },
    {
      label: "Certificates",
      value: stats?.certificates ?? 0,
      icon: GraduationCap,
      color: "#a6e3a1",
    },
    {
      label: "Day Streak",
      value: stats?.streak ?? 0,
      icon: Flame,
      color: "#fab387",
    },
  ];

  const progressData =
    stats?.course_progress?.filter((p) => p.progress > 0) || [];
  const allProgress = stats?.course_progress || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#cdd6f4]">
            Good{" "}
            {new Date().getHours() < 12
              ? "morning"
              : new Date().getHours() < 17
                ? "afternoon"
                : "evening"}
            , <span className="text-[#cba6f7]">{firstName}</span> 👋
          </h1>
          <p className="text-[#bac2de] text-sm mt-1">
            Here's your learning overview
          </p>
        </div>
        <Link
          to="/courses"
          className="flex items-center gap-2 bg-[#cba6f7] text-[#11111b] px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition"
        >
          Explore Courses <ArrowRight size={14} />
        </Link>
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

      {/* Progress chart + Streak */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[#1e1e2e] border border-[#313244] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-[#cba6f7]" />
            <h2 className="text-[#cdd6f4] font-semibold text-sm">
              Learning Progress
            </h2>
          </div>
          {allProgress.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={allProgress} barCategoryGap="30%">
                  <XAxis
                    dataKey="course"
                    tick={{ fill: "#9399b2", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#9399b2", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#313244",
                      border: "none",
                      borderRadius: "8px",
                      color: "#cdd6f4",
                      fontSize: "12px",
                    }}
                    formatter={(v) => [`${v}%`, "Progress"]}
                  />
                  <Bar dataKey="progress" radius={[6, 6, 0, 0]}>
                    {allProgress.map((_, i) => (
                      <Cell
                        key={i}
                        fill={i % 2 === 0 ? "#cba6f7" : "#89b4fa"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {/* Progress list below chart */}
              <div className="mt-3 space-y-2">
                {allProgress.map((p) => (
                  <div key={p.course_id} className="flex items-center gap-3">
                    <p className="text-[#9399b2] text-xs w-32 truncate flex-shrink-0">
                      {p.course}
                    </p>
                    <div className="flex-1 h-1.5 bg-[#313244] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${p.progress}%`,
                          background: p.completed ? "#a6e3a1" : "#cba6f7",
                        }}
                      />
                    </div>
                    <span className="text-[#9399b2] text-[10px] w-8 text-right">
                      {p.progress}%
                    </span>
                    {p.completed && (
                      <span className="text-[#a6e3a1] text-[10px]">✓</span>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center">
              <BookOpen size={28} className="text-[#313244] mb-2" />
              <p className="text-[#585b70] text-sm">No courses enrolled yet</p>
              <Link
                to="/courses"
                className="text-[#cba6f7] text-xs mt-2 hover:underline"
              >
                Browse courses →
              </Link>
            </div>
          )}
        </div>

        {/* Streak card */}
        <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl p-5 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#fab387]/20 flex items-center justify-center mb-3">
            <Flame size={30} className="text-[#fab387]" />
          </div>
          <p className="text-4xl font-bold text-[#cdd6f4]">
            {stats?.streak ?? 0}
          </p>
          <p className="text-[#9399b2] text-sm mt-1">Day Streak 🔥</p>
          <p className="text-[#585b70] text-xs mt-3">
            Keep learning daily to maintain your streak!
          </p>
        </div>
      </div>

      {/* Trending Courses */}
      {stats?.trending_courses?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[#cdd6f4] font-semibold flex items-center gap-2">
              <Zap size={15} className="text-[#f9e2af]" />
              Trending Courses
            </h2>
            <Link
              to="/courses"
              className="text-[#9399b2] text-xs hover:text-[#cdd6f4] transition flex items-center gap-1"
            >
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.trending_courses.map((c) => (
              <Link
                key={c.id}
                to={`/courses/${c.id}`}
                className="bg-[#1e1e2e] border border-[#313244] rounded-2xl overflow-hidden hover:border-[#585b70] transition group"
              >
                {c.thumbnail ? (
                  <img
                    src={c.thumbnail}
                    alt={c.title}
                    className="w-full h-24 object-cover group-hover:opacity-90 transition"
                  />
                ) : (
                  <div className="w-full h-24 bg-gradient-to-br from-[#cba6f7]/20 to-[#89b4fa]/20 flex items-center justify-center">
                    <BookOpen size={24} className="text-[#585b70]" />
                  </div>
                )}
                <div className="p-3">
                  <p className="text-[#cdd6f4] text-xs font-semibold line-clamp-2 leading-snug">
                    {c.title}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] bg-[#313244] text-[#9399b2] px-1.5 py-0.5 rounded-md capitalize">
                      {c.level}
                    </span>
                    <span className="text-[10px] text-[#585b70] flex items-center gap-0.5">
                      <Users size={9} />
                      {c.enroll_count}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Latest Jobs + Upcoming Events */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Latest Jobs */}
        {stats?.latest_jobs?.length > 0 && (
          <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#cdd6f4] font-semibold flex items-center gap-2">
                <Briefcase size={15} className="text-[#89b4fa]" />
                Latest Jobs
              </h2>
              <Link
                to="/jobs"
                className="text-[#9399b2] text-xs hover:text-[#cdd6f4] flex items-center gap-1"
              >
                View all <ArrowRight size={11} />
              </Link>
            </div>
            <div className="space-y-3">
              {stats.latest_jobs.map((j) => (
                <Link
                  key={j.id}
                  to={`/jobs/${j.id}`}
                  className="flex items-center gap-3 py-2 border-b border-[#313244]/50 last:border-0 hover:opacity-80 transition"
                >
                  {j.company_logo ? (
                    <img
                      src={j.company_logo}
                      className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
                      alt=""
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-[#313244] flex items-center justify-center flex-shrink-0">
                      <Briefcase size={14} className="text-[#585b70]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[#cdd6f4] text-sm font-medium truncate">
                      {j.title}
                    </p>
                    <p className="text-[#9399b2] text-xs flex items-center gap-1">
                      <MapPin size={9} />
                      {j.company} · {j.location}
                    </p>
                  </div>
                  <span className="text-[10px] bg-[#89b4fa]/15 text-[#89b4fa] px-2 py-0.5 rounded-full capitalize flex-shrink-0">
                    {j.job_type}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Events */}
        {stats?.upcoming_events?.length > 0 && (
          <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#cdd6f4] font-semibold flex items-center gap-2">
                <Calendar size={15} className="text-[#f38ba8]" />
                Upcoming Events
              </h2>
              <Link
                to="/events"
                className="text-[#9399b2] text-xs hover:text-[#cdd6f4] flex items-center gap-1"
              >
                View all <ArrowRight size={11} />
              </Link>
            </div>
            <div className="space-y-3">
              {stats.upcoming_events.map((e) => {
                const ec = EVENT_COLORS[e.event_type] || EVENT_COLORS.webinar;
                return (
                  <Link
                    key={e.id}
                    to="/events"
                    className="flex items-center gap-3 py-2 border-b border-[#313244]/50 last:border-0 hover:opacity-80 transition"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${ec.bg}`}
                    >
                      <Calendar size={14} style={{ color: ec.dot }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#cdd6f4] text-sm font-medium truncate">
                        {e.title}
                      </p>
                      <p className="text-[#9399b2] text-xs">
                        {new Date(e.start_date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        · {e.location}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${ec.bg} ${ec.text}`}
                      >
                        {e.event_type}
                      </span>
                      {e.registered && (
                        <span className="text-[10px] text-[#a6e3a1]">
                          ✓ Registered
                        </span>
                      )}
                      {e.is_free && !e.registered && (
                        <span className="text-[10px] text-[#9399b2]">Free</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
