// import { useParams } from "react-router-dom";
// import toast from "react-hot-toast";

// export default function CourseDetail() {
//   const { id } = useParams();

//   return (
//     <div>
//       <h1 className="text-2xl font-semibold mb-4">Course Detail #{id}</h1>

//       <div className="bg-white p-6 rounded-xl shadow">
//         <p className="mb-4">This is where video/content will go.</p>

//         <button
//           onClick={() => toast.success("Marked as completed")}
//           className="bg-blue-500 text-white px-4 py-2 rounded-lg"
//         >
//           Mark as Complete
//         </button>
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Clock,
  BarChart2,
  Tag,
  ChevronRight,
  ArrowLeft,
  PlayCircle,
  Lock,
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

const levelColors = {
  beginner: "bg-[#a6e3a1]/20 text-[#a6e3a1] border-[#a6e3a1]/30",
  intermediate: "bg-[#fab387]/20 text-[#fab387] border-[#fab387]/30",
  advanced: "bg-[#f38ba8]/20 text-[#f38ba8] border-[#f38ba8]/30",
};

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Always fetch course detail (AllowAny — never fails on auth)
        const courseRes = await api.get(`/courses/${id}/`);
        setCourse(courseRes.data);

        // 2. Separately check enrollment — silently ignore if unauthenticated
        try {
          const myRes = await api.get("/my-courses/");
          const ids = myRes.data.map((e) => e.course.id);
          setEnrolled(ids.includes(Number(id)));
        } catch {
          // Not logged in or token expired — just treat as not enrolled
          setEnrolled(false);
        }
      } catch (err) {
        // Only hit if /courses/:id/ itself failed (404, network, etc.)
        const status = err.response?.status;
        if (status === 404) {
          toast.error("Course not found.");
        } else {
          toast.error("Failed to load course. Please try again.");
        }
        navigate("/courses");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleEnroll = async () => {
    if (enrolled) return;
    setEnrolling(true);
    try {
      await api.post("/enroll/", { course_id: Number(id) });
      setEnrolled(true);
      toast.success("Enrolled! Start learning now.");
    } catch (err) {
      toast.error(err.response?.data?.error || "Enrollment failed.");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-4 border-[#cba6f7] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!course) return null;

  const lessons = course.lessons ?? [];

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-[#9399b2] hover:text-[#cdd6f4] transition"
      >
        <ArrowLeft size={15} /> Back to Courses
      </button>

      {/* Hero card */}
      <div className="bg-gradient-to-br from-[#1e1e2e] to-[#181825] border border-[#313244] rounded-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Thumbnail */}
          <div className="md:w-64 flex-shrink-0 bg-[#313244] flex items-center justify-center p-8 min-h-[180px]">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="max-h-36 max-w-full object-contain"
              />
            ) : (
              <BookOpen size={52} className="text-[#585b70]" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 p-6 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium border capitalize ${levelColors[course.level] ?? "bg-[#313244] text-[#9399b2]"}`}
                >
                  {course.level}
                </span>
                {course.category?.name && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#313244] text-[#9399b2] border border-[#45475a]">
                    {course.category.name}
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold text-[#cdd6f4] mb-2">
                {course.title}
              </h1>
              <p className="text-[#9399b2] text-sm leading-relaxed">
                {course.description}
              </p>
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-5 text-xs text-[#bac2de]">
              {course.duration && (
                <span className="flex items-center gap-1.5">
                  <Clock size={13} />
                  {course.duration}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <BarChart2 size={13} />
                {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Tags */}
            {course.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {course.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] bg-[#313244] text-[#9399b2] px-2 py-0.5 rounded-full flex items-center gap-1 hover:text-[#cba6f7] transition"
                  >
                    <Tag size={9} />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Action button */}
            <div className="flex gap-3 flex-wrap">
              {enrolled ? (
                <Link
                  to={`/courses/${id}/learn`}
                  className="flex items-center gap-2 bg-[#a6e3a1] text-[#11111b] px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition hover:scale-105"
                >
                  Continue Learning <ChevronRight size={15} />
                </Link>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#cba6f7] to-[#89b4fa] text-[#11111b] px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {enrolling ? "Enrolling..." : "Enroll Now"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lesson list */}
      {lessons.length > 0 && (
        <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#313244]">
            <h2 className="text-sm font-semibold text-[#bac2de] uppercase tracking-wider">
              Course Content
            </h2>
          </div>
          <ul className="divide-y divide-[#313244]">
            {lessons
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((lesson, index) => (
                <li
                  key={lesson.id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#181825] transition group"
                >
                  <span className="text-[11px] text-[#585b70] w-5 text-right flex-shrink-0">
                    {index + 1}
                  </span>
                  {enrolled ? (
                    <PlayCircle
                      size={16}
                      className="text-[#cba6f7] flex-shrink-0"
                    />
                  ) : (
                    <Lock size={14} className="text-[#585b70] flex-shrink-0" />
                  )}
                  <span className="flex-1 text-sm text-[#cdd6f4] group-hover:text-[#cba6f7] transition line-clamp-1">
                    {lesson.title}
                  </span>
                  {lesson.duration_minutes && (
                    <span className="text-[11px] text-[#585b70] flex-shrink-0">
                      {lesson.duration_minutes} min
                    </span>
                  )}
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Bottom enroll CTA */}
      {!enrolled && (
        <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-[#9399b2] text-sm">
            Ready to start? Enroll to unlock all {lessons.length} lessons.
          </p>
          <button
            onClick={handleEnroll}
            disabled={enrolling}
            className="bg-gradient-to-r from-[#cba6f7] to-[#89b4fa] text-[#11111b] px-5 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
          >
            {enrolling ? "Enrolling..." : "Enroll Now"}
          </button>
        </div>
      )}
    </div>
  );
}
