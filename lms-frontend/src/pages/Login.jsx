import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, GraduationCap, Eye, EyeOff } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) return toast.error("Fill in all fields");
    setLoading(true);
    try {
      // 1. Get the JWT token
      const res = await api.post("/token/", { username: email, password });

      // 2. Store token + fetch user via context (atomic — user is set BEFORE navigate)
      await login(res.data.access);

      toast.success("Welcome back!");

      // 3. Now navigate — PrivateRoute will see the token AND the user is ready
      navigate("/", { replace: true });
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#11111b] flex animate-fade-in">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-[#1e1e2e] to-[#181825] p-12 border-r border-[#313244]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#cba6f7] to-[#89b4fa] flex items-center justify-center">
            <GraduationCap size={18} className="text-[#11111b]" />
          </div>
          <span className="text-[#cdd6f4] font-bold text-lg">
            Leapfrog Connect
          </span>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-[#cdd6f4] leading-tight mb-4">
            Your skills-to-jobs
            <br />
            journey starts here.
          </h1>
          <p className="text-[#9399b2] text-sm leading-relaxed">
            Learn in-demand skills, earn certificates, and connect with top
            employers in Nepal.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              ["500+", "Learners"],
              ["2", "Courses"],
              ["10+", "Jobs"],
            ].map(([n, l]) => (
              <div key={l} className="bg-[#313244] rounded-xl p-4 text-center">
                <p className="text-[#cba6f7] font-bold text-xl">{n}</p>
                <p className="text-[#9399b2] text-xs mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[#45475a] text-xs">
          © 2025 Leapfrog Connect Pvt. Ltd.
        </p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#cdd6f4] mb-1">Sign in</h2>
            <p className="text-[#9399b2] text-sm">
              Enter your credentials to continue
            </p>
          </div>

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs text-[#9399b2] mb-1.5 font-medium">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9399b2]"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="w-full bg-[#1e1e2e] border border-[#313244] rounded-xl pl-9 pr-4 py-3 text-sm text-[#cdd6f4] placeholder-[#45475a] focus:outline-none focus:border-[#cba6f7] transition"
                  placeholder="kapil@gmail.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-[#9399b2] mb-1.5 font-medium">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9399b2]"
                />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="w-full bg-[#1e1e2e] border border-[#313244] rounded-xl pl-9 pr-10 py-3 text-sm text-[#cdd6f4] placeholder-[#45475a] focus:outline-none focus:border-[#cba6f7] transition"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9399b2] hover:text-[#cdd6f4] transition"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#cba6f7] to-[#89b4fa] text-[#11111b] font-semibold py-3 rounded-xl text-sm hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-[#11111b] border-t-transparent animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </div>

          <p className="text-center text-sm text-[#9399b2] mt-6">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-[#cba6f7] hover:underline font-medium"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
