import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, X, Bot } from "lucide-react";
import { MOVIES, type Movie } from "@/lib/movies";
import { MovieModal } from "./MovieModal";

type Msg = { role: "user" | "ai"; text: string; movies?: Movie[] };

const SUGGESTIONS = [
  "What should I watch tonight?",
  "Sci-fi like Interstellar",
  "Mind-bending thrillers",
  "Best movies of 2024",
];

function pickMovies(query: string): Movie[] {
  const q = query.toLowerCase();
  const scored = MOVIES.map((m) => {
    let score = Math.random();
    if (m.genres.some((g) => q.includes(g.toLowerCase()))) score += 5;
    if (q.includes(m.title.toLowerCase().split(":")[0])) score += 8;
    if (q.includes("2024") && m.year === 2024) score += 4;
    if (q.includes("sci")) score += m.genres.includes("Sci-Fi") ? 3 : 0;
    if (q.includes("thriller")) score += m.genres.includes("Thriller") ? 3 : 0;
    return { m, score };
  }).sort((a, b) => b.score - a.score);
  return scored.slice(0, 4).map((x) => x.m);
}

export function NexusAI() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    { role: "ai", text: "I'm NEXUS AI. Tell me what you're in the mood for, and I'll curate the perfect transmissions." },
  ]);
  const [selected, setSelected] = useState<Movie | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Msg = { role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTimeout(() => {
      const movies = pickMovies(text);
      setMessages((m) => [...m, {
        role: "ai",
        text: `Based on your signal, I found ${movies.length} cinematic matches:`,
        movies,
      }]);
    }, 600);
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open NEXUS AI"
          className="fixed bottom-6 right-6 z-40 size-16 rounded-full flex items-center justify-center animate-glow-pulse hover:scale-110 transition"
          style={{ background: "var(--gradient-neon)", boxShadow: "var(--shadow-glow-cyan), var(--shadow-glow-purple)" }}
        >
          <Sparkles className="size-7 text-background" />
        </button>
      )}

      <div
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] glass border-l transition-transform duration-300 flex flex-col ${open ? "translate-x-0" : "translate-x-full"}`}
        style={{ background: "linear-gradient(180deg, oklch(0.1 0.02 275 / 0.95), oklch(0.06 0.015 270 / 0.95))" }}
      >
        <div className="p-4 border-b flex items-center gap-3">
          <div className="size-10 rounded-full flex items-center justify-center animate-glow-pulse" style={{ background: "var(--gradient-neon)" }}>
            <Bot className="size-5 text-background" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold tracking-wider">NEXUS AI</h3>
            <p className="text-[10px] uppercase tracking-[0.2em] text-cyan">● Online</p>
          </div>
          <button onClick={() => setOpen(false)} aria-label="Close" className="size-9 rounded-full glass flex items-center justify-center hover:glow-cyan transition">
            <X className="size-4" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] space-y-3 ${m.role === "user" ? "" : "w-full"}`}>
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm ${m.role === "user" ? "rounded-br-sm" : "glass neon-border rounded-bl-sm"}`}
                  style={m.role === "user" ? { background: "var(--gradient-neon)", color: "var(--background)" } : undefined}
                >
                  {m.text}
                </div>
                {m.movies && (
                  <div className="grid grid-cols-2 gap-2">
                    {m.movies.map((mv) => (
                      <button key={mv.id} onClick={() => setSelected(mv)} className="text-left rounded-lg overflow-hidden glass neon-border hover:glow-cyan transition">
                        <div className="aspect-[2/3]"><img src={mv.poster} alt={mv.title} className="size-full object-cover" /></div>
                        <div className="p-2">
                          <p className="text-xs font-semibold truncate">{mv.title}</p>
                          <p className="text-[10px] text-muted-foreground">{mv.year} · ★ {mv.rating.toFixed(1)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => send(s)} className="text-[10px] px-2.5 py-1 rounded-full glass neon-border text-cyan hover:glow-cyan transition">
                {s}
              </button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="glass neon-border rounded-full flex items-center px-4 py-2">
            <input
              value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Ask NEXUS anything…"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
            <button type="submit" aria-label="Send" className="size-8 rounded-full flex items-center justify-center" style={{ background: "var(--gradient-neon)" }}>
              <Send className="size-3.5 text-background" />
            </button>
          </form>
        </div>
      </div>

      <MovieModal movie={selected} onClose={() => setSelected(null)} />
    </>
  );
}
