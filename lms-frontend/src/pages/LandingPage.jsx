import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Users,
  Award,
  Zap,
  ArrowRight,
  ChevronDown,
  Menu,
  X,
  BookOpen,
  Briefcase,
  Calendar,
  Star,
  GraduationCap,
  TrendingUp,
  Shield,
  Code,
} from "lucide-react";

/* ─── tiny hook: detect if element is on-screen ─── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ─── Animated section wrapper ─── */
function Reveal({ children, delay = 0, className = "" }) {
  const [ref, visible] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Stats counter ─── */
function Counter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useInView();
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [visible, target]);
  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const FEATURES = [
  {
    icon: BookOpen,
    color: "#cba6f7",
    label: "Structured Courses",
    desc: "Industry-aligned curriculum built with real job requirements in mind.",
  },
  {
    icon: Briefcase,
    color: "#89dceb",
    label: "Job Board",
    desc: "Browse curated openings and apply directly from your profile.",
  },
  {
    icon: Award,
    color: "#a6e3a1",
    label: "Verified Certificates",
    desc: "Earn credentials that employers can verify instantly.",
  },
  {
    icon: Calendar,
    color: "#fab387",
    label: "Live Events",
    desc: "Workshops, webinars, and networking sessions every week.",
  },
  {
    icon: TrendingUp,
    color: "#f38ba8",
    label: "Progress Tracking",
    desc: "Visual dashboards that show exactly where you stand.",
  },
  {
    icon: Users,
    color: "#cba6f7",
    label: "Talent Pool",
    desc: "HR teams browse verified candidates by skill and certification.",
  },
];

const TESTIMONIALS = [
  {
    name: "Maya R.",
    role: "Software Engineer",
    stars: 5,
    quote:
      "I spent months on courses with nothing to show. Three projects later, I had two interviews in a week.",
  },
  {
    name: "James K.",
    role: "Hiring Manager",
    stars: 5,
    quote:
      "Hiring used to take weeks of screening. Now I see verified work before the first call.",
  },
  {
    name: "Carlos M.",
    role: "Data Analyst",
    stars: 5,
    quote:
      "No more resume black holes. Employers saw my work and I landed the exact role I trained for.",
  },
];

