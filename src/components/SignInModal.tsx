import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Loader2, X, Sparkles, Shield, Bookmark, ThumbsUp } from "lucide-react";

interface SignInModalProps {
  open: boolean;
  onClose: () => void;
}

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const perks = [
  { icon: ThumbsUp,  text: "Like & save videos" },
  { icon: Bookmark,  text: "Build your personal library" },
  { icon: Sparkles,  text: "Personalised recommendations" },
  { icon: Shield,    text: "Secure sign-in via Google" },
];

const SignInModal = ({ open, onClose }: SignInModalProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const { user } = useAuth();

  // Close as soon as the user becomes authenticated
  useEffect(() => {
    if (user && open) onClose();
  }, [user, open, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        queryParams: { access_type: "offline", prompt: "select_account" },
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    /* ── Backdrop ── */
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{
        background: "rgba(4, 3, 12, 0.75)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* ── Card ── */}
      <div
        className="relative w-full max-w-sm rounded-3xl overflow-hidden"
        style={{
          background: "rgba(18, 15, 35, 0.85)",
          backdropFilter: "blur(32px) saturate(200%)",
          WebkitBackdropFilter: "blur(32px) saturate(200%)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        {/* Top shimmer line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)" }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full transition-all z-10"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <X className="h-4 w-4 text-white/70" />
        </button>

        {/* ── Glow orbs ── */}
        <div
          className="absolute -top-16 -left-16 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(220,38,38,0.2) 0%, transparent 70%)" }}
        />

        <div className="relative px-8 pt-10 pb-8">

          {/* ── Logo + heading ── */}
          <div className="flex flex-col items-center text-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
              style={{
                background: "linear-gradient(135deg, rgba(220,38,38,0.9), rgba(153,27,27,0.9))",
                boxShadow: "0 8px 24px rgba(220,38,38,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
            >
              <span className="text-white font-bold text-xl tracking-tight">ADØ</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-white/50 leading-relaxed">
              Sign in to unlock the full experience
            </p>
          </div>

          {/* ── Perks list ── */}
          <div
            className="rounded-2xl p-4 mb-6 space-y-3"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {perks.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  <Icon className="h-3.5 w-3.5 text-white/70" />
                </div>
                <span className="text-sm text-white/65">{text}</span>
              </div>
            ))}
          </div>

          {/* ── Google button ── */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 h-12 rounded-2xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: loading
                ? "rgba(255,255,255,0.08)"
                : "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.18)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
            onMouseEnter={(e) => {
              if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.16)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = loading ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.1)";
            }}
          >
            {loading
              ? <Loader2 className="h-5 w-5 animate-spin text-white/70" />
              : <GoogleIcon />
            }
            {loading ? "Redirecting to Google…" : "Continue with Google"}
          </button>

          {/* ── Error ── */}
          {error && (
            <div
              className="mt-3 px-4 py-2.5 rounded-xl text-xs text-red-300 text-center"
              style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.25)" }}
            >
              {error}
            </div>
          )}

          {/* ── Legal ── */}
          <p className="mt-6 text-center text-[11px] text-white/30 leading-relaxed">
            By continuing you agree to our{" "}
            <span className="text-white/50 underline cursor-pointer hover:text-white/70 transition-colors">Terms</span>
            {" "}and{" "}
            <span className="text-white/50 underline cursor-pointer hover:text-white/70 transition-colors">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInModal;
