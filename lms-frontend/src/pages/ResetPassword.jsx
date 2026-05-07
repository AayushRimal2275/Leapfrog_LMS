import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Lock, GraduationCap, Eye, EyeOff, CheckCircle } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleReset = async () => {
    if (form.password.length < 8)
      return toast.error("Password must be at least 8 characters");
    if (form.password !== form.confirm)
      return toast.error("Passwords don't match");
    setLoading(true);
    try {
      await api.post("/auth/reset-password/", {
        uid,
        token,
        password: form.password,
      });
      setDone(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (e) {
      toast.error(e.response?.data?.error || "Invalid or expired link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#11111b] flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#cba6f7] to-[#89b4fa] flex items-center justify-center">
            <GraduationCap size={18} className="text-[#11111b]" />
          </div>
          <span className="text-[#cdd6f4] font-bold">Leapfrog Connect</span>
        </div>

        {done ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#a6e3a1]/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-[#a6e3a1]" />
            </div>
            <h2 className="text-xl font-bold text-[#cdd6f4] mb-2">
              Password Reset!
            </h2>
            <p className="text-[#9399b2] text-sm">
              Redirecting you to login...
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-[#cdd6f4] mb-1">
              Set new password
            </h2>
            <p className="text-[#9399b2] text-sm mb-6">
              Choose a strong password (min. 8 characters).
            </p>
            <div className="space-y-4">
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9399b2]"
                />
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  className="w-full bg-[#1e1e2e] border border-[#313244] rounded-xl pl-9 pr-10 py-3 text-sm text-[#cdd6f4] placeholder-[#45475a] focus:outline-none focus:border-[#cba6f7] transition"
                  placeholder="New password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9399b2]"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9399b2]"
                />
                <input
                  type={showPw ? "text" : "password"}
                  value={form.confirm}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, confirm: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleReset()}
                  className={`w-full bg-[#1e1e2e] border rounded-xl pl-9 pr-4 py-3 text-sm text-[#cdd6f4] placeholder-[#45475a] focus:outline-none transition ${form.confirm && form.password !== form.confirm ? "border-[#f38ba8]" : "border-[#313244] focus:border-[#cba6f7]"}`}
                  placeholder="Confirm password"
                />
              </div>
              {form.confirm && form.password !== form.confirm && (
                <p className="text-[#f38ba8] text-xs -mt-2">
                  Passwords don't match
                </p>
              )}
              <button
                onClick={handleReset}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#cba6f7] to-[#89b4fa] text-[#11111b] font-semibold py-3 rounded-xl text-sm hover:opacity-90 transition disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-[#11111b] border-t-transparent animate-spin" />
                    Resetting...
                  </span>
                ) : (
                  "Reset Password"
                )}
              </button>
            </div>
            <Link
              to="/login"
              className="block text-center text-[#9399b2] text-sm mt-5 hover:text-[#cdd6f4]"
            >
              Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
