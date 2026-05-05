import { Bell, UserCircle } from "lucide-react";

export default function Navbar() {
  return (
    <div className="h-16 bg-white shadow flex items-center justify-between px-6">
      <h1 className="font-semibold text-lg">Welcome back 👋</h1>

      <div className="flex items-center gap-4">
        <Bell />
        <UserCircle />
      </div>
    </div>
  );
}
