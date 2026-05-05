import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Download,
  Share2,
  Award,
  Briefcase,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

function CertificateCard({ cert, user }) {
  const cardRef = useRef(null);
  const fullName =
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
    user?.username ||
    "Learner";
  const issueDate = new Date(cert.issued_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleDownload = () => {
    const el = cardRef.current;
    if (!el) return;
    // Open a print-friendly popup
    const printWindow = window.open("", "_blank", "width=900,height=650");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate — ${cert.course_title}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Georgia, serif; background: #fff; }
            .cert { width: 840px; margin: 0 auto; padding: 0; border: 2px solid #e5e7eb; }
            .stripe { height: 10px; background: linear-gradient(90deg, #8b5cf6, #6366f1, #3b82f6); }
            .body { padding: 48px 64px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 48px; }
            .logo { font-weight: 800; font-size: 18px; color: #1e1b4b; }
            .logo span { display: block; font-size: 11px; color: #6b7280; font-weight: 400; }
            .cert-id { text-align: right; font-size: 11px; color: #9ca3af; }
            .cert-id strong { display: block; font-family: monospace; color: #6366f1; font-size: 12px; }
            .center { text-align: center; }
            .subtitle { font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; color: #9ca3af; margin-bottom: 12px; }
            .name { font-size: 44px; font-weight: 800; background: linear-gradient(135deg, #8b5cf6, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 16px; }
            .has-completed { font-size: 14px; color: #6b7280; margin-bottom: 8px; }
            .course { font-size: 28px; font-weight: 700; color: #111827; margin-bottom: 24px; }
            .badge { display: inline-flex; align-items: center; gap: 8px; background: #f0fdf4; border: 1px solid #86efac; border-radius: 99px; padding: 8px 20px; margin-bottom: 32px; font-weight: 700; color: #16a34a; font-size: 14px; }
            .divider { height: 1px; background: #e5e7eb; margin-bottom: 28px; }
            .sigs { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; text-align: center; }
            .sig { border-top: 2px solid #e5e7eb; padding-top: 10px; margin-top: 30px; }
            .sig strong { display: block; font-size: 14px; }
            .sig span { font-size: 12px; color: #9ca3af; }
            .footer { background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 14px 64px; display: flex; gap: 12px; align-items: center; }
            .tag { background: #ede9fe; color: #7c3aed; font-size: 11px; padding: 3px 10px; border-radius: 99px; }
            .bottom-stripe { height: 6px; background: linear-gradient(90deg, #8b5cf6, #6366f1, #3b82f6); }
          </style>
        </head>
        <body>
          <div class="cert">
            <div class="stripe"></div>
            <div class="body">
              <div class="header">
                <div class="logo">Leapfrog Connect <span>Skills-to-Jobs Platform</span></div>
                <div class="cert-id">Certificate ID<strong>${cert.certificate_id}</strong></div>
              </div>
              <div class="center">
                <div class="subtitle">This is to certify that</div>
                <div class="name">${fullName}</div>
                <div class="has-completed">has successfully completed the course</div>
                <div class="course">${cert.course_title}</div>
                <div class="badge">✓ Certificate of Completion</div>
                <div class="divider"></div>
                <div class="sigs">
                  <div><div class="sig"><strong>Roshan Karki</strong><span>CEO, Leapfrog Technology</span></div></div>
                  <div><div class="sig"><strong>${issueDate}</strong><span>Date of Issue</span></div></div>
                  <div><div class="sig"><strong>Leapfrog Connect</strong><span>Authorized Signatory</span></div></div>
                </div>
              </div>
            </div>
            <div class="footer"><span style="font-size:12px;color:#9ca3af;font-weight:600">Skills:</span><span class="tag">Certified</span></div>
            <div class="bottom-stripe"></div>
          </div>
          <script>window.onload = () => { window.print(); window.close(); }<\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
    toast.success("Certificate opened for download");
  };

  const handleShare = () => {
    const text = `I just earned a certificate in "${cert.course_title}" on Leapfrog Connect! 🎓 ID: ${cert.certificate_id}`;
    if (navigator.share) {
      navigator.share({ title: "My Certificate", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Certificate details copied to clipboard!");
    }
  };

  return (
    <div
      ref={cardRef}
      className="bg-[#1e1e2e] border border-[#313244] rounded-2xl overflow-hidden hover:border-[#cba6f7]/50 transition group"
    >
      {/* Top gradient stripe */}
      <div className="h-1.5 bg-gradient-to-r from-[#cba6f7] via-[#89b4fa] to-[#a6e3a1]" />

      {/* Certificate preview body */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#cba6f7] to-[#89b4fa] flex items-center justify-center flex-shrink-0">
              <span className="text-[#11111b] font-black text-[10px]">LFC</span>
            </div>
            <div>
              <p className="text-[#cdd6f4] font-bold text-sm leading-tight">
                Leapfrog Connect
              </p>
              <p className="text-[#9399b2] text-[10px]">
                Skills-to-Jobs Platform
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[#9399b2] text-[10px]">Certificate ID</p>
            <p className="text-[#cba6f7] text-[11px] font-mono font-bold">
              {cert.certificate_id}
            </p>
          </div>
        </div>

        {/* Main cert content */}
        <div className="text-center py-4 px-2">
          <p className="text-[#9399b2] text-[11px] uppercase tracking-widest mb-3">
            This is to certify that
          </p>
          <h2 className="text-2xl font-black bg-gradient-to-r from-[#cba6f7] to-[#89b4fa] bg-clip-text text-transparent mb-2">
            {fullName}
          </h2>
          <p className="text-[#9399b2] text-sm mb-2">
            has successfully completed
          </p>
          <h3 className="text-[#cdd6f4] text-lg font-bold mb-5">
            {cert.course_title}
          </h3>

          {/* Pass badge */}
          <div className="inline-flex items-center gap-2 bg-[#a6e3a1]/10 border border-[#a6e3a1]/30 rounded-full px-4 py-2 mb-5">
            <CheckCircle size={14} className="text-[#a6e3a1]" />
            <span className="text-[#a6e3a1] text-xs font-semibold">
              Certificate of Completion
            </span>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#313244] to-transparent mb-5" />

          {/* Signatories */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              ["Roshan Karki", "CEO, Leapfrog"],
              [issueDate, "Date of Issue"],
              ["Leapfrog Connect", "Authorized"],
            ].map(([val, role], i) => (
              <div key={i} className="border-t border-[#313244] pt-3 mt-6">
                <p className="text-[#cdd6f4] text-xs font-semibold">{val}</p>
                <p className="text-[#9399b2] text-[10px] mt-0.5">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skills strip */}
      <div className="px-6 py-3 bg-[#181825] border-t border-[#313244] flex items-center gap-2">
        <span className="text-[#9399b2] text-[11px] font-medium">Skills:</span>
        <span className="text-[10px] bg-[#313244] text-[#cba6f7] px-2 py-0.5 rounded-full">
          Certified
        </span>
        <span className="text-[10px] bg-[#313244] text-[#89b4fa] px-2 py-0.5 rounded-full">
          {cert.course_title.split(" ")[0]}
        </span>
      </div>

      {/* Bottom stripe */}
      <div className="h-1 bg-gradient-to-r from-[#cba6f7] via-[#89b4fa] to-[#a6e3a1]" />

      {/* Actions */}
      <div className="px-6 py-4 flex gap-2">
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 border border-[#313244] text-[#9399b2] hover:text-[#cdd6f4] py-2 rounded-xl text-sm hover:bg-[#313244] transition"
        >
          <Share2 size={14} />
          Share
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#cba6f7] to-[#89b4fa] text-[#11111b] py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition"
        >
          <Download size={14} />
          Download
        </button>
      </div>
    </div>
  );
}

export default function Certificates() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/my-certificates/")
      .then((res) => setCertificates(res.data))
      .catch(() => toast.error("Failed to load certificates"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-4 border-[#cba6f7] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#cdd6f4]">Certificates</h1>
          <p className="text-[#9399b2] text-sm mt-1">
            {certificates.length > 0
              ? `You've earned ${certificates.length} certificate${certificates.length > 1 ? "s" : ""}`
              : "Complete courses and pass exams to earn certificates"}
          </p>
        </div>
        {certificates.length > 0 && (
          <div className="flex items-center gap-2 bg-[#a6e3a1]/10 border border-[#a6e3a1]/30 rounded-xl px-4 py-2">
            <Award size={16} className="text-[#a6e3a1]" />
            <span className="text-[#a6e3a1] text-sm font-semibold">
              {certificates.length} Earned
            </span>
          </div>
        )}
      </div>

      {/* Empty state */}
      {certificates.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-[#1e1e2e] border border-[#313244] flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={36} className="text-[#9399b2]" />
          </div>
          <h2 className="text-[#cdd6f4] font-semibold text-lg mb-2">
            No certificates yet
          </h2>
          <p className="text-[#9399b2] text-sm mb-6 max-w-sm mx-auto">
            Enroll in a course, complete all lessons, then pass the final exam
            to earn your first certificate.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/courses"
              className="flex items-center gap-2 bg-gradient-to-r from-[#cba6f7] to-[#89b4fa] text-[#11111b] px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition"
            >
              Browse Courses <ArrowRight size={14} />
            </Link>
            <Link
              to="/my-courses"
              className="flex items-center gap-2 border border-[#313244] text-[#cdd6f4] px-5 py-2.5 rounded-xl text-sm hover:bg-[#1e1e2e] transition"
            >
              My Learning
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Unlock jobs CTA */}
          <div className="flex items-center gap-4 bg-gradient-to-r from-[#cba6f7]/10 to-[#89b4fa]/10 border border-[#cba6f7]/20 rounded-2xl p-4">
            <div className="w-10 h-10 rounded-xl bg-[#cba6f7]/20 flex items-center justify-center flex-shrink-0">
              <Briefcase size={18} className="text-[#cba6f7]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#cdd6f4] font-semibold text-sm">
                Your certificates unlock job opportunities!
              </p>
              <p className="text-[#9399b2] text-xs mt-0.5">
                Apply to positions that require your earned credentials.
              </p>
            </div>
            <Link
              to="/jobs"
              className="flex-shrink-0 flex items-center gap-1.5 bg-[#cba6f7] text-[#11111b] px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition"
            >
              Browse Jobs <ArrowRight size={13} />
            </Link>
          </div>

          {/* Certificate grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <CertificateCard key={cert.id} cert={cert} user={user} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
