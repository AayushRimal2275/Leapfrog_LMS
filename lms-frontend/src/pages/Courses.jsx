// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { BookOpen, Clock, BarChart2, Tag, ChevronRight } from "lucide-react";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Autoplay, Pagination } from "swiper/modules";
// import "swiper/css";
// import "swiper/css/pagination";
// import api from "../services/api";
// import toast from "react-hot-toast";

// const levelColors = {
//   beginner: "bg-[#a6e3a1]/20 text-[#a6e3a1]",
//   intermediate: "bg-[#fab387]/20 text-[#fab387]",
//   advanced: "bg-[#f38ba8]/20 text-[#f38ba8]",
// };

// export default function Courses() {
//   const [courses, setCourses] = useState([]);
//   const [enrolledIds, setEnrolledIds] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     Promise.all([api.get("/courses/"), api.get("/my-courses/")])
//       .then(([coursesRes, myRes]) => {
//         setCourses(coursesRes.data);
//         setEnrolledIds(myRes.data.map((e) => e.course.id));
//       })
//       .catch(() => {})
//       .finally(() => setLoading(false));
//   }, []);

//   const handleEnroll = async (courseId) => {
//     if (enrolledIds.includes(courseId)) return;
//     try {
//       await api.post("/enroll/", { course_id: courseId });
//       setEnrolledIds((prev) => [...prev, courseId]);
//       toast.success("Enrolled! Start learning now.");
//     } catch (err) {
//       toast.error(err.response?.data?.error || "Enrollment failed");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="w-8 h-8 rounded-full border-4 border-[#cba6f7] border-t-transparent animate-spin" />
//       </div>
//     );
//   }

//   const featured = courses.filter((c) => c.is_featured);

//   return (
//     <div className="space-y-8 animate-fade-in">
//       <div className="animate-fade-in-up">
//         {/* was #e1e6f5 (very close to white, harsh) → #cdd6f4 matches system text */}
//         <h1 className="text-2xl font-bold text-[#cdd6f4]">Courses</h1>
//         {/* was #96969b (dim gray) → #9399b2 (soft lavender-gray, LMS-appropriate) */}
//         <p className="text-[#9399b2] text-sm mt-1">
//           Level up your skills with expert-curated courses
//         </p>
//       </div>

//       {/* Featured Slider */}
//       {featured.length > 0 && (
//         <div className="animate-fade-in-up stagger-1">
//           {/* was #d2d2d4 (harsh bright gray) → #bac2de */}
//           <h2 className="text-sm font-semibold text-[#bac2de] uppercase tracking-wider mb-3">
//             Featured
//           </h2>
//           <Swiper
//             modules={[Autoplay, Pagination]}
//             autoplay={{ delay: 4000, disableOnInteraction: false }}
//             pagination={{ clickable: true }}
//             loop
//             className="rounded-2xl"
//           >
//             {featured.map((course) => (
//               <SwiperSlide key={course.id}>
//                 <div className="relative bg-gradient-to-br from-[#1e1e2e] to-[#181825] border border-[#313244] rounded-2xl overflow-hidden">
//                   <div className="flex flex-col md:flex-row">
//                     <div className="md:w-1/3 bg-[#313244] flex items-center justify-center p-8 min-h-[200px]">
//                       {course.thumbnail ? (
//                         <img
//                           src={course.thumbnail}
//                           alt={course.title}
//                           className="max-h-32 object-contain"
//                         />
//                       ) : (
//                         <BookOpen size={48} className="text-[#585b70]" />
//                       )}
//                     </div>
//                     <div className="flex-1 p-6 flex flex-col justify-center">
//                       <span
//                         className={`text-xs px-2 py-0.5 rounded-full font-medium w-fit mb-3 ${levelColors[course.level]}`}
//                       >
//                         {course.level}
//                       </span>
//                       <h3 className="text-xl font-bold text-[#cdd6f4] mb-2">
//                         {course.title}
//                       </h3>
//                       {/* was #6c7086 → #9399b2 — description text must be readable */}
//                       <p className="text-[#9399b2] text-sm mb-4 line-clamp-2">
//                         {course.description}
//                       </p>
//                       <div className="flex items-center gap-4 mb-4 text-xs text-[#9399b2]">
//                         <span className="flex items-center gap-1">
//                           <Clock size={12} /> {course.duration}
//                         </span>
//                         <span className="flex items-center gap-1">
//                           <BookOpen size={12} /> {course.lesson_count} lessons
//                         </span>
//                       </div>
//                       <div className="flex gap-3">
//                         {enrolledIds.includes(course.id) ? (
//                           <Link
//                             to={`/courses/${course.id}/learn`}
//                             className="bg-[#a6e3a1] text-[#11111b] px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition hover:scale-105"
//                           >
//                             Continue Learning →
//                           </Link>
//                         ) : (
//                           <button
//                             onClick={() => handleEnroll(course.id)}
//                             className="bg-gradient-to-r from-[#cba6f7] to-[#89b4fa] text-[#11111b] px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition hover:scale-105"
//                           >
//                             Enroll Now
//                           </button>
//                         )}
//                         <Link
//                           to={`/courses/${course.id}/learn`}
//                           className="border border-[#313244] text-[#bac2de] px-4 py-2 rounded-xl text-sm hover:bg-[#313244] hover:text-[#cdd6f4] transition"
//                         >
//                           Preview
//                         </Link>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </SwiperSlide>
//             ))}
//           </Swiper>
//         </div>
//       )}

