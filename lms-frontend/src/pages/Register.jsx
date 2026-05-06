import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  GraduationCap,
  Eye,
  EyeOff,
  Info,
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

export default function Register() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleRegister = async () => {
    if (!form.email || !form.password)
      return toast.error("Email and password required");
    if (form.password.length < 8)
      return toast.error("Password must be at least 8 characters");
    if (form.password !== form.confirm)
      return toast.error("Passwords do not match");
    setLoading(true);
    try {
      await api.post("/register/", {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
      });
      toast.success("Account created! Please sign in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full bg-[#1e1e2e] border border-[#313244] rounded-xl pl-9 pr-4 py-3 text-sm text-[#cdd6f4] placeholder-[#45475a] focus:outline-none focus:border-[#cba6f7] transition";

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
        <p className="text-[#9399b2] text-sm mb-5">
          Join as a learner — discover courses and apply to jobs
        </p>

        <div className="flex items-start gap-2 bg-[#1e1e2e] border border-[#313244] rounded-xl px-3.5 py-3 mb-6 text-xs text-[#9399b2]">
          <Info size={13} className="text-[#89b4fa] flex-shrink-0 mt-0.5" />
          <span>
            New accounts are registered as{" "}
            <strong className="text-[#cdd6f4]">Customer (Learner)</strong>.
            Admin and HR access is assigned by an administrator after sign-up.
          </span>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              ["first_name", "First name"],
              ["last_name", "Last name"],
            ].map(([k, pl]) => (
              <div key={k} className="relative">
                <User
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9399b2]"
                />
                <input
                  value={form[k]}
                  onChange={update(k)}
                  className={inputCls}
                  placeholder={pl}
                />
              </div>
            ))}
          </div>

          <div className="relative">
            <Mail
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9399b2]"
            />
            <input
              type="email"
              value={form.email}
              onChange={update("email")}
              className={inputCls}
              placeholder="Email address"
              autoComplete="email"
            />
          </div>

          <div className="relative">
            <Lock
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9399b2]"
            />
            <input
              type={showPass ? "text" : "password"}
              value={form.password}
              onChange={update("password")}
              className="w-full bg-[#1e1e2e] border border-[#313244] rounded-xl pl-9 pr-10 py-3 text-sm text-[#cdd6f4] placeholder-[#45475a] focus:outline-none focus:border-[#cba6f7] transition"
              placeholder="Password (min 8 characters)"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9399b2] hover:text-[#cdd6f4] transition"
            >
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          <div className="relative">
            <Lock
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9399b2]"
            />
            <input
              type={showPass ? "text" : "password"}
              value={form.confirm}
              onChange={update("confirm")}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              className={`w-full bg-[#1e1e2e] border rounded-xl pl-9 pr-4 py-3 text-sm text-[#cdd6f4] placeholder-[#45475a] focus:outline-none transition ${form.confirm && form.password !== form.confirm ? "border-[#f38ba8] focus:border-[#f38ba8]" : "border-[#313244] focus:border-[#cba6f7]"}`}
              placeholder="Confirm password"
            />
            {form.confirm && form.password !== form.confirm && (
              <p className="text-[#f38ba8] text-xs mt-1 ml-1">
                Passwords don't match
              </p>
            )}
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#cba6f7] to-[#89b4fa] text-[#11111b] font-semibold py-3 rounded-xl text-sm hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-[#11111b] border-t-transparent animate-spin" />
                Creating...
              </span>
            ) : (
              "Create account"
            )}
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
