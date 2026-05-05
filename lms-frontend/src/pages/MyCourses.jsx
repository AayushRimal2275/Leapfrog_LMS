import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  GraduationCap,
  Play,
  ArrowRight,
} from "lucide-react";
import api from "../services/api";

export default function MyCourses() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/my-courses/")
      .then((res) => setEnrollments(res.data))
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-[#cdd6f4]">My Learning</h1>
        {/* was #6c7086 → #9399b2 */}
        <p className="text-[#9399b2] text-sm mt-1">
          {enrollments.length} courses enrolled
        </p>
      </div>

      {enrollments.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <BookOpen
            size={48}
            className="text-[#585b70] mx-auto mb-4 opacity-40"
          />
          {/* was #6c7086 → #9399b2 */}
          <p className="text-[#9399b2] mb-4">
            You haven't enrolled in any courses yet.
          </p>
          <Link
            to="/courses"
            className="bg-gradient-to-r from-[#cba6f7] to-[#89b4fa] text-[#11111b] px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition hover:scale-105"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {enrollments.map((en, i) => {
            const course = en.course;
            return (
              <div
                key={en.id}
                className={`bg-[#1e1e2e] border border-[#313244] rounded-2xl overflow-hidden hover:border-[#585b70] transition group animate-fade-in-up stagger-${(i % 5) + 1}`}
              >
                <div className="h-32 bg-[#313244] flex items-center justify-center p-4">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="max-h-full object-contain group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <BookOpen size={32} className="text-[#585b70]" />
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-[#cdd6f4] font-semibold mb-1 group-hover:text-[#cba6f7] transition">
                    {course.title}
                  </h3>
                  {/* was #6c7086 → #9399b2 */}
                  <p className="text-[#9399b2] text-xs mb-3 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      {/* was #6c7086 → #9399b2 */}
                      <span className="text-[#9399b2] text-xs">Progress</span>
                      <span className="text-[#cba6f7] text-xs font-bold">
                        {en.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-[#313244] rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-[#cba6f7] to-[#89b4fa] transition-all duration-500"
                        style={{ width: `${en.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* was #45475a (nearly invisible) → #9399b2 */}
                  <div className="flex items-center gap-3 text-xs text-[#9399b2] mb-4">
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen size={11} /> {course.lesson_count} lessons
                    </span>
                    {en.completed && (
                      <span className="flex items-center gap-1 text-[#a6e3a1] ml-auto">
                        <CheckCircle2 size={11} /> Completed
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/courses/${course.id}/learn`}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-[#cba6f7]/20 text-[#cba6f7] border border-[#cba6f7]/30 py-2 rounded-xl text-sm font-medium hover:bg-[#cba6f7]/30 transition"
                    >
                      <Play size={13} />{" "}
                      {en.progress > 0 ? "Continue" : "Start"}
                    </Link>
                    {en.completed && (
                      <Link
                        to={`/courses/${course.id}/quiz`}
                        className="flex items-center gap-1.5 bg-[#a6e3a1]/20 text-[#a6e3a1] border border-[#a6e3a1]/30 px-3 py-2 rounded-xl text-sm font-medium hover:bg-[#a6e3a1]/30 transition"
                      >
                        <GraduationCap size={13} /> Exam{" "}
                        <ArrowRight size={11} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
