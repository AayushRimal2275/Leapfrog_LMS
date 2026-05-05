import { Briefcase, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

export default function JobCard({ job }) {
  const navigate = useNavigate();

  const handleApply = async (e) => {
    e.stopPropagation(); // 🔥 prevent card click

    try {
      await api.post("/apply/", {
        job_id: job.id,
      });

      toast.success("Applied successfully");
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
      onClick={() => navigate(`/jobs/${job.id}`)}
      className="cursor-pointer p-4 bg-white rounded-xl shadow hover:shadow-md transition"
    >
      <div className="flex items-center gap-2 mb-2">
        <Briefcase size={18} />
        <h2 className="font-semibold">{job.title}</h2>
      </div>

      <p className="text-sm text-gray-500">{job.company}</p>

      <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
        <MapPin size={14} />
        {job.location}
      </div>

      <span className="inline-block mt-3 text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
        {job.status}
      </span>

      {/* 🔥 APPLY BUTTON */}
      <button
        onClick={handleApply}
        className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        Apply
      </button>
    </div>
  );
}
