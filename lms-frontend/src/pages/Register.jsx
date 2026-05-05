import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, GraduationCap } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

export default function Register() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleRegister = async () => {
    if (!form.email || !form.password)
      return toast.error("Email and password required");
    setLoading(true);
    try {
      await api.post("/register/", form);
      toast.success("Account created! Please sign in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#11111b] flex items-center justify-center p-8 animate-fade-in">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#cba6f7] to-[#89b4fa] flex items-center justify-center">
            <GraduationCap size={18} className="text-[#11111b]" />
          </div>
          <span className="text-[#cdd6f4] font-bold">Leapfrog Connect</span>
        </div>

        <h2 className="text-2xl font-bold text-[#cdd6f4] mb-1">
          Create account
        </h2>
        <p className="text-[#9399b2] text-sm mb-8">
          Join the skills-to-jobs platform
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              ["first_name", "First name", User],
              ["last_name", "Last name", User],
            ].map(([k, pl, Icon]) => (
              <div key={k}>
                <div className="relative">
                  <Icon
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9399b2]"
                  />
                  <input
                    value={form[k]}
                    onChange={update(k)}
                    className="w-full bg-[#1e1e2e] border border-[#313244] rounded-xl pl-9 pr-3 py-3 text-sm text-[#cdd6f4] placeholder-[#45475a] focus:outline-none focus:border-[#cba6f7] transition"
                    placeholder={pl}
                  />
                </div>
              </div>
            ))}
          </div>

          {[
            ["email", "Email", Mail, "email"],
            ["password", "Password", Lock, "password"],
          ].map(([k, pl, Icon, type]) => (
            <div key={k} className="relative">
              <Icon
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9399b2]"
              />
              <input
                type={type}
                value={form[k]}
                onChange={update(k)}
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                className="w-full bg-[#1e1e2e] border border-[#313244] rounded-xl pl-9 pr-4 py-3 text-sm text-[#cdd6f4] placeholder-[#45475a] focus:outline-none focus:border-[#cba6f7] transition"
                placeholder={pl}
              />
            </div>
          ))}

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#cba6f7] to-[#89b4fa] text-[#11111b] font-semibold py-3 rounded-xl text-sm hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </div>

        <p className="text-center text-sm text-[#9399b2] mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#cba6f7] hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
