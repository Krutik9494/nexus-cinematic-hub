import { createFileRoute } from "@tanstack/react-router";
import { Moon, Sun, Bell, Volume2, Sparkles } from "lucide-react";
import { useTheme } from "@/lib/theme-store";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — NEXUS" },
      { name: "description", content: "Configure your NEXUS experience." },
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
