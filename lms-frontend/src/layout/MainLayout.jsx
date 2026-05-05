// import Sidebar from "../components/Sidebar";
// import Navbar from "../components/Navbar";

// export default function MainLayout({ children }) {
//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Sidebar */}
//       <Sidebar />

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col">
//         <Navbar />

//         <main className="p-6 overflow-y-auto">{children}</main>
//       </div>
//     </div>
//   );
// }

import Sidebar from "../components/Sidebar";

export default function MainLayout({ children }) {
  return (
    <div className="flex bg-[#11111b] min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
