// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://127.0.0.1:8000/api",
// });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");

//   // 🔥 Strict check
//   if (token && token !== "null" && token !== "undefined") {
//     config.headers.Authorization = `Bearer ${token}`;
//   } else {
//     // ❌ Remove header if invalid
//     delete config.headers.Authorization;
//   }

//   return config;
// });

// // 🔥 OPTIONAL (VERY IMPORTANT - handles expired token)
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Token invalid → force logout
//       localStorage.removeItem("token");
//       window.location.href = "/login"; // redirect
//     }
//     return Promise.reject(error);
//   },
// );

// export default api;

import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && token !== "null" && token !== "undefined") {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