//       {/* All Courses */}
//       <div className="animate-fade-in-up stagger-2">
//         {/* was #d2d2d4 → #bac2de */}
//         <h2 className="text-sm font-semibold text-[#bac2de] uppercase tracking-wider mb-3">
//           All Courses
//         </h2>
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {courses.map((course, i) => {
//             const enrolled = enrolledIds.includes(course.id);
//             return (
//               <div
//                 key={course.id}
//                 className={`bg-[#1e1e2e] border border-[#313244] rounded-2xl overflow-hidden hover:border-[#cba6f7] transition group animate-fade-in-up stagger-${(i % 5) + 1}`}
//               >
//                 <div className="h-36 bg-[#313244] flex items-center justify-center p-6">
//                   {course.thumbnail ? (
//                     <img
//                       src={course.thumbnail}
//                       alt={course.title}
//                       className="max-h-full object-contain group-hover:scale-105 transition duration-300"
//                     />
//                   ) : (
//                     <BookOpen size={36} className="text-[#585b70]" />
//                   )}
//                 </div>
//                 <div className="p-4">
//                   <div className="flex items-start justify-between gap-2 mb-2">
//                     <h3 className="text-[#cdd6f4] font-semibold text-sm group-hover:text-[#cba6f7] transition line-clamp-1">
//                       {course.title}
//                     </h3>
//                     <span
//                       className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${levelColors[course.level]}`}
//                     >
//                       {course.level}
//                     </span>
//                   </div>
//                   {/* was #98989b (dim gray) → #9399b2 (warm readable) */}
//                   <p className="text-[#9399b2] text-xs line-clamp-2 mb-3">
//                     {course.description}
//                   </p>

//                   {/* was #aeb2d6 (slightly washed) → #bac2de (cleaner lavender) */}
//                   <div className="flex items-center gap-3 text-[11px] text-[#bac2de] mb-4">
//                     <span className="flex items-center gap-1">
//                       <Clock size={11} />
//                       {course.duration}
//                     </span>
//                     <span className="flex items-center gap-1">
//                       <BarChart2 size={11} />
//                       {course.lesson_count} lessons
//                     </span>
//                   </div>

//                   {course.tags?.length > 0 && (
//                     <div className="flex flex-wrap gap-1 mb-4">
//                       {course.tags.slice(0, 3).map((tag) => (
//                         <span
//                           key={tag}
//                           /* was bg-[#313244] text-[#6c7086] — tag text too dim → #9399b2 */
//                           className="text-[10px] bg-[#313244] text-[#9399b2] px-2 py-0.5 rounded-full flex items-center gap-0.5 hover:text-[#cba6f7] transition"
//                         >
//                           <Tag size={8} />
//                           {tag}
//                         </span>
//                       ))}
//                     </div>
//                   )}

//                   {enrolled ? (
//                     <Link
//                       to={`/courses/${course.id}/learn`}
//                       className="w-full flex items-center justify-center gap-1 bg-[#a6e3a1]/20 text-[#a6e3a1] border border-[#a6e3a1]/30 py-2 rounded-xl text-sm font-medium hover:bg-[#a6e3a1]/30 transition"
//                     >
//                       Continue <ChevronRight size={14} />
//                     </Link>
//                   ) : (
//                     <button
//                       onClick={() => handleEnroll(course.id)}
//                       className="w-full bg-[#cba6f7]/20 text-[#cba6f7] border border-[#cba6f7]/30 py-2 rounded-xl text-sm font-medium hover:bg-[#cba6f7]/30 transition"
//                     >
//                       Enroll
//                     </button>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }

import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Clock,
  BarChart2,
  Tag,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import api from "../services/api";
import toast from "react-hot-toast";

const levelColors = {
  beginner: "bg-[#a6e3a1]/20 text-[#a6e3a1]",
  intermediate: "bg-[#fab387]/20 text-[#fab387]",
  advanced: "bg-[#f38ba8]/20 text-[#f38ba8]",
};

const LEVELS = ["all", "beginner", "intermediate", "advanced"];

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesRes = await api.get("/courses/");
        setCourses(coursesRes.data);
      } catch {
        toast.error("Failed to load courses.");
      }

      // Enrollment check is optional — ignore auth errors silently
      try {
        const myRes = await api.get("/my-courses/");
        setEnrolledIds(myRes.data.map((e) => e.course.id));
      } catch {
        setEnrolledIds([]);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleEnroll = async (courseId) => {
    if (enrolledIds.includes(courseId)) return;
    try {
      await api.post("/enroll/", { course_id: courseId });
      setEnrolledIds((prev) => [...prev, courseId]);
      toast.success("Enrolled! Start learning now.");
    } catch (err) {
      toast.error(err.response?.data?.error || "Enrollment failed");
    }
  };

  const featured = courses.filter((c) => c.is_featured);

  const filtered = useMemo(() => {
    let list = courses;
    if (levelFilter !== "all")
      list = list.filter((c) => c.level === levelFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.tags?.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [courses, search, levelFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-4 border-[#cba6f7] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Header + Search ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-[#cdd6f4]">Courses</h1>
          <p className="text-[#9399b2] text-sm mt-1">
            Level up your skills with expert-curated courses
          </p>
        </div>

        {/* Search + Level filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#585b70]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="bg-[#1e1e2e] border border-[#313244] rounded-xl pl-8 pr-8 py-2 text-sm text-[#cdd6f4] placeholder-[#585b70] focus:outline-none focus:border-[#cba6f7] transition w-52"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#585b70] hover:text-[#cdd6f4] transition"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Level pills */}
          <div className="flex items-center gap-1.5">
            {LEVELS.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition ${
                  levelFilter === lvl
                    ? "bg-[#cba6f7] text-[#11111b]"
                    : "bg-[#1e1e2e] border border-[#313244] text-[#9399b2] hover:border-[#cba6f7] hover:text-[#cba6f7]"
                }`}
              >
                {lvl === "all" ? "All" : lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Featured Slider (hidden when searching/filtering) ── */}
      {featured.length > 0 && !search && levelFilter === "all" && (
        <div className="animate-fade-in-up stagger-1">
          <h2 className="text-sm font-semibold text-[#bac2de] uppercase tracking-wider mb-3">
            Featured
          </h2>
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            loop
            className="rounded-2xl"
          >
            {featured.map((course) => (
              <SwiperSlide key={course.id}>
                <div className="relative bg-gradient-to-br from-[#1e1e2e] to-[#181825] border border-[#313244] rounded-2xl overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 bg-[#313244] flex items-center justify-center p-8 min-h-[200px]">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="max-h-32 object-contain"
                        />
                      ) : (
                        <BookOpen size={48} className="text-[#585b70]" />
                      )}
                    </div>
                    <div className="flex-1 p-6 flex flex-col justify-center">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium w-fit mb-3 ${levelColors[course.level]}`}
                      >
                        {course.level}
                      </span>
                      <h3 className="text-xl font-bold text-[#cdd6f4] mb-2">
                        {course.title}
                      </h3>
                      <p className="text-[#9399b2] text-sm mb-4 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex items-center gap-4 mb-4 text-xs text-[#9399b2]">
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {course.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen size={12} /> {course.lesson_count} lessons
                        </span>
                      </div>
                      <div className="flex gap-3">
                        {enrolledIds.includes(course.id) ? (
                          <Link
                            to={`/courses/${course.id}/learn`}
                            className="bg-[#a6e3a1] text-[#11111b] px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition hover:scale-105"
                          >
                            Continue Learning →
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleEnroll(course.id)}
                            className="bg-gradient-to-r from-[#cba6f7] to-[#89b4fa] text-[#11111b] px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition hover:scale-105"
                          >
                            Enroll Now
                          </button>
                        )}
                        {/* Preview → course detail page */}
                        <Link
                          to={`/courses/${course.id}`}
                          className="border border-[#313244] text-[#bac2de] px-4 py-2 rounded-xl text-sm hover:bg-[#313244] hover:text-[#cdd6f4] transition"
                        >
                          Preview
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* ── All Courses Grid ── */}
      <div className="animate-fade-in-up stagger-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#bac2de] uppercase tracking-wider">
            {search || levelFilter !== "all" ? "Results" : "All Courses"}
          </h2>
          {(search || levelFilter !== "all") && (
            <span className="text-xs text-[#585b70]">
              {filtered.length} course{filtered.length !== 1 ? "s" : ""} found
            </span>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Search size={36} className="mx-auto mb-3 text-[#313244]" />
            <p className="text-[#9399b2] text-sm">
              No courses match your search.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setLevelFilter("all");
              }}
              className="mt-3 text-xs text-[#cba6f7] hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((course, i) => {
              const enrolled = enrolledIds.includes(course.id);
              return (
                <div
                  key={course.id}
                  className={`bg-[#1e1e2e] border border-[#313244] rounded-2xl overflow-hidden hover:border-[#cba6f7] transition group animate-fade-in-up stagger-${(i % 5) + 1}`}
                >
                  {/* Thumbnail with preview overlay */}
                  <div className="h-36 bg-[#313244] flex items-center justify-center p-6 relative">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="max-h-full object-contain group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <BookOpen size={36} className="text-[#585b70]" />
                    )}
                    <Link
                      to={`/courses/${course.id}`}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200"
                    >
                      <span className="text-white text-xs font-semibold bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/30">
                        Preview Course
                      </span>
                    </Link>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-[#cdd6f4] font-semibold text-sm group-hover:text-[#cba6f7] transition line-clamp-1">
                        {course.title}
                      </h3>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${levelColors[course.level]}`}
                      >
                        {course.level}
                      </span>
                    </div>
                    <p className="text-[#9399b2] text-xs line-clamp-2 mb-3">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-[#bac2de] mb-4">
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <BarChart2 size={11} /> {course.lesson_count} lessons
                      </span>
                    </div>

                    {course.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {course.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] bg-[#313244] text-[#9399b2] px-2 py-0.5 rounded-full flex items-center gap-0.5 hover:text-[#cba6f7] transition"
                          >
                            <Tag size={8} /> {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      {enrolled ? (
                        <Link
                          to={`/courses/${course.id}/learn`}
                          className="flex-1 flex items-center justify-center gap-1 bg-[#a6e3a1]/20 text-[#a6e3a1] border border-[#a6e3a1]/30 py-2 rounded-xl text-sm font-medium hover:bg-[#a6e3a1]/30 transition"
                        >
                          Continue <ChevronRight size={14} />
                        </Link>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEnroll(course.id)}
                            className="flex-1 bg-[#cba6f7]/20 text-[#cba6f7] border border-[#cba6f7]/30 py-2 rounded-xl text-sm font-medium hover:bg-[#cba6f7]/30 transition"
                          >
                            Enroll
                          </button>
                          <Link
                            to={`/courses/${course.id}`}
                            className="px-3 py-2 border border-[#313244] text-[#9399b2] rounded-xl text-sm hover:border-[#585b70] hover:text-[#cdd6f4] transition"
                            title="Preview"
                          >
                            <Search size={14} />
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
