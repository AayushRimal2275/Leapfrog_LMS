import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, GraduationCap, Eye, EyeOff, Info } from "lucide-react";
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

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const redirect = (user) => {
    if (user?.role === "admin") navigate("/admin", { replace: true });
    else if (user?.role === "hr") navigate("/hr", { replace: true });
    else navigate("/", { replace: true });
  };

  const handleLogin = async () => {
    if (!email || !password) return toast.error("Fill in all fields");
    setLoading(true);
    try {
      const res = await api.post("/token/", { username: email, password });
      const user = await login(res.data.access);
      toast.success("Welcome back!");
      redirect(user);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Google OAuth popup flow — uses Google Identity Services
    setSocialLoading("google");
    try {
      window.google?.accounts.oauth2
        .initTokenClient({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          scope: "email profile",
          callback: async (resp) => {
            if (resp.error) {
              toast.error("Google login failed");
              setSocialLoading(null);
              return;
            }
            try {
              const res = await api.post("/auth/google/", {
                access_token: resp.access_token,
              });
              const user = await login(res.data.access);
              toast.success("Signed in with Google!");
              redirect(user);
            } catch {
              toast.error("Google login failed");
            } finally {
              setSocialLoading(null);
            }
          },
        })
        .requestAccessToken();
    } catch {
      toast.error("Google SDK not loaded. Check your setup.");
      setSocialLoading(null);
    }
  };

  const handleFacebookLogin = () => {
    setSocialLoading("facebook");
    window.FB?.login(
      async (resp) => {
        if (!resp.authResponse?.accessToken) {
          toast.error("Facebook login cancelled");
          setSocialLoading(null);
          return;
        }
        try {
          const res = await api.post("/auth/facebook/", {
            access_token: resp.authResponse.accessToken,
          });
          const user = await login(res.data.access);
          toast.success("Signed in with Facebook!");
          redirect(user);
        } catch {
          toast.error("Facebook login failed");
        } finally {
          setSocialLoading(null);
        }
      },
      { scope: "email,public_profile" },
    );
  };

  return (
    <div className="min-h-screen bg-[#11111b] flex animate-fade-in">
      {/* Left panel */}
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

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#cdd6f4] mb-1">Sign in</h2>
            <p className="text-[#9399b2] text-sm">
              Enter your credentials to continue
            </p>
            <p className="text-[#585b70] text-xs mt-1.5 flex items-center gap-1">
              <Info size={11} />
              You'll be redirected based on your role (Customer / HR / Admin)
            </p>
          </div>

          {/* Email/password form — primary */}
          <div className="space-y-4 mb-5">
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
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-[#9399b2] font-medium">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[10px] text-[#cba6f7] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
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

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#cba6f7] to-[#89b4fa] text-[#11111b] font-semibold py-3 rounded-xl text-sm hover:opacity-90 transition disabled:opacity-60"
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

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-[#313244]" />
            <span className="text-[#585b70] text-xs">or continue with</span>
            <div className="flex-1 h-px bg-[#313244]" />
          </div>

          {/* Social login — secondary */}
          <div className="space-y-2.5">
            <button
              onClick={handleGoogleLogin}
              disabled={!!socialLoading}
              className="w-full flex items-center justify-center gap-3 bg-[#1e1e2e] border border-[#313244] text-[#cdd6f4] py-2.5 rounded-xl text-sm hover:border-[#585b70] transition disabled:opacity-50"
            >
              {socialLoading === "google" ? (
                <span className="w-4 h-4 rounded-full border-2 border-[#cdd6f4] border-t-transparent animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              Continue with Google
            </button>
            <button
              onClick={handleFacebookLogin}
              disabled={!!socialLoading}
              className="w-full flex items-center justify-center gap-3 bg-[#1e1e2e] border border-[#313244] text-[#cdd6f4] py-2.5 rounded-xl text-sm hover:border-[#585b70] transition disabled:opacity-50"
            >
              {socialLoading === "facebook" ? (
                <span className="w-4 h-4 rounded-full border-2 border-[#cdd6f4] border-t-transparent animate-spin" />
              ) : (
                <FacebookIcon />
              )}
              Continue with Facebook
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
