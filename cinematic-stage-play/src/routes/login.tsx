import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Film } from "lucide-react";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth-store";
import { enterGuest } from "@/lib/guest-store";
import { UserPlus } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — NEXUS" },
      { name: "description", content: "Sign in to NEXUS Cinematic Hub with your Google account, or continue as guest." },
      { property: "og:title", content: "Sign In — NEXUS" },
      { property: "og:description", content: "Sign in to NEXUS Cinematic Hub with your Google account, or continue as guest." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/", replace: true });
  }, [user, loading, navigate]);

  const handleGoogle = async () => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message || "Google sign-in failed");
        setBusy(false);
        return;
      }
      if (result.redirected) return;
      toast.success("Welcome to NEXUS");
      navigate({ to: "/" });
    } catch (e: any) {
      toast.error(e?.message ?? "Sign-in failed");
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass neon-border text-xs uppercase tracking-[0.3em] text-cyan animate-glow-pulse">
            <Sparkles className="size-3" /> Enter Nexus
          </div>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl font-bold">
            Sign in to the <span className="text-gradient">universe</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Continue with Google to track ratings, build your watchlist, and sync across devices.
          </p>
        </div>

        <div className="glass neon-border rounded-2xl p-8 space-y-6">
          <div className="flex items-center justify-center">
            <div className="size-16 rounded-2xl glass flex items-center justify-center" style={{ boxShadow: "var(--shadow-glow-cyan)" }}>
              <Film className="size-8 text-cyan" />
            </div>
          </div>

          <button
            onClick={handleGoogle}
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-3 px-5 py-3 rounded-lg bg-white text-[#1f1f1f] font-medium hover:bg-white/90 disabled:opacity-60 transition shadow-lg"
          >
            <GoogleLogo />
            <span>{busy ? "Connecting…" : "Continue with Google"}</span>
          </button>


          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            onClick={() => {
              enterGuest();
              toast.success("Exploring as guest — sign in anytime to save your data");
              navigate({ to: "/" });
            }}
            className="w-full inline-flex items-center justify-center gap-3 px-5 py-3 rounded-lg glass neon-border font-medium hover:text-cyan transition"
          >
            <UserPlus className="size-4" />
            <span>Continue as guest</span>
          </button>

          <p className="text-[11px] text-center text-muted-foreground">
            Guest mode keeps everything local. Sign in to sync across devices.
          </p>
        </div>

        <p className="text-center mt-6 text-xs text-muted-foreground">
          Having trouble? <Link to="/" className="text-cyan hover:underline">Back to home</Link>
        </p>
      </div>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.6 39.5 16.3 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C40.9 36 44 30.5 44 24c0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}
