import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

export default function CourseDetail() {
  const { id } = useParams();

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Course Detail #{id}</h1>

      <div className="bg-white p-6 rounded-xl shadow">
        <p className="mb-4">This is where video/content will go.</p>

        <button
          onClick={() => toast.success("Marked as completed")}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Mark as Complete
        </button>
      </div>
    </div>
  );
}
