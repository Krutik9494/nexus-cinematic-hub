import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, X, Bot } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import type { Movie } from "@/lib/movies";
import { tmdbSearch } from "@/lib/tmdb.functions";
import { aiChat } from "@/lib/ai.functions";
import { MovieModal } from "./MovieModal";

type Msg = { role: "user" | "ai"; text: string; movies?: Movie[] };

const SUGGESTIONS = [
  "Recommend a sci-fi film",
  "Explain the ending of Inception",
  "Top Bollywood thrillers",
  "Why is the sky blue?",
];

const MOVIE_INTENT = /\b(movie|film|watch|recommend|suggest|trailer|cast|director|imdb|bollywood|hollywood|sci[- ]?fi|thriller|comedy|drama|horror|romance|action|anime|series|show)\b/i;

export function NexusAI() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    { role: "ai", text: "I'm NEXUS AI. Tell me what you're in the mood for, and I'll curate the perfect transmissions." },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedInitial, setSelectedInitial] = useState<Movie | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const searchFn = useServerFn(tmdbSearch);
  const search = useMutation({
    mutationFn: (query: string) => searchFn({ data: { query } }),
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    try {
      const res = await search.mutateAsync(text);
      const movies = res.results.slice(0, 4);
      setMessages((m) => [
        ...m,
        movies.length
          ? { role: "ai", text: `I found ${movies.length} cinematic matches for you:`, movies }
          : { role: "ai", text: "No matches in the archive. Try another signal." },
      ]);
    } catch {
      setMessages((m) => [...m, { role: "ai", text: "The signal failed. Try again." }]);
    }
  };

  const openMovie = (m: Movie) => {
    setSelectedInitial(m);
    setSelectedId(m.id);
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
                      <button key={mv.id} onClick={() => openMovie(mv)} className="text-left rounded-lg overflow-hidden glass neon-border hover:glow-cyan transition">
                        <div className="aspect-[2/3]"><img src={mv.poster} alt={mv.title} className="size-full object-cover" /></div>
                        <div className="p-2">
                          <p className="text-xs font-semibold truncate">{mv.title}</p>
                          <p className="text-[10px] text-muted-foreground">{mv.year || "—"} · ★ {mv.rating.toFixed(1)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {search.isPending && (
            <div className="flex items-center gap-2 text-cyan text-xs animate-glow-pulse">
              <span className="size-2 rounded-full bg-cyan" /> Scanning the archive…
            </div>
          )}
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

      <MovieModal
        movieId={selectedId}
        initial={selectedInitial}
        onClose={() => setSelectedId(null)}
        onSwitch={(m) => { setSelectedInitial(m); setSelectedId(m.id); }}
      />
    </>
  );
}
