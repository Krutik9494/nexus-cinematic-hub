import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Sparkles, TrendingUp, Flame } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { GENRES, MOVIES, POPULAR, TRENDING, type Movie } from "@/lib/movies";
import { MovieCard } from "@/components/MovieCard";
import { MovieModal } from "@/components/MovieModal";
import { Carousel } from "@/components/Carousel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NEXUS — Your Personal Cinematic Universe" },
      { name: "description", content: "A futuristic movie watchlist. Discover trending films, rate them, and curate your cinematic universe." },
      { property: "og:title", content: "NEXUS — Your Personal Cinematic Universe" },
      { property: "og:description", content: "Discover, track, and rate your favorite movies." },
    ],
  }),
  component: Home,
});

function Home() {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("All");
  const [selected, setSelected] = useState<Movie | null>(null);

  const filtered = useMemo(() => {
    return POPULAR.filter((m) => {
      const matchG = genre === "All" || m.genres.includes(genre);
      const matchQ = !query || m.title.toLowerCase().includes(query.toLowerCase()) || m.genres.join(" ").toLowerCase().includes(query.toLowerCase());
      return matchG && matchQ;
    });
  }, [query, genre]);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden">
        <img src={heroBg} alt="" width={1920} height={1024} className="absolute inset-0 size-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        <div className="absolute inset-0 grid-bg opacity-40" />

        <div className="relative max-w-4xl mx-auto px-4 text-center py-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass neon-border text-xs uppercase tracking-[0.3em] text-cyan animate-glow-pulse">
            <Sparkles className="size-3" /> Welcome to Nexus
          </div>
          <h1 className="mt-6 font-display text-5xl sm:text-7xl lg:text-8xl font-bold leading-[1.05]">
            Your Personal <br />
            <span className="text-gradient">Cinematic Universe</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover, rate, and curate the films that move you — all in one luminous, futuristic dashboard.
          </p>

          <div className="mt-10 max-w-2xl mx-auto relative">
            <div className="absolute inset-0 rounded-full opacity-60 blur-2xl" style={{ background: "var(--gradient-neon)" }} />
            <div className="relative glass neon-border rounded-full flex items-center px-5 py-3">
              <Search className="size-5 text-cyan" />
              <input
                value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies, actors, directors, genres…"
                className="flex-1 bg-transparent outline-none px-4 text-base placeholder:text-muted-foreground"
              />
              <button className="hidden sm:block px-5 py-2 rounded-full text-sm font-semibold" style={{ background: "var(--gradient-neon)", color: "var(--background)" }}>
                Search
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {GENRES.map((g) => (
              <button key={g} onClick={() => setGenre(g)}
                className={`px-4 py-1.5 text-xs rounded-full glass neon-border transition ${genre === g ? "text-cyan glow-cyan" : "text-muted-foreground hover:text-foreground"}`}>
                {g}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-cyan text-xs uppercase tracking-[0.3em]"><TrendingUp className="size-4" /> Trending</div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2">This Week</h2>
          </div>
        </div>
        <Carousel movies={TRENDING} onSelect={setSelected} />
      </section>

      {/* Popular grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-neon-purple text-xs uppercase tracking-[0.3em]"><Flame className="size-4" /> Popular</div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2">{query || genre !== "All" ? "Results" : "Popular Movies"}</h2>
          </div>
          <p className="text-sm text-muted-foreground">{filtered.length} titles</p>
        </div>
        {filtered.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center">
            <p className="text-muted-foreground">No transmissions found in this frequency.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {filtered.map((m) => <MovieCard key={m.id} movie={m} onClick={() => setSelected(m)} />)}
          </div>
        )}
      </section>

      {/* AI Recs placeholder */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="glass neon-border rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-neon-purple uppercase tracking-widest"><Sparkles className="size-3" /> Coming Soon</div>
            <h3 className="mt-4 font-display text-3xl sm:text-4xl font-bold text-gradient">AI Recommendations</h3>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Our neural engine will soon learn your taste and surface films tailored to your unique cinematic DNA.</p>
          </div>
        </div>
      </section>

      <MovieModal movie={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
