import { createFileRoute } from "@tanstack/react-router";
import { Moon, Sun, Bell, Volume2, Sparkles, Key, Check, Loader2, Trash2 } from "lucide-react";
import { useTheme } from "@/lib/theme-store";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { tmdbVerifyKey, omdbVerifyKey } from "@/lib/tmdb.functions";
import { getTmdbKey, setTmdbKey, clearTmdbKey } from "@/lib/tmdb-key";
import { getOmdbKey, setOmdbKey, clearOmdbKey } from "@/lib/omdb-key";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — NEXUS" },
      { name: "description", content: "Configure your NEXUS experience." },
      { property: "og:title", content: "Settings — NEXUS" },
      { property: "og:description", content: "Configure your NEXUS experience." },
    ],
  }),
  component: Settings,
});

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative w-12 h-6 rounded-full transition ${on ? "" : "bg-muted/40"}`}
      style={on ? { background: "var(--gradient-neon)", boxShadow: "var(--shadow-glow-cyan)" } : undefined}
    >
      <span className={`absolute top-0.5 size-5 rounded-full bg-background transition-all ${on ? "left-[26px]" : "left-0.5"}`} />
    </button>
  );
}

function Row({ icon, title, desc, children }: { icon: React.ReactNode; title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 p-5 glass neon-border rounded-2xl">
      <div className="size-10 rounded-full glass flex items-center justify-center text-cyan">{icon}</div>
      <div className="flex-1">
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
      {children}
    </div>
  );
}

function TmdbKeySection() {
  const verifyFn = useServerFn(tmdbVerifyKey);
  const [value, setValue] = useState("");
  const [hasSaved, setHasSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const existing = getTmdbKey();
    if (existing) {
      setValue(existing);
      setHasSaved(true);
    }
  }, []);

  const save = async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      toast.error("Enter your TMDB API key first");
      return;
    }
    setSaving(true);
    try {
      const result = await verifyFn({ data: { apiKey: trimmed } });
      if (!result.ok) {
        toast.error("Invalid TMDB key — couldn't authenticate with TMDB");
        return;
      }
      setTmdbKey(trimmed);
      setHasSaved(true);
      toast.success("TMDB key saved — real movie data will load now");
    } catch {
      toast.error("Couldn't verify the TMDB key");
    } finally {
      setSaving(false);
    }
  };

  const remove = () => {
    clearTmdbKey();
    setValue("");
    setHasSaved(false);
    toast.success("TMDB key removed — using fallback data");
  };

  return (
    <div className="p-5 glass neon-border rounded-2xl space-y-4">
      <div className="flex items-center gap-4">
        <div className="size-10 rounded-full glass flex items-center justify-center text-cyan">
          <Key className="size-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold flex items-center gap-2">
            TMDB API Key
            {hasSaved && <span className="text-xs text-cyan inline-flex items-center gap-1"><Check className="size-3" /> Saved</span>}
          </p>
          <p className="text-sm text-muted-foreground">
            Add your free key from{" "}
            <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan">
              themoviedb.org
            </a>{" "}
            to load real movie data.
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Paste your TMDB API key (v3 auth)"
          className="flex-1 px-4 py-2 rounded-lg glass neon-border bg-transparent text-sm focus:outline-none focus:text-cyan"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          onClick={save}
          disabled={saving}
          className="px-4 py-2 rounded-lg glass neon-border text-sm hover:text-cyan transition inline-flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
          {saving ? "Verifying" : "Save"}
        </button>
        {hasSaved && (
          <button
            onClick={remove}
            className="px-4 py-2 rounded-lg glass neon-border text-sm hover:text-destructive transition inline-flex items-center justify-center gap-2"
            title="Remove saved key"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Stored only in your browser (localStorage). Never sent anywhere except TMDB.
      </p>
      <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-200/90">
        <p className="font-semibold text-amber-300">⚠ Heads up for users in India</p>
        <p className="mt-1">
          TMDB API endpoints are often blocked on Indian Wi-Fi / broadband ISPs (Jio, Airtel, ACT, etc.).
          If movies fail to load, switch to mobile data or enable a VPN — the API will start responding immediately.
        </p>
      </div>
    </div>
  );
}

function OmdbKeySection() {
  const verifyFn = useServerFn(omdbVerifyKey);
  const [value, setValue] = useState("");
  const [hasSaved, setHasSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const existing = getOmdbKey();
    if (existing) {
      setValue(existing);
      setHasSaved(true);
    }
  }, []);

  const save = async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      toast.error("Enter your OMDB API key first");
      return;
    }
    if (/^https?:\/\//i.test(trimmed) || trimmed.includes("?") || trimmed.includes("=")) {
      toast.error("Paste only the key (no URL, no ?apikey=)");
      return;
    }
    setSaving(true);
    try {
      const result = await verifyFn({ data: { apiKey: trimmed } });
      if (!result.ok) {
        toast.error(`Invalid OMDB key — ${result.error || "rejected by OMDB"}`);
        return;
      }
      setOmdbKey(trimmed);
      setHasSaved(true);
      toast.success("OMDB key saved — posters will load from OMDB");
    } catch {
      toast.error("Couldn't verify the OMDB key");
    } finally {
      setSaving(false);
    }
  };

  const remove = () => {
    clearOmdbKey();
    setValue("");
    setHasSaved(false);
    toast.success("OMDB key removed");
  };

  return (
    <div className="p-5 glass neon-border rounded-2xl space-y-4">
      <div className="flex items-center gap-4">
        <div className="size-10 rounded-full glass flex items-center justify-center text-cyan">
          <Key className="size-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold flex items-center gap-2">
            OMDB API Key
            {hasSaved && <span className="text-xs text-cyan inline-flex items-center gap-1"><Check className="size-3" /> Saved</span>}
          </p>
          <p className="text-sm text-muted-foreground">
            Optional poster fallback. Get a free key from{" "}
            <a href="https://www.omdbapi.com/apikey.aspx" target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan">
              omdbapi.com
            </a>{" "}
            (8-character hex key only — no URL).
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Paste your OMDB API key (e.g. abc12345)"
          className="flex-1 px-4 py-2 rounded-lg glass neon-border bg-transparent text-sm focus:outline-none focus:text-cyan"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          onClick={save}
          disabled={saving}
          className="px-4 py-2 rounded-lg glass neon-border text-sm hover:text-cyan transition inline-flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
          {saving ? "Verifying" : "Save"}
        </button>
        {hasSaved && (
          <button
            onClick={remove}
            className="px-4 py-2 rounded-lg glass neon-border text-sm hover:text-destructive transition inline-flex items-center justify-center gap-2"
            title="Remove saved key"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Stored only in your browser (localStorage). Sent only to OMDB for poster lookups.
      </p>
    </div>
  );
}

function Settings() {
  const { theme, toggle } = useTheme();
  const [notif, setNotif] = useState(true);
  const [sound, setSound] = useState(false);
  const [ai, setAi] = useState(true);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <p className="text-cyan text-xs uppercase tracking-[0.3em]">Configuration</p>
      <h1 className="font-display text-4xl sm:text-5xl font-bold mt-2">Settings</h1>
      <p className="text-muted-foreground mt-2">Customize your NEXUS environment.</p>

      <div className="mt-10 space-y-4">
        <TmdbKeySection />
        <OmdbKeySection />

        <Row
          icon={theme === "dark" ? <Moon className="size-5" /> : <Sun className="size-5" />}
          title="Theme"
          desc={`Currently using ${theme === "dark" ? "Deep Cyber" : "Cinematic Light"} mode.`}
        >
          <button onClick={toggle} className="px-4 py-2 rounded-lg glass neon-border text-sm hover:text-cyan transition">
            Switch
          </button>
        </Row>

        <Row icon={<Bell className="size-5" />} title="Notifications" desc="Receive transmissions about new releases.">
          <Toggle on={notif} onChange={(v) => { setNotif(v); toast.success(v ? "Notifications enabled" : "Notifications muted"); }} />
        </Row>

        <Row icon={<Volume2 className="size-5" />} title="UI Sounds" desc="Subtle cyber feedback on interactions.">
          <Toggle on={sound} onChange={setSound} />
        </Row>

        <Row icon={<Sparkles className="size-5" />} title="NEXUS AI Assistant" desc="Show the floating AI orb across the app.">
          <Toggle on={ai} onChange={setAi} />
        </Row>
      </div>
    </div>
  );
}
