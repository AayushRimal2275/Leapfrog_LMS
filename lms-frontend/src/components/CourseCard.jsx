import { BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

export default function CourseCard({ course }) {
  const navigate = useNavigate();

  const handleEnroll = async (e) => {
    e.stopPropagation(); // 🔥 prevent navigation

    try {
      await api.post("/enroll/", {
        course_id: course.id,
      });

      toast.success("Enrolled successfully");
    } catch (err) {
      if (err.response?.data?.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  return (
    <div
      onClick={() => navigate(`/courses/${course.id}`)}
      className="cursor-pointer p-4 bg-white rounded-xl shadow hover:shadow-md transition"
    >
      <div className="flex items-center gap-2 mb-2">
        <BookOpen size={18} />
        <h2 className="font-semibold">{course.title}</h2>
      </div>

      <p className="text-sm text-gray-500 mb-4">{course.description}</p>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-2 rounded-full">
        <div
          className="bg-blue-500 h-2 rounded-full"
          style={{ width: `${course.progress || 0}%` }}
        />
      </div>

      <p className="text-xs mt-2 text-gray-500">
        {course.progress || 0}% completed
      </p>

      {/* 🔥 ENROLL BUTTON */}
      <button
        onClick={handleEnroll}
        className="mt-4 w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
      >
        Enroll
      </button>
    </div>
  );
}
