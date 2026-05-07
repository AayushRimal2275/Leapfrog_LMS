import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, GraduationCap, ArrowLeft, CheckCircle } from "lucide-react";
import api from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await api.post("/auth/forgot-password/", { email });
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      // always show success to prevent email enumeration
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

        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#a6e3a1]/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-[#a6e3a1]" />
            </div>
            <h2 className="text-xl font-bold text-[#cdd6f4] mb-2">
              Check your inbox
            </h2>
            <p className="text-[#9399b2] text-sm mb-6">
              If <strong className="text-[#cdd6f4]">{email}</strong> is
              registered, we've sent a reset link. Check your spam folder too.
            </p>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-[#cba6f7] text-sm hover:underline"
            >
              <ArrowLeft size={14} /> Back to login
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-[#cdd6f4] mb-1">
              Forgot password?
            </h2>
            <p className="text-[#9399b2] text-sm mb-6">
              Enter your email and we'll send a reset link.
            </p>

            <div className="space-y-4">
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9399b2]"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="w-full bg-[#1e1e2e] border border-[#313244] rounded-xl pl-9 pr-4 py-3 text-sm text-[#cdd6f4] placeholder-[#45475a] focus:outline-none focus:border-[#cba6f7] transition"
                  placeholder="your@email.com"
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading || !email}
                className="w-full bg-gradient-to-r from-[#cba6f7] to-[#89b4fa] text-[#11111b] font-semibold py-3 rounded-xl text-sm hover:opacity-90 transition disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-[#11111b] border-t-transparent animate-spin" />
                    Sending...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </div>

            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-[#9399b2] text-sm mt-6 hover:text-[#cdd6f4] transition"
            >
              <ArrowLeft size={14} /> Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
