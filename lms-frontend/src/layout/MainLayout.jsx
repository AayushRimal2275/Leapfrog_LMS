import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile overlay
  const [collapsed, setCollapsed] = useState(false); // desktop collapse

  return (
    <div className="flex bg-[#11111b] min-h-screen">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onMobileOpen={() => setSidebarOpen(true)}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Navbar />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
