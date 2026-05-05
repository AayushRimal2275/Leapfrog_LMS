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

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/dashboard-stats/"),
      api.get("/courses/"),
      api.get("/jobs/"),
    ])
      .then(([statsRes, coursesRes, jobsRes]) => {
        setStats(statsRes.data);
        setCourses(coursesRes.data.slice(0, 4));
        setJobs(jobsRes.data.slice(0, 3));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-4 border-[#cba6f7] border-t-transparent animate-spin" />
      </div>
    );
  }

  const firstName =
    user?.first_name || user?.username?.split("@")[0] || "Learner";

  const statCards = [
    {
      label: "Courses Enrolled",
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

  const progressData = stats?.course_progress?.length
    ? stats.course_progress
    : courses.map((c) => ({ course: c.title.split(" ")[0], progress: 0 }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
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
          {/* was #b5b6bb — lifted to #bac2de for clear readability */}
          <p className="text-[#bac2de] text-sm mt-1">
            Here's your learning overview
          </p>
        </div>
        <Link
          to="/courses"
          className="flex items-center gap-2 bg-[#cba6f7] text-[#11111b] px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition hover:scale-105"
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
              {/* was #f0f0f5 (too white/bright) → #bac2de: warm lavender-gray, great contrast on dark */}
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

      {/* Chart + Streak */}
      <div className="grid lg:grid-cols-3 gap-4 animate-fade-in-up stagger-3">
        {/* Progress Chart */}
        <div className="lg:col-span-2 bg-[#1e1e2e] border border-[#313244] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-[#cba6f7]" />
            <h2 className="text-[#cdd6f4] font-semibold text-sm">
              Learning Progress
            </h2>
          </div>
          {progressData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={progressData} barCategoryGap="30%">
                <XAxis
                  dataKey="course"
                  tick={{ fill: "#9399b2", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#9399b2", fontSize: 11 }}
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
                  {progressData.map((_, i) => (
                    <Cell key={i} fill={i % 2 === 0 ? "#cba6f7" : "#89b4fa"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex flex-col items-center justify-center text-[#585b70]">
              <BookOpen size={32} className="mb-2 opacity-40" />
              {/* was #45475a (nearly invisible) → #585b70 readable placeholder */}
              <p className="text-sm text-[#9399b2]">
                Enroll in courses to track progress
              </p>
            </div>
          )}
        </div>

        {/* Streak card */}
        <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Flame size={16} className="text-[#fab387]" />
            <h2 className="text-[#cdd6f4] font-semibold text-sm">
              Daily Streak
            </h2>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#fab387] to-[#f38ba8] flex items-center justify-center mb-3 animate-pulse-soft">
              <span className="text-3xl font-black text-white">
                {stats?.streak ?? 0}
              </span>
            </div>
            <p className="text-[#cdd6f4] font-semibold">
              {stats?.streak > 0 ? "Days in a row 🔥" : "Start your streak!"}
            </p>
            {/* was #6c7086 → #9399b2 — readable motivational text */}
            <p className="text-[#9399b2] text-xs mt-1 text-center">
              Log in daily to keep your streak alive
            </p>
          </div>
        </div>
      </div>

      {/* Trending Courses */}
      <div className="animate-fade-in-up stagger-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#cdd6f4] font-semibold">Trending Courses</h2>
          <Link
            to="/courses"
            className="text-[#cba6f7] text-sm hover:underline flex items-center gap-1 transition hover:gap-2"
          >
            View all <ArrowRight size={13} />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {courses.map((course, i) => (
            <Link
              key={course.id}
              to={`/courses/${course.id}/learn`}
              className={`bg-[#1e1e2e] border border-[#313244] rounded-2xl overflow-hidden hover:border-[#cba6f7] transition group animate-fade-in-up stagger-${i + 1}`}
            >
              <div className="aspect-video bg-[#313244] flex items-center justify-center overflow-hidden">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <BookOpen size={28} className="text-[#585b70]" />
                )}
              </div>
              <div className="p-3">
                <p className="text-[#cdd6f4] text-sm font-medium line-clamp-1 group-hover:text-[#cba6f7] transition">
                  {course.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      course.level === "beginner"
                        ? "bg-[#a6e3a1]/20 text-[#a6e3a1]"
                        : course.level === "intermediate"
                          ? "bg-[#fab387]/20 text-[#fab387]"
                          : "bg-[#f38ba8]/20 text-[#f38ba8]"
                    }`}
                  >
                    {course.level}
                  </span>
                  {course.duration && (
                    /* was #6c7086 → #9399b2 — visible metadata */
                    <span className="text-[#9399b2] text-[10px] flex items-center gap-0.5">
                      <Clock size={10} /> {course.duration}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Latest Jobs */}
      <div className="animate-fade-in-up stagger-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#cdd6f4] font-semibold">Latest Job Openings</h2>
          <Link
            to="/jobs"
            className="text-[#cba6f7] text-sm hover:underline flex items-center gap-1 transition hover:gap-2"
          >
            View all <ArrowRight size={13} />
          </Link>
        </div>
        <div className="space-y-3">
          {jobs.map((job, i) => (
            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              className={`flex items-center gap-4 bg-[#1e1e2e] border border-[#313244] rounded-2xl p-4 hover:border-[#89b4fa] transition group animate-fade-in-up stagger-${i + 1}`}
            >
              <img
                src={
                  job.company_logo ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=313244&color=cdd6f4`
                }
                className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                alt={job.company}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[#cdd6f4] font-medium text-sm group-hover:text-[#89b4fa] transition">
                  {job.title}
                </p>
                {/* was #6c7086 → #9399b2 — company + location clearly readable */}
                <p className="text-[#9399b2] text-xs">
                  {job.company} · {job.location}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] bg-[#89b4fa]/20 text-[#89b4fa] px-2 py-0.5 rounded-full">
                  {job.job_type}
                </span>
                {job.salary_range && (
                  <span className="text-[10px] text-[#a6e3a1]">
                    {job.salary_range}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
