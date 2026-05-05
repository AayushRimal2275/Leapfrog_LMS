import { Swiper, SwiperSlide } from "swiper/react";

export default function CourseSlider() {
  const courses = [
    { id: 1, title: "React Basics" },
    { id: 2, title: "Django API" },
  ];

  return (
    <Swiper spaceBetween={20} slidesPerView={2}>
      {courses.map((c) => (
        <SwiperSlide key={c.id}>
          <div className="p-4 bg-white shadow rounded-xl">{c.title}</div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
