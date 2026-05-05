import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CheckCircle2,
  Circle,
  Play,
  BookOpen,
  ChevronLeft,
  Lock,
  GraduationCap,
  Clock,
  ArrowRight,
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

export default function CourseLearn() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedIds, setCompletedIds] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/courses/${id}/`),
      api.get(`/lesson-progress/${id}/`),
      api.get("/my-courses/"),
    ])
      .then(([courseRes, progressRes, myCoursesRes]) => {
        setCourse(courseRes.data);
        setCompletedIds(progressRes.data.completed_lessons || []);
        const enr = myCoursesRes.data.find((e) => e.course.id === parseInt(id));
        setEnrollment(enr);
        if (courseRes.data.lessons?.length) {
          setActiveLesson(courseRes.data.lessons[0]);
        }
      })
      .catch(() => toast.error("Failed to load course"))
      .finally(() => setLoading(false));
  }, [id]);

  const markComplete = async (lessonId) => {
    if (completedIds.includes(lessonId)) return;
    try {
      const res = await api.post("/complete-lesson/", { lesson_id: lessonId });
      setCompletedIds((prev) => [...prev, lessonId]);
      if (enrollment) {
        setEnrollment((e) => ({
          ...e,
          progress: res.data.progress,
          completed: res.data.course_completed,
        }));
      }
      if (res.data.course_completed) {
        toast.success(
          "🎉 Course completed! Take the quiz to earn your certificate.",
        );
      } else {
        toast.success("Lesson completed!");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Error");
    }
  };

  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/embed\/([^?&]+)/);
    return match ? match[1] : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-4 border-[#cba6f7] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!course) return <div className="text-[#f38ba8]">Course not found.</div>;

  const progress = enrollment?.progress ?? 0;
  const courseCompleted = enrollment?.completed ?? false;
  const lessons = course.lessons || [];
  const totalLessons = lessons.length;
  const completedCount = completedIds.length;

  return (
    <div className="space-y-4">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <Link
          to="/courses"
          className="text-[#9399b2] hover:text-[#cdd6f4] transition"
        >
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[#cdd6f4]">{course.title}</h1>
          <p className="text-[#9399b2] text-xs">
            {completedCount}/{totalLessons} lessons complete
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#9399b2] text-xs font-medium">
            Overall Progress
          </span>
          <span className="text-[#cba6f7] text-xs font-bold">{progress}%</span>
        </div>
        <div className="w-full bg-[#313244] rounded-full h-2">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-[#cba6f7] to-[#89b4fa] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        {courseCompleted && (
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#a6e3a1] text-xs font-medium">
              <GraduationCap size={14} />
              Course complete! Ready for the exam.
            </div>
            <Link
              to={`/courses/${id}/quiz`}
              className="flex items-center gap-1 bg-gradient-to-r from-[#cba6f7] to-[#89b4fa] text-[#11111b] px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition"
            >
              Take Exam <ArrowRight size={12} />
            </Link>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Video Player */}
        <div className="lg:col-span-2 space-y-4">
          {activeLesson ? (
            <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl overflow-hidden">
              {activeLesson.youtube_url ? (
                <div className="aspect-video">
                  <iframe
                    src={activeLesson.youtube_url}
                    title={activeLesson.title}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-[#313244] flex items-center justify-center">
                  <div className="text-center">
                    <Play size={48} className="text-[#9399b2] mx-auto mb-2" />
                    <p className="text-[#9399b2] text-sm">No video available</p>
                  </div>
                </div>
              )}

              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-[#cdd6f4] font-semibold text-lg">
                      {activeLesson.title}
                    </h2>
                    {activeLesson.duration_minutes > 0 && (
                      <p className="text-[#9399b2] text-xs mt-1 flex items-center gap-1">
                        <Clock size={11} /> {activeLesson.duration_minutes}{" "}
                        minutes
                      </p>
                    )}
                  </div>
                  {!completedIds.includes(activeLesson.id) ? (
                    <button
                      onClick={() => markComplete(activeLesson.id)}
                      className="flex items-center gap-2 bg-[#a6e3a1]/20 text-[#a6e3a1] border border-[#a6e3a1]/30 px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#a6e3a1]/30 transition flex-shrink-0"
                    >
                      <CheckCircle2 size={15} />
                      Mark Complete
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[#a6e3a1] text-sm font-medium flex-shrink-0">
                      <CheckCircle2 size={15} />
                      Completed
                    </div>
                  )}
                </div>

                {activeLesson.content && (
                  <div className="mt-4 bg-[#313244] rounded-xl p-4">
                    <p className="text-[#9399b2] text-xs font-medium uppercase tracking-wider mb-2">
                      Lesson Notes
                    </p>
                    <p className="text-[#cdd6f4] text-sm leading-relaxed">
                      {activeLesson.content}
                    </p>
                  </div>
                )}

                {/* Next lesson button */}
                {(() => {
                  const idx = lessons.findIndex(
                    (l) => l.id === activeLesson.id,
                  );
                  const next = lessons[idx + 1];
                  if (next)
                    return (
                      <button
                        onClick={() => setActiveLesson(next)}
                        className="mt-4 w-full flex items-center justify-center gap-2 border border-[#313244] text-[#cdd6f4] py-2.5 rounded-xl text-sm hover:bg-[#313244] transition"
                      >
                        Next: {next.title} <ArrowRight size={14} />
                      </button>
                    );
                  if (courseCompleted)
                    return (
                      <Link
                        to={`/courses/${id}/quiz`}
                        className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#cba6f7] to-[#89b4fa] text-[#11111b] py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition"
                      >
                        <GraduationCap size={15} /> Take Final Exam
                      </Link>
                    );
                  return null;
                })()}
              </div>
            </div>
          ) : (
            <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl p-10 flex items-center justify-center">
              <div className="text-center">
                <BookOpen size={40} className="text-[#9399b2] mx-auto mb-3" />
                <p className="text-[#9399b2]">
                  Select a lesson to start learning
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Lesson list */}
        <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[#313244]">
            <h3 className="text-[#cdd6f4] font-semibold text-sm">
              Course Content
            </h3>
            <p className="text-[#9399b2] text-xs mt-0.5">
              {totalLessons} lessons
            </p>
          </div>
          <div className="overflow-y-auto max-h-[500px]">
            {lessons.map((lesson, idx) => {
              const done = completedIds.includes(lesson.id);
              const isActive = activeLesson?.id === lesson.id;

              return (
                <button
                  key={lesson.id}
                  onClick={() => setActiveLesson(lesson)}
                  className={`w-full flex items-center gap-3 p-4 border-b border-[#313244] text-left transition ${
                    isActive ? "bg-[#313244]" : "hover:bg-[#1e1e2e]/60"
                  }`}
                >
                  <div className="flex-shrink-0">
                    {done ? (
                      <CheckCircle2 size={18} className="text-[#a6e3a1]" />
                    ) : isActive ? (
                      <Play size={18} className="text-[#cba6f7]" />
                    ) : (
                      <Circle size={18} className="text-[#9399b2]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium truncate ${isActive ? "text-[#cba6f7]" : done ? "text-[#9399b2]" : "text-[#cdd6f4]"}`}
                    >
                      {idx + 1}. {lesson.title}
                    </p>
                    {lesson.duration_minutes > 0 && (
                      <p className="text-[10px] text-[#9399b2] mt-0.5">
                        {lesson.duration_minutes} min
                      </p>
                    )}
                  </div>
                </button>
              );
            })}

            {/* Quiz row */}
            {totalLessons > 0 && (
              <div
                className={`p-4 flex items-center gap-3 ${courseCompleted ? "" : "opacity-50"}`}
              >
                {courseCompleted ? (
                  <GraduationCap size={18} className="text-[#fab387]" />
                ) : (
                  <Lock size={18} className="text-[#9399b2]" />
                )}
                <div>
                  <p className="text-xs font-medium text-[#cdd6f4]">
                    Final Exam
                  </p>
                  <p className="text-[10px] text-[#9399b2]">
                    {courseCompleted
                      ? "Unlocked!"
                      : "Complete all lessons first"}
                  </p>
                </div>
                {courseCompleted && (
                  <Link
                    to={`/courses/${id}/quiz`}
                    className="ml-auto text-[10px] bg-[#fab387]/20 text-[#fab387] px-2 py-1 rounded-lg hover:bg-[#fab387]/30 transition"
                  >
                    Start →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
