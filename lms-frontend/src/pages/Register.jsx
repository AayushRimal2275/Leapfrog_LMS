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
import { useAuth } from "../context/AuthContext";

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
      <path
        d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.5 20-21 0-1.3-.2-2.7-.5-4z"
        fill="#FFC107"
      />
      <path
        d="M6.3 14.7l7 5.1C15.2 16 19.3 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.6 5.1 29.6 3 24 3c-7.6 0-14.2 4.2-17.7 11.7z"
        fill="#FF3D00"
      />
      <path
        d="M24 45c5.5 0 10.4-1.9 14.2-5.1l-6.5-5.5C29.6 36 26.9 37 24 37c-6 0-10.7-3.1-11.8-7.5l-7 5.4C8.5 41.2 15.7 45 24 45z"
        fill="#4CAF50"
      />
      <path
        d="M44.5 20H24v8.5h11.8c-.5 2.7-2 4.9-4.1 6.5l6.5 5.5C42 37.5 45 31.4 45 24c0-1.3-.2-2.7-.5-4z"
        fill="#1976D2"
      />
    </svg>
  );
}

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
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleGoogleRegister = () => {
    setGoogleLoading(true);
    try {
      window.google?.accounts.oauth2
        .initTokenClient({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          scope: "email profile",
          callback: async (resp) => {
            if (resp.error) {
              toast.error("Google sign-up failed");
              setGoogleLoading(false);
              return;
            }
            try {
              const res = await api.post("/auth/google/", {
                access_token: resp.access_token,
              });
              const user = await login(res.data.access);
              toast.success("Account created with Google!");
              if (user?.role === "admin") navigate("/admin", { replace: true });
              else if (user?.role === "hr") navigate("/hr", { replace: true });
              else navigate("/", { replace: true });
            } catch {
              toast.error("Google sign-up failed");
            } finally {
              setGoogleLoading(false);
            }
          },
        })
        .requestAccessToken();
    } catch {
      toast.error("Google SDK not loaded. Check your setup.");
      setGoogleLoading(false);
    }
  };

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

        {/* Google sign-up */}
        <button
          onClick={handleGoogleRegister}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 bg-[#1e1e2e] border border-[#313244] text-[#cdd6f4] py-2.5 rounded-xl text-sm hover:border-[#585b70] transition disabled:opacity-50 mb-4"
        >
          {googleLoading ? (
            <span className="w-4 h-4 rounded-full border-2 border-[#cdd6f4] border-t-transparent animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-[#313244]" />
          <span className="text-[#585b70] text-xs">or register with email</span>
          <div className="flex-1 h-px bg-[#313244]" />
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
