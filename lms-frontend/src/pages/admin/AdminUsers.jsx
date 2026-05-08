import { useEffect, useState } from "react";
import {
  Users,
  Search,
  ShieldCheck,
  UserX,
  UserCheck,
  ChevronDown,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const ROLES = ["customer", "admin", "hr"];
const roleColors = {
  admin: "bg-[#f38ba8]/20 text-[#f38ba8]",
  hr: "bg-[#89dceb]/20 text-[#89dceb]",
  customer: "bg-[#cba6f7]/20 text-[#cba6f7]",
};

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [changingRole, setChangingRole] = useState(null);

  const load = () => {
    api
      .get("/admin/users/")
      .then((r) => {
        setUsers(r.data);
        setFiltered(r.data);
      })
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    let list = users;
    if (roleFilter !== "all") list = list.filter((u) => u.role === roleFilter);
    if (search)
      list = list.filter(
        (u) =>
          u.username.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase()) ||
          `${u.first_name} ${u.last_name}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      );
    setFiltered(list);
  }, [search, roleFilter, users]);

  const handleRoleChange = async (userId, newRole) => {
    if (userId === me?.id)
      return toast.error("You cannot change your own role");
    setChangingRole(userId);
    try {
      await api.patch("/admin/users/update-role/", {
        user_id: userId,
        role: newRole,
      });
      toast.success("Role updated");
      load();
    } catch (e) {
      toast.error("Failed to update role");
    } finally {
      setChangingRole(null);
    }
  };

  const handleToggleActive = async (userId) => {
    if (userId === me?.id) return toast.error("You cannot deactivate yourself");
    try {
      await api.patch(`/admin/users/${userId}/toggle-active/`);
      toast.success("User status updated");
      load();
    } catch (e) {
      toast.error("Failed");
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-[#cdd6f4]">Users</h1>
        <p className="text-[#9399b2] text-sm mt-1">
          {users.length} total users
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 animate-fade-in-up stagger-1">
        <div className="relative flex-1 min-w-48">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9399b2]"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full bg-[#1e1e2e] border border-[#313244] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#cdd6f4] placeholder-[#45475a] focus:outline-none focus:border-[#f38ba8] transition"
          />
        </div>
        <div className="flex gap-2">
          {["all", ...ROLES].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition capitalize ${roleFilter === r ? "bg-[#f38ba8] text-[#11111b]" : "bg-[#1e1e2e] border border-[#313244] text-[#9399b2] hover:border-[#585b70]"}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl overflow-hidden animate-fade-in-up stagger-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#313244]">
              {["User", "Email", "Role", "Status", "Joined", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left text-[#9399b2] font-medium px-5 py-3 text-xs"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr
                key={u.id}
                className={`border-b border-[#313244]/50 hover:bg-[#313244]/30 transition animate-fade-in-up stagger-${Math.min(i + 1, 5)}`}
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        u.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(u.first_name || u.username)}&background=313244&color=cdd6f4`
                      }
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      alt=""
                    />
                    <div>
                      <p className="text-[#f2f5fd] font-medium">
                        {u.first_name} {u.last_name}
                      </p>
                      <p className="text-[#adb8b8] text-xs">
                        @{u.username?.split("@")[0]}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-[#9399b2] text-xs">{u.email}</td>
                <td className="px-5 py-3">
                  {u.id === me?.id ? (
                    <span
                      className={`text-[11px] px-2 py-1 rounded-full font-medium ${roleColors[u.role]}`}
                    >
                      {u.role} (you)
                    </span>
                  ) : (
                    <div className="relative">
                      <select
                        value={u.role}
                        disabled={changingRole === u.id}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className={`appearance-none text-[11px] px-2 py-1 pr-6 rounded-full font-medium cursor-pointer bg-transparent border-0 outline-none ${roleColors[u.role]}`}
                      >
                        {ROLES.map((r) => (
                          <option
                            key={r}
                            value={r}
                            className="bg-[#1e1e2e] text-[#cdd6f4]"
                          >
                            {r}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={10}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60"
                        style={{
                          color:
                            u.role === "admin"
                              ? "#f38ba8"
                              : u.role === "hr"
                                ? "#89dceb"
                                : "#cba6f7",
                        }}
                      />
                    </div>
                  )}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`text-[11px] px-2 py-1 rounded-full font-medium ${u.is_active !== false ? "bg-[#a6e3a1]/20 text-[#a6e3a1]" : "bg-[#585b70]/30 text-[#585b70]"}`}
                  >
                    {u.is_active !== false ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-3 text-[#aeafb6] text-xs">
                  {u.date_joined
                    ? new Date(u.date_joined).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-5 py-3">
                  {u.id !== me?.id && (
                    <button
                      onClick={() => handleToggleActive(u.id)}
                      className={`p-1.5 rounded-lg transition ${u.is_active !== false ? "text-[#f38ba8] hover:bg-[#f38ba8]/20" : "text-[#a6e3a1] hover:bg-[#a6e3a1]/20"}`}
                      title={u.is_active !== false ? "Deactivate" : "Activate"}
                    >
                      {u.is_active !== false ? (
                        <UserX size={14} />
                      ) : (
                        <UserCheck size={14} />
                      )}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Users size={32} className="mx-auto mb-3 text-[#313244]" />
            <p className="text-sm text-[#9399b2]">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-4 border-[#f38ba8] border-t-transparent animate-spin" />
    </div>
  );
}