const FAQS = [
  {
    q: "Is this just another learning platform?",
    a: "No. We don't just teach — we verify skills and connect you directly with employers who need what you know.",
  },
  {
    q: "Do I need experience to start?",
    a: "Some baseline knowledge in your field helps, but no prior job experience is required.",
  },
  {
    q: "How are certificates verified?",
    a: "Your completed courses and quiz results are reviewed and signed. Employers can scan a QR code to confirm.",
  },
  {
    q: "How do employers find me?",
    a: "HR teams search the talent pool by skill and certification. Your profile shows real proof, not just claims.",
  },
  {
    q: "What if I'm switching careers?",
    a: "Perfect use case. Build verified skills in your target field while you work, then switch with confidence.",
  },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [orbAngle, setOrbAngle] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* slow rotating hero orbs */
  useEffect(() => {
    let raf;
    const tick = () => {
      setOrbAngle((a) => a + 0.15);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMobileOpen(false);
  };

  const navLinks = [
    { label: "Home", id: "hero" },
    { label: "Features", id: "features" },
    { label: "How it works", id: "how-it-works" },
    { label: "Testimonials", id: "testimonials" },
    { label: "FAQ", id: "faq" },
  ];

  return (
    <div
      style={{
        background: "#11111b",
        color: "#cdd6f4",
        fontFamily: "'Sora', 'Inter', system-ui, sans-serif",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      {/* ── Google Font ── */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* ══════════════════════════ NAVBAR ══════════════════════════ */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: scrolled ? "rgba(17,17,27,0.95)" : "rgba(17,17,27,0.85)",
          backdropFilter: "blur(14px)",
          borderBottom: scrolled
            ? "1px solid #313244"
            : "1px solid transparent",
          transition: "all 0.3s ease",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 68,
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg,#cba6f7,#89dceb)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <GraduationCap size={20} color="#11111b" />
            </div>
            <span
              style={{
                fontWeight: 800,
                fontSize: 18,
                color: "#cdd6f4",
                letterSpacing: "-0.3px",
              }}
            >
              LeapFrog
            </span>
          </div>

          {/* Desktop nav */}
          <div
            style={{ display: "flex", gap: 4, alignItems: "center" }}
            className="lp-hidden-mobile"
          >
            {navLinks.map((l) => (
              <button
                key={l.id}
                onClick={() => scrollTo(l.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9399b2",
                  fontSize: 14,
                  fontWeight: 500,
                  padding: "8px 14px",
                  borderRadius: 8,
                  transition: "all 0.2s",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "#cba6f7";
                  e.target.style.background = "#1e1e2e";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "#9399b2";
                  e.target.style.background = "none";
                }}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* CTA buttons */}
          <div
            style={{ display: "flex", gap: 10, alignItems: "center" }}
            className="lp-hidden-mobile"
          >
            <Link
              to="/login"
              style={{
                color: "#cdd6f4",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 500,
                padding: "8px 18px",
                borderRadius: 8,
                border: "1px solid #313244",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#cba6f7";
                e.currentTarget.style.color = "#cba6f7";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#313244";
                e.currentTarget.style.color = "#cdd6f4";
              }}
            >
              Log in
            </Link>
            <Link
              to="/register"
              style={{
                background: "#cba6f7",
                color: "#11111b",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 700,
                padding: "8px 20px",
                borderRadius: 8,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#b48eda";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#cba6f7";
              }}
            >
              Sign up free
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#cdd6f4",
              padding: 8,
            }}
            className="lp-show-mobile"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            style={{
              background: "#1e1e2e",
              borderTop: "1px solid #313244",
              padding: "16px 24px 24px",
            }}
          >
            {navLinks.map((l) => (
              <button
                key={l.id}
                onClick={() => scrollTo(l.id)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#cdd6f4",
                  fontSize: 15,
                  fontWeight: 500,
                  padding: "12px 0",
                  fontFamily: "inherit",
                  borderBottom: "1px solid #313244",
                }}
              >
                {l.label}
              </button>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <Link
                to="/login"
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "11px",
                  borderRadius: 8,
                  border: "1px solid #313244",
                  color: "#cdd6f4",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                Log in
              </Link>
              <Link
                to="/register"
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "11px",
                  borderRadius: 8,
                  background: "#cba6f7",
                  color: "#11111b",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                Sign up free
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* spacer */}
      <div style={{ height: 68 }} />

      {/* ══════════════════════════ HERO ══════════════════════════ */}
      <section
        id="hero"
        style={{
          position: "relative",
          minHeight: "92vh",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          background:
            "linear-gradient(135deg,#11111b 0%,#1e1e2e 50%,#11111b 100%)",
        }}
      >
        {/* Animated orb background */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div
            style={{
              position: "absolute",
              width: 520,
              height: 520,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(203,166,247,0.18) 0%, transparent 70%)",
              top: "50%",
              left: "55%",
              transform: `translate(-50%,-50%) rotate(${orbAngle}deg) translateX(80px)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 380,
              height: 380,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(137,220,235,0.13) 0%, transparent 70%)",
              top: "30%",
              left: "60%",
              transform: `translate(-50%,-50%) rotate(${-orbAngle * 0.7}deg) translateX(60px)`,
            }}
          />
          <svg
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              opacity: 0.04,
            }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="#cdd6f4"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 1200,
            margin: "0 auto",
            padding: "80px 24px",
            width: "100%",
          }}
        >
          <div style={{ maxWidth: 680 }}>
            {/* Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(203,166,247,0.12)",
                border: "1px solid rgba(203,166,247,0.3)",
                borderRadius: 99,
                padding: "6px 16px",
                marginBottom: 28,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#cba6f7",
                  boxShadow: "0 0 8px #cba6f7",
                }}
              />
              <span
                style={{
                  color: "#cba6f7",
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "0.3px",
                }}
              >
                Skills → Proof → Hired
              </span>
            </div>

            <h1
              style={{
                fontSize: "clamp(42px,6vw,76px)",
                fontWeight: 800,
                lineHeight: 1.08,
                color: "#cdd6f4",
                marginBottom: 24,
                letterSpacing: "-1.5px",
              }}
            >
              Skills don't get you hired.
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg,#cba6f7,#89dceb)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Proof does.
              </span>
            </h1>

            <p
              style={{
                fontSize: 19,
                color: "#9399b2",
                lineHeight: 1.65,
                marginBottom: 40,
                maxWidth: 520,
              }}
            >
              Build real projects. Get your skills verified. Match with
              employers who need exactly what you know.
            </p>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link
                to="/register"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#cba6f7",
                  color: "#11111b",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: 16,
                  padding: "14px 28px",
                  borderRadius: 10,
                  transition: "all 0.2s",
                  boxShadow: "0 0 32px rgba(203,166,247,0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#b48eda";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#cba6f7";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Start for free <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  border: "1px solid #45475a",
                  color: "#cdd6f4",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: 16,
                  padding: "14px 28px",
                  borderRadius: 10,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#cba6f7";
                  e.currentTarget.style.color = "#cba6f7";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#45475a";
                  e.currentTarget.style.color = "#cdd6f4";
                }}
              >
                Log in
              </Link>
            </div>

            {/* social proof mini */}
            <div
              style={{
                marginTop: 48,
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div style={{ display: "flex" }}>
                {["#cba6f7", "#89dceb", "#a6e3a1", "#fab387"].map((c, i) => (
                  <div
                    key={i}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: c,
                      border: "2px solid #11111b",
                      marginLeft: i === 0 ? 0 : -8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#11111b",
                      }}
                    >
                      {["M", "J", "C", "A"][i]}
                    </span>
                  </div>
                ))}
              </div>
              <span style={{ color: "#6c7086", fontSize: 14 }}>
                <strong style={{ color: "#cdd6f4" }}>1,200+</strong> learners
                already building proof
              </span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            opacity: 0.4,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: "#6c7086",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            scroll
          </span>
          <ChevronDown
            size={16}
            color="#6c7086"
            style={{ animation: "lp-bounce 1.5s ease-in-out infinite" }}
          />
        </div>
      </section>

      {/* ══════════════════════════ STATS ══════════════════════════ */}
      <section
        style={{
          background: "#1e1e2e",
          borderTop: "1px solid #313244",
          borderBottom: "1px solid #313244",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "52px 24px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
            gap: 32,
          }}
        >
          {[
            { n: 1200, s: "+", label: "Learners enrolled" },
            { n: 340, s: "+", label: "Courses available" },
            { n: 98, s: "%", label: "Completion rate" },
            { n: 80, s: "+", label: "Hiring partners" },
          ].map((stat, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 44,
                    fontWeight: 800,
                    color: "#cba6f7",
                    lineHeight: 1,
                    marginBottom: 6,
                  }}
                >
                  <Counter target={stat.n} suffix={stat.s} />
                </div>
                <div
                  style={{ color: "#6c7086", fontSize: 14, fontWeight: 500 }}
                >
                  {stat.label}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════════════════════ FEATURES ══════════════════════════ */}
      <section
        id="features"
        style={{ padding: "96px 24px", background: "#11111b" }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <p
                style={{
                  color: "#cba6f7",
                  fontWeight: 600,
                  fontSize: 13,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  marginBottom: 14,
                }}
              >
                Everything you need
              </p>
              <h2
                style={{
                  fontSize: "clamp(32px,4vw,52px)",
                  fontWeight: 800,
                  color: "#cdd6f4",
                  letterSpacing: "-0.8px",
                  marginBottom: 16,
                }}
              >
                One platform. Courses to career.
              </h2>
              <p
                style={{
                  color: "#9399b2",
                  fontSize: 18,
                  maxWidth: 480,
                  margin: "0 auto",
                }}
              >
                From your first lesson to your first offer — LeapFrog has every
                step covered.
              </p>
            </div>
          </Reveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
              gap: 20,
            }}
          >
            {FEATURES.map((f, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div
                  style={{
                    background: "#1e1e2e",
                    border: "1px solid #313244",
                    borderRadius: 16,
                    padding: "28px 28px",
                    transition: "all 0.25s",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = f.color;
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.3)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#313244";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: `${f.color}22`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 18,
                    }}
                  >
                    <f.icon size={24} color={f.color} />
                  </div>
                  <h3
                    style={{
                      fontWeight: 700,
                      fontSize: 17,
                      color: "#cdd6f4",
                      marginBottom: 8,
                    }}
                  >
                    {f.label}
                  </h3>
                  <p
                    style={{ color: "#9399b2", fontSize: 14, lineHeight: 1.6 }}
                  >
                    {f.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ HOW IT WORKS ══════════════════════════ */}
      <section
        id="how-it-works"
        style={{ padding: "96px 24px", background: "#1e1e2e" }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 72 }}>
              <p
                style={{
                  color: "#89dceb",
                  fontWeight: 600,
                  fontSize: 13,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  marginBottom: 14,
                }}
              >
                Simple process
              </p>
              <h2
                style={{
                  fontSize: "clamp(32px,4vw,52px)",
                  fontWeight: 800,
                  color: "#cdd6f4",
                  letterSpacing: "-0.8px",
                }}
              >
                Three steps. No fluff.
              </h2>
            </div>
          </Reveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
              gap: 32,
              position: "relative",
            }}
          >
            {[
              {
                n: "01",
                icon: Code,
                color: "#cba6f7",
                title: "Learn & build",
                desc: "Take structured courses and complete real projects that show job-ready skills.",
              },
              {
                n: "02",
                icon: Shield,
                color: "#89dceb",
                title: "Get verified",
                desc: "Your work is reviewed and certified. Employers see proof — not promises.",
              },
              {
                n: "03",
                icon: Briefcase,
                color: "#a6e3a1",
                title: "Get matched & hired",
                desc: "HR teams browse verified candidates. Your work lands the interview.",
              },
            ].map((step, i) => (
              <Reveal key={i} delay={i * 0.12}>
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      background: "#11111b",
                      border: "1px solid #313244",
                      borderRadius: 20,
                      padding: "36px 32px",
                      height: "100%",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 20,
                        marginBottom: 20,
                      }}
                    >
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 14,
                          background: `${step.color}1a`,
                          border: `1px solid ${step.color}44`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <step.icon size={24} color={step.color} />
                      </div>
                      <span
                        style={{
                          fontSize: 48,
                          fontWeight: 800,
                          color: "#313244",
                          lineHeight: 1,
                          letterSpacing: "-2px",
                        }}
                      >
                        {step.n}
                      </span>
                    </div>
                    <h3
                      style={{
                        fontWeight: 700,
                        fontSize: 20,
                        color: "#cdd6f4",
                        marginBottom: 10,
                      }}
                    >
                      {step.title}
                    </h3>
                    <p
                      style={{
                        color: "#9399b2",
                        fontSize: 15,
                        lineHeight: 1.65,
                      }}
                    >
                      {step.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.3}>
            <div style={{ textAlign: "center", marginTop: 56 }}>
              <Link
                to="/register"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  background: "linear-gradient(135deg,#cba6f7,#89dceb)",
                  color: "#11111b",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: 16,
                  padding: "15px 36px",
                  borderRadius: 12,
                  transition: "all 0.25s",
                  boxShadow: "0 4px 24px rgba(203,166,247,0.25)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 32px rgba(203,166,247,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 24px rgba(203,166,247,0.25)";
                }}
              >
                Get started — it's free <ArrowRight size={18} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════ FOR WHO ══════════════════════════ */}
      <section style={{ padding: "96px 24px", background: "#11111b" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))",
            gap: 28,
          }}
        >
          {/* Job seekers */}
          <Reveal>
            <div
              style={{
                background: "#1e1e2e",
                border: "1px solid #313244",
                borderRadius: 20,
                padding: "44px 36px",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  background: "rgba(203,166,247,0.15)",
                  border: "1px solid rgba(203,166,247,0.3)",
                  color: "#cba6f7",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  borderRadius: 99,
                  padding: "5px 14px",
                  marginBottom: 24,
                }}
              >
                For job seekers
              </div>
              <h3
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: "#cdd6f4",
                  marginBottom: 28,
                  lineHeight: 1.2,
                }}
              >
                Stop learning in circles. Start getting hired.
              </h3>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 18 }}
              >
                {[
                  "Build a portfolio that proves you're ready",
                  "Get seen directly by hiring managers",
                  "Skip the resume black hole",
                  "Know exactly what to build next",
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                    }}
                  >
                    <Zap
                      size={18}
                      color="#cba6f7"
                      style={{ flexShrink: 0, marginTop: 2 }}
                    />
                    <span
                      style={{
                        color: "#9399b2",
                        fontSize: 15,
                        lineHeight: 1.5,
                      }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                to="/register"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 36,
                  background: "#cba6f7",
                  color: "#11111b",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: 15,
                  padding: "12px 24px",
                  borderRadius: 10,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#b48eda")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#cba6f7")
                }
              >
                Start learning <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>

          {/* Employers */}
          <Reveal delay={0.1}>
            <div
              style={{
                background: "#1e1e2e",
                border: "1px solid #313244",
                borderRadius: 20,
                padding: "44px 36px",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  background: "rgba(137,220,235,0.15)",
                  border: "1px solid rgba(137,220,235,0.3)",
                  color: "#89dceb",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  borderRadius: 99,
                  padding: "5px 14px",
                  marginBottom: 24,
                }}
              >
                For employers
              </div>
              <h3
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: "#cdd6f4",
                  marginBottom: 28,
                  lineHeight: 1.2,
                }}
              >
                Hire people who can do the work. Not just talk about it.
              </h3>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 18 }}
              >
                {[
                  "See actual projects before the interview",
                  "Browse candidates verified by skill",
                  "Reduce hiring risk dramatically",
                  "Access ready-to-hire talent instantly",
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                    }}
                  >
                    <Users
                      size={18}
                      color="#89dceb"
                      style={{ flexShrink: 0, marginTop: 2 }}
                    />
                    <span
                      style={{
                        color: "#9399b2",
                        fontSize: 15,
                        lineHeight: 1.5,
                      }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                to="/register"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 36,
                  background: "#89dceb",
                  color: "#11111b",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: 15,
                  padding: "12px 24px",
                  borderRadius: 10,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#74c7ec")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#89dceb")
                }
              >
                Browse talent <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════ TESTIMONIALS ══════════════════════════ */}
      <section
        id="testimonials"
        style={{ padding: "96px 24px", background: "#1e1e2e" }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <p
                style={{
                  color: "#a6e3a1",
                  fontWeight: 600,
                  fontSize: 13,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  marginBottom: 14,
                }}
              >
                Real stories
              </p>
              <h2
                style={{
                  fontSize: "clamp(30px,4vw,48px)",
                  fontWeight: 800,
                  color: "#cdd6f4",
                  letterSpacing: "-0.8px",
                }}
              >
                People who've been through it
              </h2>
            </div>
          </Reveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
              gap: 20,
            }}
          >
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div
                  style={{
                    background: "#11111b",
                    border: "1px solid #313244",
                    borderRadius: 18,
                    padding: "32px 28px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 20,
                  }}
                >
                  <div style={{ display: "flex", gap: 4 }}>
                    {Array(t.stars)
                      .fill(0)
                      .map((_, j) => (
                        <Star
                          key={j}
                          size={16}
                          fill="#cba6f7"
                          color="#cba6f7"
                        />
                      ))}
                  </div>
                  <p
                    style={{
                      color: "#9399b2",
                      fontSize: 15,
                      lineHeight: 1.7,
                      fontStyle: "italic",
                      flex: 1,
                    }}
                  >
                    "{t.quote}"
                  </p>
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        color: "#cba6f7",
                        fontSize: 15,
                      }}
                    >
                      — {t.name}
                    </div>
                    <div
                      style={{
                        color: "#6c7086",
                        fontSize: 13,
                        marginTop: 2,
                      }}
                    >
                      {t.role}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ FAQ ══════════════════════════ */}
      <section id="faq" style={{ padding: "96px 24px", background: "#11111b" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <h2
                style={{
                  fontSize: "clamp(30px,4vw,48px)",
                  fontWeight: 800,
                  color: "#cdd6f4",
                  letterSpacing: "-0.8px",
                  marginBottom: 12,
                }}
              >
                Questions? Answers.
              </h2>
              <p style={{ color: "#9399b2", fontSize: 16 }}>
                Everything you need to know before you sign up.
              </p>
            </div>
          </Reveal>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {FAQS.map((faq, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <div
                  style={{
                    background: "#1e1e2e",
                    border: "1px solid",
                    borderColor: openFaq === i ? "#cba6f7" : "#313244",
                    borderRadius: 14,
                    overflow: "hidden",
                    transition: "border-color 0.2s",
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "20px 24px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#cdd6f4",
                      fontWeight: 600,
                      fontSize: 15,
                      textAlign: "left",
                      gap: 16,
                      fontFamily: "inherit",
                    }}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      color="#cba6f7"
                      style={{
                        flexShrink: 0,
                        transition: "transform 0.25s",
                        transform:
                          openFaq === i ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  </button>
                  {openFaq === i && (
                    <div
                      style={{
                        padding: "0 24px 20px",
                        color: "#9399b2",
                        fontSize: 14,
                        lineHeight: 1.7,
                      }}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ FINAL CTA ══════════════════════════ */}
      <section
        style={{
          padding: "96px 24px",
          background: "linear-gradient(135deg,#1e1e2e 0%,#181825 100%)",
          borderTop: "1px solid #313244",
        }}
      >
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                background: "linear-gradient(135deg,#cba6f7,#89dceb)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 28px",
              }}
            >
              <GraduationCap size={32} color="#11111b" />
            </div>
            <h2
              style={{
                fontSize: "clamp(30px,4vw,52px)",
                fontWeight: 800,
                color: "#cdd6f4",
                letterSpacing: "-0.8px",
                marginBottom: 16,
              }}
            >
              Ready to build proof that gets you hired?
            </h2>
            <p
              style={{
                color: "#9399b2",
                fontSize: 17,
                lineHeight: 1.65,
                marginBottom: 40,
              }}
            >
              Join LeapFrog — the platform that connects what you can do with
              who's hiring.
            </p>
            <div
              style={{
                display: "flex",
                gap: 14,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link
                to="/register"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  background: "#cba6f7",
                  color: "#11111b",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: 16,
                  padding: "15px 34px",
                  borderRadius: 12,
                  transition: "all 0.2s",
                  boxShadow: "0 0 40px rgba(203,166,247,0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#b48eda";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#cba6f7";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Get started free <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  border: "1px solid #45475a",
                  color: "#cdd6f4",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: 16,
                  padding: "15px 34px",
                  borderRadius: 12,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#cba6f7";
                  e.currentTarget.style.color = "#cba6f7";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#45475a";
                  e.currentTarget.style.color = "#cdd6f4";
                }}
              >
                Already have an account
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════ FOOTER ══════════════════════════ */}
      <footer
        style={{
          background: "#0d0d17",
          borderTop: "1px solid #1e1e2e",
          padding: "48px 24px 32px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
              gap: 40,
              marginBottom: 40,
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "linear-gradient(135deg,#cba6f7,#89dceb)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <GraduationCap size={17} color="#11111b" />
                </div>
                <span style={{ fontWeight: 800, color: "#cdd6f4" }}>
                  LeapFrog
                </span>
              </div>
              <p style={{ color: "#6c7086", fontSize: 13, lineHeight: 1.65 }}>
                Skills to hiring — no fluff in between.
              </p>
            </div>
            {[
              {
                title: "Platform",
                links: ["Courses", "Jobs", "Events", "Certificates"],
              },
              { title: "Company", links: ["About", "Blog", "Careers"] },
              { title: "Legal", links: ["Privacy", "Terms"] },
            ].map((col) => (
              <div key={col.title}>
                <h4
                  style={{
                    color: "#cdd6f4",
                    fontWeight: 700,
                    fontSize: 14,
                    marginBottom: 14,
                    letterSpacing: "0.3px",
                  }}
                >
                  {col.title}
                </h4>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {col.links.map((l) => (
                    <li key={l}>
                      <a
                        href="#"
                        style={{
                          color: "#6c7086",
                          fontSize: 14,
                          textDecoration: "none",
                          transition: "color 0.2s",
                        }}
                        onMouseEnter={(e) => (e.target.style.color = "#cba6f7")}
                        onMouseLeave={(e) => (e.target.style.color = "#6c7086")}
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div
            style={{
              borderTop: "1px solid #1e1e2e",
              paddingTop: 24,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <p style={{ color: "#45475a", fontSize: 13 }}>
              © 2026 LeapFrog. All rights reserved.
            </p>
            <div style={{ display: "flex", gap: 20 }}>
              {["Privacy", "Terms"].map((l) => (
                <a
                  key={l}
                  href="#"
                  style={{
                    color: "#45475a",
                    fontSize: 13,
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => (e.target.style.color = "#cba6f7")}
                  onMouseLeave={(e) => (e.target.style.color = "#45475a")}
                >
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ══════ global style tweaks ══════ */}
      <style>{`
        @keyframes lp-bounce {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(6px); }
        }
        @media (max-width: 768px) {
          .lp-hidden-mobile { display: none !important; }
          .lp-show-mobile   { display: block !important; }
        }
        @media (min-width: 769px) {
          .lp-show-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}
