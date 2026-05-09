import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Sparkles, UserPlus, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up — NEXUS" },
      { name: "description", content: "Join NEXUS to track and rate your favorite movies." },
    ],
  }),
  component: SignupPage,
});

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80, "Name too long"),
  email: z.string().trim().email("Invalid email").max(255),
});

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ name, email });
    if (!parsed.success) {
      const fe: typeof errors = {};
      for (const issue of parsed.error.issues) {
        fe[issue.path[0] as "name" | "email"] = issue.message;
      }
      setErrors(fe);
      return;
    }
    setErrors({});
    try {
      localStorage.setItem("nexus_user", JSON.stringify({ ...parsed.data, guest: false }));
    } catch {}
    toast.success(`Welcome to NEXUS, ${parsed.data.name}`);
    navigate({ to: "/" });
  };

  const continueAsGuest = () => {
    try {
      localStorage.setItem("nexus_user", JSON.stringify({ guest: true }));
    } catch {}
    toast("Continuing as guest");
    navigate({ to: "/" });
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass neon-border text-xs uppercase tracking-[0.3em] text-cyan animate-glow-pulse">
            <Sparkles className="size-3" /> Join Nexus
          </div>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl font-bold leading-tight">
            Enter the <span className="text-gradient">Cinematic Universe</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Create your account to build your personal watchlist, rate movies & get smart recommendations — or continue as a guest.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass neon-border rounded-2xl p-6 space-y-5">
          <div>
            <label htmlFor="name" className="block text-xs uppercase tracking-[0.25em] text-cyan mb-2">
              Name
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              placeholder="Your name"
              className="w-full glass rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan/50 transition"
            />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-xs uppercase tracking-[0.25em] text-cyan mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
              placeholder="you@nexus.io"
              className="w-full glass rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan/50 transition"
            />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold animate-glow-pulse"
            style={{ background: "var(--gradient-neon)", color: "var(--background)", boxShadow: "var(--shadow-glow-cyan)" }}
          >
            <UserPlus className="size-4" /> Create Account
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/50" /></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em]">
              <span className="px-3 bg-background/60 text-muted-foreground">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={continueAsGuest}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg glass neon-border text-sm font-medium hover:text-cyan transition"
          >
            Continue as Guest <ArrowRight className="size-4" />
          </button>
        </form>

        <p className="text-center mt-6 text-xs text-muted-foreground">
          Already exploring? <Link to="/" className="text-cyan hover:underline">Back to home</Link>
        </p>
      </div>
    </div>
  );
}
