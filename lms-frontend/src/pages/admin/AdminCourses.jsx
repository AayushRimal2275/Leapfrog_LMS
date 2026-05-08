import { useEffect, useState } from "react";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  X,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

const LEVELS = ["beginner", "intermediate", "advanced"];
const EMPTY_COURSE = {
  title: "",
  description: "",
  thumbnail: "",
  level: "beginner",
  duration: "",
  tags: "",
  is_featured: false,
  category_id: "",
};
const EMPTY_LESSON = {
  title: "",
  youtube_url: "",
  content: "",
  order: 0,
  duration_minutes: 0,
};
const EMPTY_QUESTION = {
  text: "",
  question_type: "mcq",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_answer: "A",
  order: 0,
};

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Course modal
  const [courseModal, setCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState(EMPTY_COURSE);
  const [saving, setSaving] = useState(false);

  // Lesson modal
  const [lessonModal, setLessonModal] = useState(null); // { course, lesson? }
  const [lessonForm, setLessonForm] = useState(EMPTY_LESSON);

  // Expanded course row (shows lessons + quiz panel)
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [courseLessons, setCourseLessons] = useState({}); // { courseId: [lessons] }
  const [courseQuiz, setCourseQuiz] = useState({}); // { courseId: quiz|null }

  // Quiz modal
  const [quizModal, setQuizModal] = useState(null); // course
  const [quizForm, setQuizForm] = useState({
    title: "",
    time_limit_minutes: 30,
    pass_percentage: 70,
  });

  // Question modal
  const [questionModal, setQuestionModal] = useState(null); // { quizId, question? }
  const [questionForm, setQuestionForm] = useState(EMPTY_QUESTION);

  // ── loaders ──
  const load = () => {
    Promise.all([api.get("/courses/"), api.get("/admin/categories/")])
      .then(([c, cat]) => {
        setCourses(c.data);
        setCategories(cat.data);
      })
      .finally(() => setLoading(false));
  };

  const loadCourseDetail = async (courseId) => {
    const [lessonsRes, quizRes] = await Promise.all([
      api.get(`/courses/${courseId}/`),
      api.get(`/admin/courses/${courseId}/quiz/`).catch(() => ({ data: null })),
    ]);
    setCourseLessons((p) => ({
      ...p,
      [courseId]: lessonsRes.data.lessons || [],
    }));
    setCourseQuiz((p) => ({ ...p, [courseId]: quizRes.data }));
  };

  useEffect(() => {
    load();
  }, []);

  const toggleExpand = (courseId) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
      return;
    }
    setExpandedCourse(courseId);
    loadCourseDetail(courseId);
  };

  // ── Course CRUD ──
  const openCreateCourse = () => {
    setEditingCourse(null);
    setCourseForm(EMPTY_COURSE);
    setCourseModal(true);
  };
  const openEditCourse = (course) => {
    setEditingCourse(course.id);
    setCourseForm({
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      level: course.level,
      duration: course.duration,
      tags: Array.isArray(course.tags) ? course.tags.join(", ") : course.tags,
      is_featured: course.is_featured,
      category_id: course.category?.id || "",
    });
    setCourseModal(true);
  };
  const handleSaveCourse = async () => {
    if (!courseForm.title || !courseForm.description)
      return toast.error("Title and description required");
    setSaving(true);
    try {
      const tagsArray =
        typeof courseForm.tags === "string"
          ? courseForm.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : courseForm.tags || [];
      const payload = {
        ...courseForm,
        tags: JSON.stringify(tagsArray),
        category_id: courseForm.category_id || null,
      };
      if (editingCourse) {
        await api.patch(`/admin/courses/${editingCourse}/update/`, payload);
        toast.success("Course updated ✅");
      } else {
        await api.post("/admin/courses/create/", payload);
        toast.success("Course created ✅");
      }
      setCourseModal(false);
      load();
    } catch (e) {
      const err = e.response?.data;
      const msg =
        err?.title?.[0] ||
        err?.detail ||
        err?.error ||
        JSON.stringify(err) ||
        "Failed to save";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };
  const handleDeleteCourse = async (id) => {
    if (!confirm("Deactivate this course?")) return;
    await api.delete(`/admin/courses/${id}/delete/`);
    toast.success("Course deactivated");
    load();
  };

  // ── Lesson CRUD ──
  const openAddLesson = (course) => {
    setLessonModal({ course, lesson: null });
    setLessonForm(EMPTY_LESSON);
  };
  const openEditLesson = (course, lesson) => {
    setLessonModal({ course, lesson });
    setLessonForm({
      title: lesson.title,
      youtube_url: lesson.youtube_url,
      content: lesson.content,
      order: lesson.order,
      duration_minutes: lesson.duration_minutes,
    });
  };
  const handleSaveLesson = async () => {
    if (!lessonForm.title) return toast.error("Lesson title required");
    try {
      if (lessonModal.lesson) {
        await api.patch(
          `/admin/lessons/${lessonModal.lesson.id}/update/`,
          lessonForm,
        );
        toast.success("Lesson updated");
      } else {
        await api.post(
          `/admin/courses/${lessonModal.course.id}/lessons/create/`,
          lessonForm,
        );
        toast.success("Lesson added");
      }
      setLessonModal(null);
      loadCourseDetail(lessonModal.course.id);
    } catch {
      toast.error("Failed to save lesson");
    }
  };
  const handleDeleteLesson = async (courseId, lessonId) => {
    if (!confirm("Delete this lesson?")) return;
    await api.delete(`/admin/lessons/${lessonId}/delete/`);
    toast.success("Lesson deleted");
    loadCourseDetail(courseId);
  };

  // ── Quiz CRUD ──
  const openCreateQuiz = (course) => {
    setQuizModal(course);
    setQuizForm({
      title: `${course.title} — Final Quiz`,
      time_limit_minutes: 30,
      pass_percentage: 70,
    });
  };
  const handleSaveQuiz = async () => {
    try {
      await api.post(`/admin/courses/${quizModal.id}/quiz/create/`, quizForm);
      toast.success("Quiz created");
      setQuizModal(null);
      loadCourseDetail(quizModal.id);
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to create quiz");
    }
  };
  const handleDeleteQuiz = async (courseId, quizId) => {
    if (!confirm("Delete this quiz and all its questions?")) return;
    await api.delete(`/admin/quiz/${quizId}/delete/`);
    toast.success("Quiz deleted");
    loadCourseDetail(courseId);
  };

  // ── Question CRUD ──
  const openAddQuestion = (quizId) => {
    setQuestionModal({ quizId, question: null });
    setQuestionForm(EMPTY_QUESTION);
  };
  const openEditQuestion = (quizId, q) => {
    setQuestionModal({ quizId, question: q });
    setQuestionForm({
      text: q.text,
      question_type: q.question_type,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      order: q.order,
    });
  };
  const handleSaveQuestion = async () => {
    if (!questionForm.text) return toast.error("Question text required");
    if (
      questionForm.question_type === "mcq" &&
      (!questionForm.option_a ||
        !questionForm.option_b ||
        !questionForm.correct_answer)
    )
      return toast.error("MCQ needs at least option A, B and a correct answer");
    try {
      if (questionModal.question) {
        await api.patch(
          `/admin/questions/${questionModal.question.id}/update/`,
          questionForm,
        );
        toast.success("Question updated");
      } else {
        await api.post(
          `/admin/quiz/${questionModal.quizId}/questions/add/`,
          questionForm,
        );
        toast.success("Question added");
      }
      setQuestionModal(null);
      // refresh quiz for whichever course is expanded
      if (expandedCourse) loadCourseDetail(expandedCourse);
    } catch {
      toast.error("Failed to save question");
    }
  };
  const handleDeleteQuestion = async (courseId, questionId) => {
    if (!confirm("Delete this question?")) return;
    await api.delete(`/admin/questions/${questionId}/delete/`);
    toast.success("Question deleted");
    loadCourseDetail(courseId);
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-[#cdd6f4]">Courses</h1>
          <p className="text-[#9399b2] text-sm mt-1">
            {courses.length} total courses
          </p>
        </div>
        <button
          onClick={openCreateCourse}
          className="flex items-center gap-2 bg-[#f38ba8] text-[#11111b] px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition"
        >
          <Plus size={15} /> New Course
        </button>
      </div>

      {/* Course table */}
      <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl overflow-hidden animate-fade-in-up stagger-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#313244]">
              {["Course", "Level", "Lessons", "Quiz", "Status", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left text-[#9399b2] font-medium px-5 py-3 text-xs"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {courses.map((course, i) => (
              <>
                <tr
                  key={course.id}
                  className={`border-b border-[#313244]/50 hover:bg-[#313244]/20 transition animate-fade-in-up stagger-${Math.min(i + 1, 5)}`}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#313244] flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <BookOpen size={15} className="text-[#585b70]" />
                        )}
                      </div>
                      <div>
                        <p className="text-[#cdd6f4] font-medium">
                          {course.title}
                        </p>
                        {course.is_featured && (
                          <span className="text-[10px] bg-[#fab387]/20 text-[#fab387] px-1.5 py-0.5 rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <LevelBadge level={course.level} />
                  </td>
                  <td className="px-5 py-3 text-[#9399b2]">
                    {course.lesson_count}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-[11px] px-2 py-1 rounded-full font-medium ${course.quiz ? "bg-[#89b4fa]/20 text-[#89b4fa]" : "bg-[#45475a]/40 text-[#585b70]"}`}
                    >
                      {course.quiz ? "Has Quiz" : "No Quiz"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-[11px] px-2 py-1 rounded-full font-medium ${course.is_active !== false ? "bg-[#a6e3a1]/20 text-[#a6e3a1]" : "bg-[#f38ba8]/20 text-[#f38ba8]"}`}
                    >
                      {course.is_active !== false ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleExpand(course.id)}
                        className="p-1.5 rounded-lg text-[#cba6f7] hover:bg-[#cba6f7]/20 transition"
                        title="Expand"
                      >
                        {expandedCourse === course.id ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </button>
                      <button
                        onClick={() => openEditCourse(course)}
                        className="p-1.5 rounded-lg text-[#a6e3a1] hover:bg-[#a6e3a1]/20 transition"
                        title="Edit Course"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="p-1.5 rounded-lg text-[#f38ba8] hover:bg-[#f38ba8]/20 transition"
                        title="Deactivate"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Expanded panel */}
                {expandedCourse === course.id && (
                  <tr key={`exp-${course.id}`}>
                    <td
                      colSpan={6}
                      className="bg-[#181825] border-b border-[#313244] px-6 py-5"
                    >
                      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* LESSONS */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[#89b4fa] text-sm font-semibold">
                              Lessons
                            </h3>
                            <button
                              onClick={() => openAddLesson(course)}
                              className="flex items-center gap-1 text-[11px] bg-[#89b4fa]/20 text-[#89b4fa] px-2.5 py-1 rounded-lg hover:bg-[#89b4fa]/30 transition"
                            >
                              <Plus size={11} /> Add Lesson
                            </button>
                          </div>
                          <div className="space-y-2">
                            {(courseLessons[course.id] || []).length === 0 && (
                              <p className="text-[#585b70] text-xs italic">
                                No lessons yet.
                              </p>
                            )}
                            {(courseLessons[course.id] || []).map((lesson) => (
                              <div
                                key={lesson.id}
                                className="flex items-center justify-between bg-[#1e1e2e] border border-[#313244] rounded-xl px-3 py-2.5"
                              >
                                <div>
                                  <p className="text-[#cdd6f4] text-sm font-medium">
                                    {lesson.title}
                                  </p>
                                  <p className="text-[#585b70] text-[11px]">
                                    Order {lesson.order} ·{" "}
                                    {lesson.duration_minutes} min
                                  </p>
                                </div>
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() =>
                                      openEditLesson(course, lesson)
                                    }
                                    className="p-1.5 rounded-lg text-[#a6e3a1] hover:bg-[#a6e3a1]/20 transition"
                                  >
                                    <Pencil size={12} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteLesson(course.id, lesson.id)
                                    }
                                    className="p-1.5 rounded-lg text-[#f38ba8] hover:bg-[#f38ba8]/20 transition"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* QUIZ */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[#cba6f7] text-sm font-semibold">
                              Completion Quiz
                            </h3>
                            {!courseQuiz[course.id] && (
                              <button
                                onClick={() => openCreateQuiz(course)}
                                className="flex items-center gap-1 text-[11px] bg-[#cba6f7]/20 text-[#cba6f7] px-2.5 py-1 rounded-lg hover:bg-[#cba6f7]/30 transition"
                              >
                                <Plus size={11} /> Create Quiz
                              </button>
                            )}
                          </div>

                          {!courseQuiz[course.id] ? (
                            <p className="text-[#585b70] text-xs italic">
                              No quiz yet. Create one so students can get
                              certified.
                            </p>
                          ) : (
                            <div>
                              {/* Quiz meta */}
                              <div className="flex items-center justify-between bg-[#1e1e2e] border border-[#313244] rounded-xl px-3 py-2.5 mb-3">
                                <div>
                                  <p className="text-[#cdd6f4] text-sm font-medium">
                                    {courseQuiz[course.id].title}
                                  </p>
                                  <p className="text-[#585b70] text-[11px]">
                                    {courseQuiz[course.id].time_limit_minutes}{" "}
                                    min · Pass{" "}
                                    {courseQuiz[course.id].pass_percentage}%
                                  </p>
                                </div>
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() =>
                                      openAddQuestion(courseQuiz[course.id].id)
                                    }
                                    className="flex items-center gap-1 text-[11px] bg-[#cba6f7]/20 text-[#cba6f7] px-2 py-1 rounded-lg hover:bg-[#cba6f7]/30 transition"
                                  >
                                    <Plus size={11} /> Question
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteQuiz(
                                        course.id,
                                        courseQuiz[course.id].id,
                                      )
                                    }
                                    className="p-1.5 rounded-lg text-[#f38ba8] hover:bg-[#f38ba8]/20 transition"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>

                              {/* Questions list */}
                              <div className="space-y-2">
                                {(courseQuiz[course.id].questions || [])
                                  .length === 0 && (
                                  <p className="text-[#585b70] text-xs italic">
                                    No questions yet.
                                  </p>
                                )}
                                {(courseQuiz[course.id].questions || []).map(
                                  (q, qi) => (
                                    <div
                                      key={q.id}
                                      className="bg-[#1e1e2e] border border-[#313244] rounded-xl px-3 py-2.5"
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                          <p className="text-[#cdd6f4] text-sm">
                                            <span className="text-[#585b70] mr-1">
                                              Q{qi + 1}.
                                            </span>
                                            {q.text}
                                          </p>
                                          {q.question_type === "mcq" && (
                                            <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-0.5">
                                              {["A", "B", "C", "D"].map(
                                                (opt) =>
                                                  q[
                                                    `option_${opt.toLowerCase()}`
                                                  ] && (
                                                    <p
                                                      key={opt}
                                                      className={`text-[11px] ${q.correct_answer === opt ? "text-[#a6e3a1] font-semibold" : "text-[#585b70]"}`}
                                                    >
                                                      {q.correct_answer ===
                                                        opt && (
                                                        <Check
                                                          size={9}
                                                          className="inline mr-0.5"
                                                        />
                                                      )}
                                                      {opt}.{" "}
                                                      {
                                                        q[
                                                          `option_${opt.toLowerCase()}`
                                                        ]
                                                      }
                                                    </p>
                                                  ),
                                              )}
                                            </div>
                                          )}
                                          {q.question_type === "written" && (
                                            <p className="text-[#585b70] text-[11px] mt-0.5">
                                              Written answer
                                            </p>
                                          )}
                                        </div>
                                        <div className="flex gap-1 flex-shrink-0">
                                          <button
                                            onClick={() =>
                                              openEditQuestion(
                                                courseQuiz[course.id].id,
                                                q,
                                              )
                                            }
                                            className="p-1.5 rounded-lg text-[#a6e3a1] hover:bg-[#a6e3a1]/20 transition"
                                          >
                                            <Pencil size={11} />
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleDeleteQuestion(
                                                course.id,
                                                q.id,
                                              )
                                            }
                                            className="p-1.5 rounded-lg text-[#f38ba8] hover:bg-[#f38ba8]/20 transition"
                                          >
                                            <Trash2 size={11} />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        {courses.length === 0 && (
          <div className="py-16 text-center text-[#585b70]">
            <BookOpen size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm text-[#9399b2]">
              No courses yet. Create one!
            </p>
          </div>
        )}
      </div>

      {/* ── Course Modal ── */}
      {courseModal && (
        <Modal
          title={editingCourse ? "Edit Course" : "New Course"}
          onClose={() => setCourseModal(false)}
        >
          <div className="space-y-4">
            <Field label="Title">
              <Input
                value={courseForm.title}
                onChange={(v) => setCourseForm({ ...courseForm, title: v })}
                placeholder="Course title"
              />
            </Field>
            <Field label="Description">
              <textarea
                value={courseForm.description}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, description: e.target.value })
                }
                rows={3}
                className={inputCls + " resize-none"}
                placeholder="Course description"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Level">
                <select
                  value={courseForm.level}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, level: e.target.value })
                  }
                  className={inputCls}
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Duration">
                <Input
                  value={courseForm.duration}
                  onChange={(v) =>
                    setCourseForm({ ...courseForm, duration: v })
                  }
                  placeholder="e.g. 12 hours"
                />
              </Field>
            </div>
            <Field label="Thumbnail URL">
              <Input
                value={courseForm.thumbnail}
                onChange={(v) => setCourseForm({ ...courseForm, thumbnail: v })}
                placeholder="https://..."
              />
            </Field>
            <Field label="Tags (comma separated)">
              <Input
                value={courseForm.tags}
                onChange={(v) => setCourseForm({ ...courseForm, tags: v })}
                placeholder="JavaScript, React, ES6"
              />
            </Field>
            <Field label="Category">
              <select
                value={courseForm.category_id}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, category_id: e.target.value })
                }
                className={inputCls}
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={courseForm.is_featured}
                onChange={(e) =>
                  setCourseForm({
                    ...courseForm,
                    is_featured: e.target.checked,
                  })
                }
                className="accent-[#f38ba8]"
              />
              <span className="text-[#9399b2] text-sm">Featured course</span>
            </label>
            <ModalActions
              onCancel={() => setCourseModal(false)}
              onSave={handleSaveCourse}
              saving={saving}
              saveLabel={editingCourse ? "Update" : "Create"}
            />
          </div>
        </Modal>
      )}

      {/* ── Lesson Modal ── */}
      {lessonModal && (
        <Modal
          title={
            lessonModal.lesson
              ? `Edit Lesson`
              : `Add Lesson → ${lessonModal.course.title}`
          }
          onClose={() => setLessonModal(null)}
        >
          <div className="space-y-4">
            <Field label="Lesson Title">
              <Input
                value={lessonForm.title}
                onChange={(v) => setLessonForm({ ...lessonForm, title: v })}
                placeholder="Lesson title"
              />
            </Field>
            <Field label="YouTube Embed URL">
              <Input
                value={lessonForm.youtube_url}
                onChange={(v) =>
                  setLessonForm({ ...lessonForm, youtube_url: v })
                }
                placeholder="https://www.youtube.com/embed/..."
              />
            </Field>
            <Field label="Content / Notes">
              <textarea
                value={lessonForm.content}
                onChange={(e) =>
                  setLessonForm({ ...lessonForm, content: e.target.value })
                }
                rows={3}
                className={inputCls + " resize-none"}
                placeholder="Lesson description..."
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Order">
                <Input
                  type="number"
                  value={lessonForm.order}
                  onChange={(v) => setLessonForm({ ...lessonForm, order: +v })}
                />
              </Field>
              <Field label="Duration (min)">
                <Input
                  type="number"
                  value={lessonForm.duration_minutes}
                  onChange={(v) =>
                    setLessonForm({ ...lessonForm, duration_minutes: +v })
                  }
                />
              </Field>
            </div>
            <ModalActions
              onCancel={() => setLessonModal(null)}
              onSave={handleSaveLesson}
              saveLabel={lessonModal.lesson ? "Update Lesson" : "Add Lesson"}
              color="blue"
            />
          </div>
        </Modal>
      )}

      {/* ── Quiz Create Modal ── */}
      {quizModal && (
        <Modal
          title={`Create Quiz — ${quizModal.title}`}
          onClose={() => setQuizModal(null)}
        >
          <div className="space-y-4">
            <Field label="Quiz Title">
              <Input
                value={quizForm.title}
                onChange={(v) => setQuizForm({ ...quizForm, title: v })}
                placeholder="Final Quiz"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Time Limit (min)">
                <Input
                  type="number"
                  value={quizForm.time_limit_minutes}
                  onChange={(v) =>
                    setQuizForm({ ...quizForm, time_limit_minutes: +v })
                  }
                />
              </Field>
              <Field label="Pass % (e.g. 70)">
                <Input
                  type="number"
                  value={quizForm.pass_percentage}
                  onChange={(v) =>
                    setQuizForm({ ...quizForm, pass_percentage: +v })
                  }
                />
              </Field>
            </div>
            <ModalActions
              onCancel={() => setQuizModal(null)}
              onSave={handleSaveQuiz}
              saveLabel="Create Quiz"
              color="purple"
            />
          </div>
        </Modal>
      )}

      {/* ── Question Modal ── */}
      {questionModal && (
        <Modal
          title={questionModal.question ? "Edit Question" : "Add Question"}
          onClose={() => setQuestionModal(null)}
        >
          <div className="space-y-4">
            <Field label="Question Text">
              <textarea
                value={questionForm.text}
                onChange={(e) =>
                  setQuestionForm({ ...questionForm, text: e.target.value })
                }
                rows={2}
                className={inputCls + " resize-none"}
                placeholder="Enter the question..."
              />
            </Field>
            <Field label="Type">
              <select
                value={questionForm.question_type}
                onChange={(e) =>
                  setQuestionForm({
                    ...questionForm,
                    question_type: e.target.value,
                  })
                }
                className={inputCls}
              >
                <option value="mcq">Multiple Choice (MCQ)</option>
                <option value="written">Written Answer</option>
              </select>
            </Field>
            {questionForm.question_type === "mcq" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Option A">
                    <Input
                      value={questionForm.option_a}
                      onChange={(v) =>
                        setQuestionForm({ ...questionForm, option_a: v })
                      }
                      placeholder="Option A"
                    />
                  </Field>
                  <Field label="Option B">
                    <Input
                      value={questionForm.option_b}
                      onChange={(v) =>
                        setQuestionForm({ ...questionForm, option_b: v })
                      }
                      placeholder="Option B"
                    />
                  </Field>
                  <Field label="Option C">
                    <Input
                      value={questionForm.option_c}
                      onChange={(v) =>
                        setQuestionForm({ ...questionForm, option_c: v })
                      }
                      placeholder="Option C (optional)"
                    />
                  </Field>
                  <Field label="Option D">
                    <Input
                      value={questionForm.option_d}
                      onChange={(v) =>
                        setQuestionForm({ ...questionForm, option_d: v })
                      }
                      placeholder="Option D (optional)"
                    />
                  </Field>
                </div>
                <Field label="Correct Answer">
                  <select
                    value={questionForm.correct_answer}
                    onChange={(e) =>
                      setQuestionForm({
                        ...questionForm,
                        correct_answer: e.target.value,
                      })
                    }
                    className={inputCls}
                  >
                    {["A", "B", "C", "D"].map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </Field>
              </>
            )}
            <Field label="Order">
              <Input
                type="number"
                value={questionForm.order}
                onChange={(v) =>
                  setQuestionForm({ ...questionForm, order: +v })
                }
              />
            </Field>
            <ModalActions
              onCancel={() => setQuestionModal(null)}
              onSave={handleSaveQuestion}
              saveLabel={
                questionModal.question ? "Update Question" : "Add Question"
              }
              color="purple"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Shared helpers ──
const inputCls =
  "w-full bg-[#11111b] border border-[#313244] rounded-xl px-3 py-2.5 text-sm text-[#cdd6f4] placeholder-[#45475a] focus:outline-none focus:border-[#f38ba8] transition";

function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputCls}
    />
  );
}
function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs text-[#9399b2] mb-1.5 font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}
function Modal({ title, children, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#1e1e2e] border border-[#313244] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[#cdd6f4] font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#585b70] hover:text-[#cdd6f4] transition"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
function ModalActions({ onCancel, onSave, saving, saveLabel, color = "pink" }) {
  const colors = {
    pink: "bg-[#f38ba8]",
    blue: "bg-[#89b4fa]",
    purple: "bg-[#cba6f7]",
  };
  return (
    <div className="flex gap-3 pt-2">
      <button
        onClick={onCancel}
        className="flex-1 border border-[#313244] text-[#9399b2] py-2.5 rounded-xl text-sm hover:border-[#585b70] transition"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={saving}
        className={`flex-1 ${colors[color]} text-[#11111b] py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-60`}
      >
        {saving ? "Saving..." : saveLabel}
      </button>
    </div>
  );
}
function LevelBadge({ level }) {
  const colors = {
    beginner: "bg-[#a6e3a1]/20 text-[#a6e3a1]",
    intermediate: "bg-[#fab387]/20 text-[#fab387]",
    advanced: "bg-[#f38ba8]/20 text-[#f38ba8]",
  };
  return (
    <span
      className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${colors[level] || ""}`}
    >
      {level}
    </span>
  );
}
function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-4 border-[#f38ba8] border-t-transparent animate-spin" />
    </div>
  );
}
