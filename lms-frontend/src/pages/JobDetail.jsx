// import { useParams } from "react-router-dom";
// import toast from "react-hot-toast";

// export default function JobDetail() {
//   const { id } = useParams();

//   const handleApply = () => {
//     toast.success("Applied successfully!");
//   };

//   return (
//     <div>
//       <h1 className="text-2xl font-semibold mb-4">Job Detail #{id}</h1>

//       <div className="bg-white p-6 rounded-xl shadow">
//         <p className="mb-4">Job description and requirements will go here.</p>

//         <button
//           onClick={handleApply}
//           className="bg-green-500 text-white px-4 py-2 rounded-lg"
//         >
//           Apply Now
//         </button>
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  Briefcase,
  DollarSign,
  GraduationCap,
  ChevronLeft,
  Building2,
  Calendar,
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [isApplied, setIsApplied] = useState(false);
  const [hasCert, setHasCert] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/jobs/${id}/`),
      api.get("/my-applications/"),
      api.get("/my-certificates/"),
    ])
      .then(([jobRes, appsRes, certsRes]) => {
        setJob(jobRes.data);
        setIsApplied(appsRes.data.some((a) => a.job.id === parseInt(id)));
        const certCourseIds = certsRes.data.map((c) => c.course_id);
        if (
          !jobRes.data.required_certificate ||
          certCourseIds.includes(jobRes.data.required_certificate)
        ) {
          setHasCert(true);
        }
      })
      .catch(() => toast.error("Failed to load job"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    if (!hasCert) return toast.error("Certificate required");
    setApplying(true);
    try {
      await api.post("/apply/", { job_id: parseInt(id) });
      setIsApplied(true);
      toast.success("Applied!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Error");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-4 border-[#cba6f7] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!job) return <div className="text-[#f38ba8]">Job not found.</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        to="/jobs"
        className="flex items-center gap-2 text-[#9399b2] hover:text-[#cdd6f4] text-sm transition"
      >
        <ChevronLeft size={16} /> Back to Jobs
      </Link>

      <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl p-6">
        <div className="flex items-start gap-4 mb-6">
          <img
            src={
              job.company_logo ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=313244&color=cdd6f4`
            }
            className="w-14 h-14 rounded-xl object-cover"
            alt={job.company}
          />
          <div>
            <h1 className="text-xl font-bold text-[#cdd6f4]">{job.title}</h1>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-[#9399b2]">
              <span className="flex items-center gap-1">
                <Building2 size={11} /> {job.company}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={11} /> {job.location}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase size={11} /> {job.job_type}
              </span>
              {job.salary_range && (
                <span className="flex items-center gap-1 text-[#a6e3a1]">
                  <DollarSign size={11} /> {job.salary_range}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={11} />{" "}
                {new Date(job.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {job.required_certificate && (
          <div
            className={`flex items-center gap-3 p-3 rounded-xl mb-5 ${hasCert ? "bg-[#a6e3a1]/10 border border-[#a6e3a1]/30" : "bg-[#f38ba8]/10 border border-[#f38ba8]/30"}`}
          >
            <GraduationCap
              size={16}
              className={hasCert ? "text-[#a6e3a1]" : "text-[#f38ba8]"}
            />
            <div>
              <p
                className={`text-xs font-semibold ${hasCert ? "text-[#a6e3a1]" : "text-[#f38ba8]"}`}
              >
                {hasCert
                  ? "You have the required certificate ✓"
                  : "Certificate required"}
              </p>
              <p className="text-[#9399b2] text-xs">
                {job.required_certificate_title}
              </p>
            </div>
            {!hasCert && (
              <Link
                to="/courses"
                className="ml-auto text-xs bg-[#cba6f7]/20 text-[#cba6f7] px-2 py-1 rounded-lg hover:bg-[#cba6f7]/30 transition"
              >
                Get it →
              </Link>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h2 className="text-[#cdd6f4] font-semibold mb-2 text-sm">
              About the Role
            </h2>
            <p className="text-[#9399b2] text-sm leading-relaxed whitespace-pre-wrap">
              {job.description}
            </p>
          </div>

          {job.requirements && (
            <div>
              <h2 className="text-[#cdd6f4] font-semibold mb-2 text-sm">
                Requirements
              </h2>
              <p className="text-[#9399b2] text-sm leading-relaxed whitespace-pre-wrap">
                {job.requirements}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-[#313244]">
          {isApplied ? (
            <div className="w-full flex items-center justify-center gap-2 bg-[#a6e3a1]/20 text-[#a6e3a1] border border-[#a6e3a1]/30 py-3 rounded-xl text-sm font-medium">
              Applied ✓
            </div>
          ) : hasCert ? (
            <button
              onClick={handleApply}
              disabled={applying}
              className="w-full bg-gradient-to-r from-[#cba6f7] to-[#89b4fa] text-[#11111b] py-3 rounded-xl font-bold hover:opacity-90 transition disabled:opacity-60"
            >
              {applying ? "Applying..." : "Apply Now"}
            </button>
          ) : (
            <Link
              to="/courses"
              className="w-full flex items-center justify-center gap-2 bg-[#f38ba8]/10 text-[#f38ba8] border border-[#f38ba8]/30 py-3 rounded-xl text-sm font-semibold hover:bg-[#f38ba8]/20 transition"
            >
              Complete the required course first →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
