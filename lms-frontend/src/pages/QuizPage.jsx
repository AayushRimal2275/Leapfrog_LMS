import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Clock,
  CheckCircle2,
  XCircle,
  GraduationCap,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Trophy,
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

const STATES = {
  LOADING: "loading",
  READY: "ready",
  TAKING: "taking",
  SUBMITTED: "submitted",
  ERROR: "error",
};

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [state, setState] = useState(STATES.LOADING);
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/quiz/${id}/`)
      .then((res) => {
        setQuiz(res.data);
        setTimeLeft(res.data.time_limit_minutes * 60);
        setState(STATES.READY);
      })
      .catch((err) => {
        setError(err.response?.data?.error || "Cannot load quiz");
        setState(STATES.ERROR);
      });
  }, [id]);

  const submitQuiz = useCallback(
    async (finalAnswers) => {
      try {
        const res = await api.post(`/quiz/${quiz.id}/submit/`, {
          answers: finalAnswers,
        });
        setResult(res.data);
        setState(STATES.SUBMITTED);
      } catch {
        toast.error("Submission failed");
      }
    },
    [quiz],
  );

  // Timer
  useEffect(() => {
    if (state !== STATES.TAKING) return;
    if (timeLeft <= 0) {
      toast.error("Time's up!");
      submitQuiz(answers);
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [state, timeLeft, answers, submitQuiz]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleAnswer = (qId, option) => {
    setAnswers((prev) => ({ ...prev, [String(qId)]: option }));
  };

  if (state === STATES.LOADING) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-4 border-[#cba6f7] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (state === STATES.ERROR) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <AlertTriangle size={48} className="text-[#fab387] mx-auto mb-4" />
        <h2 className="text-[#cdd6f4] font-bold text-xl mb-2">
          Cannot Access Quiz
        </h2>
        <p className="text-[#9399b2] mb-6">{error}</p>
        <Link
          to={`/courses/${id}/learn`}
          className="text-[#cba6f7] hover:underline text-sm"
        >
          ← Back to course
        </Link>
      </div>
    );
  }

  if (state === STATES.SUBMITTED && result) {
    return (
      <div className="max-w-xl mx-auto py-10">
        <div
          className={`bg-[#1e1e2e] border rounded-2xl p-8 text-center ${result.passed ? "border-[#a6e3a1]" : "border-[#f38ba8]"}`}
        >
          <div
            className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4 ${result.passed ? "bg-[#a6e3a1]/20" : "bg-[#f38ba8]/20"}`}
          >
            {result.passed ? (
              <Trophy size={36} className="text-[#a6e3a1]" />
            ) : (
              <XCircle size={36} className="text-[#f38ba8]" />
            )}
          </div>

          <h2
            className={`text-2xl font-black mb-1 ${result.passed ? "text-[#a6e3a1]" : "text-[#f38ba8]"}`}
          >
            {result.passed ? "Passed! 🎉" : "Not Passed"}
          </h2>
          <p className="text-[#9399b2] text-sm mb-6">
            {result.passed
              ? "Congratulations! Your certificate has been issued."
              : "Keep studying and try again."}
          </p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              [
                "Score",
                `${result.score}%`,
                result.passed ? "#a6e3a1" : "#f38ba8",
              ],
              ["Correct", `${result.correct}/${result.total}`, "#89b4fa"],
              [
                "Status",
                result.passed ? "Pass" : "Fail",
                result.passed ? "#a6e3a1" : "#f38ba8",
              ],
            ].map(([label, val, color]) => (
              <div key={label} className="bg-[#313244] rounded-xl p-3">
                <p className="text-[10px] text-[#9399b2] mb-1">{label}</p>
                <p className="font-bold text-lg" style={{ color }}>
                  {val}
                </p>
              </div>
            ))}
          </div>

          {result.certificate && (
            <div className="bg-gradient-to-r from-[#cba6f7]/10 to-[#89b4fa]/10 border border-[#cba6f7]/30 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-center gap-3">
                <GraduationCap size={24} className="text-[#cba6f7]" />
                <div>
                  <p className="text-[#cdd6f4] font-semibold text-sm">
                    Certificate Issued
                  </p>
                  <p className="text-[#9399b2] text-xs font-mono">
                    {result.certificate.certificate_id}
                  </p>
                </div>
                <Link
                  to="/certificates"
                  className="ml-auto bg-[#cba6f7] text-[#11111b] px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition"
                >
                  View
                </Link>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Link
              to="/courses"
              className="flex-1 border border-[#313244] text-[#cdd6f4] py-2.5 rounded-xl text-sm hover:bg-[#313244] transition text-center"
            >
              All Courses
            </Link>
            {!result.passed && (
              <Link
                to={`/courses/${id}/learn`}
                className="flex-1 bg-[#cba6f7]/20 text-[#cba6f7] border border-[#cba6f7]/30 py-2.5 rounded-xl text-sm hover:bg-[#cba6f7]/30 transition text-center"
              >
                Review Course
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (state === STATES.READY) {
    return (
      <div className="max-w-lg mx-auto py-10">
        <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl p-8 text-center">
          <GraduationCap size={48} className="text-[#cba6f7] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#cdd6f4] mb-2">
            {quiz.title}
          </h2>
          <p className="text-[#9399b2] text-sm mb-6">
            Test your knowledge and earn your certificate
          </p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              ["Questions", quiz.questions.length, "#cba6f7"],
              ["Time Limit", `${quiz.time_limit_minutes} min`, "#89b4fa"],
              ["Pass Score", `${quiz.pass_percentage}%`, "#a6e3a1"],
            ].map(([label, val, color]) => (
              <div key={label} className="bg-[#313244] rounded-xl p-3">
                <p className="text-[10px] text-[#9399b2] mb-1">{label}</p>
                <p className="font-bold text-lg" style={{ color }}>
                  {val}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-[#fab387]/10 border border-[#fab387]/30 rounded-xl p-3 mb-6 text-left flex gap-2">
            <AlertTriangle
              size={15}
              className="text-[#fab387] flex-shrink-0 mt-0.5"
            />
            <p className="text-[#fab387] text-xs">
              Once started, the timer cannot be paused. Make sure you have
              enough time before beginning.
            </p>
          </div>

          <button
            onClick={() => setState(STATES.TAKING)}
            className="w-full bg-gradient-to-r from-[#cba6f7] to-[#89b4fa] text-[#11111b] py-3 rounded-xl font-bold hover:opacity-90 transition"
          >
            Start Exam
          </button>
        </div>
      </div>
    );
  }

  // TAKING state
  const questions = quiz.questions;
  const q = questions[currentQ];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;
  const timerUrgent = timeLeft < 300; // < 5 minutes

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Timer + progress */}
      <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-[#9399b2] text-xs">
            Question {currentQ + 1} of {questions.length}
          </p>
          <div className="flex gap-1 mt-2">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQ(i)}
                className={`w-6 h-1.5 rounded-full transition ${
                  answers[String(questions[i].id)]
                    ? "bg-[#a6e3a1]"
                    : i === currentQ
                      ? "bg-[#cba6f7]"
                      : "bg-[#313244]"
                }`}
              />
            ))}
          </div>
        </div>
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg ${
            timerUrgent
              ? "bg-[#f38ba8]/20 text-[#f38ba8]"
              : "bg-[#313244] text-[#cdd6f4]"
          }`}
        >
          <Clock size={16} />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Question */}
      <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl p-6">
        <p className="text-[#9399b2] text-xs mb-3 uppercase tracking-wider">
          Question {currentQ + 1}
        </p>
        <h3 className="text-[#cdd6f4] font-semibold text-lg mb-6 leading-relaxed">
          {q.text}
        </h3>

        <div className="space-y-3">
          {["A", "B", "C", "D"].map((opt) => {
            const val = q[`option_${opt.toLowerCase()}`];
            if (!val) return null;
            const selected = answers[String(q.id)] === opt;
            return (
              <button
                key={opt}
                onClick={() => handleAnswer(q.id, opt)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition ${
                  selected
                    ? "border-[#cba6f7] bg-[#cba6f7]/10 text-[#cba6f7]"
                    : "border-[#313244] text-[#cdd6f4] hover:border-[#585b70] hover:bg-[#313244]/50"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    selected
                      ? "bg-[#cba6f7] text-[#11111b]"
                      : "bg-[#313244] text-[#9399b2]"
                  }`}
                >
                  {opt}
                </div>
                <span className="text-sm">{val}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
          disabled={currentQ === 0}
          className="flex items-center gap-2 border border-[#313244] text-[#cdd6f4] px-4 py-2.5 rounded-xl text-sm hover:bg-[#313244] transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} /> Previous
        </button>

        <span className="text-[#9399b2] text-xs">
          {answeredCount}/{questions.length} answered
        </span>

        {currentQ < questions.length - 1 ? (
          <button
            onClick={() =>
              setCurrentQ((q) => Math.min(questions.length - 1, q + 1))
            }
            className="flex items-center gap-2 bg-[#313244] text-[#cdd6f4] px-4 py-2.5 rounded-xl text-sm hover:bg-[#45475a] transition"
          >
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={() => submitQuiz(answers)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#a6e3a1] to-[#89b4fa] text-[#11111b] px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition"
          >
            <CheckCircle2 size={15} /> Submit Exam
          </button>
        )}
      </div>
    </div>
  );
}
