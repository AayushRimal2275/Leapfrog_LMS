import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Briefcase,
  DollarSign,
  GraduationCap,
  Search,
  Building2,
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

const typeColors = {
  "full-time": "bg-[#89b4fa]/20 text-[#89b4fa]",
  "part-time": "bg-[#fab387]/20 text-[#fab387]",
  remote: "bg-[#a6e3a1]/20 text-[#a6e3a1]",
  internship: "bg-[#f5c2e7]/20 text-[#f5c2e7]",
};

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [applied, setApplied] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get("/jobs/"),
      api.get("/my-applications/"),
      api.get("/my-certificates/"),
    ])
      .then(([jobsRes, appsRes, certsRes]) => {
        setJobs(jobsRes.data);
        setApplied(appsRes.data.map((a) => a.job.id));
        setCertificates(certsRes.data.map((c) => c.course_id));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleApply = async (jobId) => {
    const job = jobs.find((j) => j.id === jobId);
    if (
      job?.required_certificate &&
      !certificates.includes(job.required_certificate)
    ) {
      toast.error(
        `You need the '${job.required_certificate_title}' certificate to apply.`,
      );
      return;
    }
    setApplying(jobId);
    try {
      await api.post("/apply/", { job_id: jobId });
      setApplied((prev) => [...prev, jobId]);
      toast.success("Applied successfully! 🎉");
    } catch (err) {
      toast.error(err.response?.data?.error || "Application failed");
    } finally {
      setApplying(null);
    }
  };

  const types = ["all", "full-time", "part-time", "remote", "internship"];

  const filtered = jobs.filter((j) => {
    const matchSearch =
      !search ||
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || j.job_type === filter;
    return matchSearch && matchFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-4 border-[#cba6f7] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-[#cdd6f4]">Job Opportunities</h1>
        {/* was #6c7086 → #9399b2 */}
        <p className="text-[#9399b2] text-sm mt-1">
          Apply to positions that match your certificates
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 animate-fade-in-up stagger-1">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9399b2]"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs or companies..."
            className="w-full bg-[#1e1e2e] border border-[#313244] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#cdd6f4] placeholder-[#585b70] focus:outline-none focus:border-[#cba6f7] transition"
          />
        </div>
        <div className="flex gap-2">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition ${
                filter === t
                  ? "bg-[#cba6f7] text-[#11111b]"
                  : /* inactive filter: was #6c7086 → #a6adc8 */
                    "bg-[#1e1e2e] border border-[#313244] text-[#a6adc8] hover:text-[#cdd6f4]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Job list */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[#585b70]">
            <Briefcase size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-[#9399b2]">No jobs found</p>
          </div>
        ) : (
          filtered.map((job, i) => {
            const isApplied = applied.includes(job.id);
            const hasCert =
              !job.required_certificate ||
              certificates.includes(job.required_certificate);

            return (
              <div
                key={job.id}
                className={`bg-[#1e1e2e] border border-[#313244] rounded-2xl p-5 hover:border-[#585b70] transition animate-fade-in-up stagger-${(i % 5) + 1}`}
              >
                <div className="flex items-start gap-4">
                  <img
                    src={
                      job.company_logo ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=313244&color=cdd6f4`
                    }
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                    alt={job.company}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-[#cdd6f4] font-semibold">
                          {job.title}
                        </h3>
                        {/* was #6c7086 → #9399b2 — company meta clearly readable */}
                        <div className="flex items-center gap-2 mt-1 text-xs text-[#9399b2]">
                          <span className="flex items-center gap-1">
                            <Building2 size={11} /> {job.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={11} /> {job.location}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-1 rounded-full font-medium flex-shrink-0 ${typeColors[job.job_type] || "bg-[#313244] text-[#9399b2]"}`}
                      >
                        {job.job_type}
                      </span>
                    </div>

                    {/* was #6c7086 → #9399b2 */}
                    <p className="text-[#9399b2] text-sm mt-2 line-clamp-2">
                      {job.description}
                    </p>

                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      {job.salary_range && (
                        <span className="flex items-center gap-1 text-xs text-[#a6e3a1]">
                          <DollarSign size={11} /> {job.salary_range}
                        </span>
                      )}
                      {job.required_certificate && (
                        <span
                          className={`flex items-center gap-1 text-xs ${hasCert ? "text-[#a6e3a1]" : "text-[#f38ba8]"}`}
                        >
                          <GraduationCap size={11} />
                          {hasCert
                            ? "Certificate: ✓"
                            : `Need: ${job.required_certificate_title}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-4 pt-4 border-t border-[#313244]">
                  <Link
                    to={`/jobs/${job.id}`}
                    /* was text-[#cdd6f4] on border-only button (readable but blend) → added explicit color + hover lift */
                    className="flex-1 text-center border border-[#313244] text-[#bac2de] py-2 rounded-xl text-sm hover:bg-[#313244] hover:text-[#cdd6f4] transition"
                  >
                    View Details
                  </Link>
                  {isApplied ? (
                    <button
                      disabled
                      className="flex-1 bg-[#a6e3a1]/20 text-[#a6e3a1] border border-[#a6e3a1]/30 py-2 rounded-xl text-sm font-medium cursor-default"
                    >
                      Applied ✓
                    </button>
                  ) : hasCert ? (
                    <button
                      onClick={() => handleApply(job.id)}
                      disabled={applying === job.id}
                      className="flex-1 bg-gradient-to-r from-[#cba6f7] to-[#89b4fa] text-[#11111b] py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
                    >
                      {applying === job.id ? "Applying..." : "Apply Now"}
                    </button>
                  ) : (
                    <Link
                      to="/courses"
                      className="flex-1 text-center bg-[#f38ba8]/10 text-[#f38ba8] border border-[#f38ba8]/30 py-2 rounded-xl text-sm hover:bg-[#f38ba8]/20 transition"
                    >
                      Get Certificate First
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
