import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  MapPin,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  FileCheck,
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

const STAGES = [
  {
    key: "applied",
    label: "Applied",
    icon: FileCheck,
    color: "#89b4fa",
    bg: "bg-[#89b4fa]/10",
    border: "border-[#89b4fa]/30",
  },
  {
    key: "interview",
    label: "Interview",
    icon: MessageSquare,
    color: "#fab387",
    bg: "bg-[#fab387]/10",
    border: "border-[#fab387]/30",
  },
  {
    key: "hired",
    label: "Hired",
    icon: CheckCircle,
    color: "#a6e3a1",
    bg: "bg-[#a6e3a1]/10",
    border: "border-[#a6e3a1]/30",
  },
  {
    key: "rejected",
    label: "Rejected",
    icon: XCircle,
    color: "#f38ba8",
    bg: "bg-[#f38ba8]/10",
    border: "border-[#f38ba8]/30",
  },
];

function AppCard({ app }) {
  const stage = STAGES.find((s) => s.key === app.status) || STAGES[0];
  const Icon = stage.icon;

  return (
    <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl p-4 hover:border-[#585b70] transition">
      {/* Company + title */}
      <div className="flex items-start gap-3 mb-3">
        <img
          src={
            app.job.company_logo ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(app.job.company)}&background=313244&color=cdd6f4&size=64`
          }
          alt={app.job.company}
          className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-[#cdd6f4] font-semibold text-sm leading-tight">
            {app.job.title}
          </p>
          <p className="text-[#9399b2] text-xs mt-0.5">{app.job.company}</p>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#9399b2] mb-3">
        {app.job.location && (
          <span className="flex items-center gap-1">
            <MapPin size={10} /> {app.job.location}
          </span>
        )}
        {app.job.job_type && (
          <span className="flex items-center gap-1">
            <Briefcase size={10} /> {app.job.job_type}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock size={10} /> {new Date(app.applied_at).toLocaleDateString()}
        </span>
      </div>

      {/* Status badge */}
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${stage.bg} border ${stage.border}`}
        style={{ color: stage.color }}
      >
        <Icon size={11} />
        {stage.label}
      </div>
      {app.updated_at && app.status !== "applied" && (
        <p className="text-[#585b70] text-[10px] mt-1.5 flex items-center gap-1">
          <Clock size={9} /> Status updated{" "}
          {new Date(app.updated_at).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // "list" | "kanban"
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    api
      .get("/my-applications/")
      .then((res) => setApplications(res.data))
      .catch(() => toast.error("Failed to load applications"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-4 border-[#cba6f7] border-t-transparent animate-spin" />
      </div>
    );
  }

  const filtered =
    filterStatus === "all"
      ? applications
      : applications.filter((a) => a.status === filterStatus);

  const countByStatus = (key) =>
    applications.filter((a) => a.status === key).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#cdd6f4]">My Applications</h1>
          <p className="text-[#9399b2] text-sm mt-1">
            {applications.length > 0
              ? `${applications.length} application${applications.length > 1 ? "s" : ""} tracked`
              : "No applications yet"}
          </p>
        </div>

        {/* View toggle */}
        {applications.length > 0 && (
          <div className="flex gap-1 bg-[#1e1e2e] border border-[#313244] rounded-xl p-1">
            {[
              ["list", "List"],
              ["kanban", "Kanban"],
            ].map(([v, label]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  view === v
                    ? "bg-[#313244] text-[#cdd6f4]"
                    : "text-[#9399b2] hover:text-[#cdd6f4]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Empty state */}
      {applications.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-[#1e1e2e] border border-[#313244] flex items-center justify-center mx-auto mb-4">
            <Briefcase size={36} className="text-[#9399b2]" />
          </div>
          <h2 className="text-[#cdd6f4] font-semibold text-lg mb-2">
            No applications yet
          </h2>
          <p className="text-[#9399b2] text-sm mb-6 max-w-sm mx-auto">
            Apply to jobs to start tracking your recruitment funnel here.
          </p>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#cba6f7] to-[#89b4fa] text-[#11111b] px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition"
          >
            Browse Jobs <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3">
            {STAGES.map(({ key, label, icon: Icon, color, bg, border }) => (
              <button
                key={key}
                onClick={() =>
                  setFilterStatus(filterStatus === key ? "all" : key)
                }
                className={`rounded-2xl p-3 border text-left transition ${
                  filterStatus === key
                    ? `${bg} ${border}`
                    : "bg-[#1e1e2e] border-[#313244] hover:border-[#585b70]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={13} style={{ color }} />
                  <span className="text-[11px] font-medium" style={{ color }}>
                    {label}
                  </span>
                </div>
                <p className="text-2xl font-black text-[#cdd6f4]">
                  {countByStatus(key)}
                </p>
              </button>
            ))}
          </div>

          {/* Filter chip */}
          {filterStatus !== "all" && (
            <div className="flex items-center gap-2">
              <span className="text-[#9399b2] text-sm">Showing:</span>
              <button
                onClick={() => setFilterStatus("all")}
                className="flex items-center gap-1.5 bg-[#313244] text-[#cdd6f4] px-3 py-1 rounded-full text-xs hover:bg-[#45475a] transition"
              >
                {STAGES.find((s) => s.key === filterStatus)?.label}
                <span className="text-[#f38ba8]">×</span>
              </button>
            </div>
          )}

          {/* LIST VIEW */}
          {view === "list" && (
            <div className="space-y-3">
              {filtered.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-[#9399b2] py-8 text-sm">
                  No applications in this stage.
                </p>
              )}
            </div>
          )}

          {/* KANBAN VIEW */}
          {view === "kanban" && (
            <div className="grid grid-cols-4 gap-4 min-h-[300px]">
              {STAGES.map(({ key, label, icon: Icon, color, bg, border }) => {
                const stageApps = applications.filter((a) => a.status === key);
                return (
                  <div key={key} className="space-y-3">
                    {/* Column header */}
                    <div
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${bg} ${border}`}
                    >
                      <Icon size={13} style={{ color }} />
                      <span className="text-xs font-semibold" style={{ color }}>
                        {label}
                      </span>
                      <span
                        className="ml-auto text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                        style={{ background: color + "33", color }}
                      >
                        {stageApps.length}
                      </span>
                    </div>

                    {/* Cards */}
                    {stageApps.length === 0 ? (
                      <div className="border-2 border-dashed border-[#313244] rounded-2xl p-4 text-center">
                        <p className="text-[#9399b2] text-xs">None</p>
                      </div>
                    ) : (
                      stageApps.map((app) => (
                        <div
                          key={app.id}
                          className="bg-[#1e1e2e] border border-[#313244] rounded-xl p-3 hover:border-[#585b70] transition"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <img
                              src={
                                app.job.company_logo ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(app.job.company)}&background=313244&color=cdd6f4&size=40`
                              }
                              className="w-7 h-7 rounded-lg object-cover"
                              alt={app.job.company}
                            />
                            <div className="min-w-0">
                              <p className="text-[#cdd6f4] text-xs font-semibold truncate">
                                {app.job.title}
                              </p>
                              <p className="text-[#9399b2] text-[10px] truncate">
                                {app.job.company}
                              </p>
                            </div>
                          </div>
                          <p className="text-[#9399b2] text-[10px] flex items-center gap-1">
                            <Clock size={9} />
                            {new Date(app.applied_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
