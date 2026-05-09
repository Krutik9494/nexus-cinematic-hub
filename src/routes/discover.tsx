import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { GENRES, MOVIES, type Movie } from "@/lib/movies";
import { MovieCard } from "@/components/MovieCard";
import { MovieModal } from "@/components/MovieModal";
import { ParticleField } from "@/components/ParticleField";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover — NEXUS" },
      { name: "description", content: "Advanced filtering for the full cinematic catalog." },
    ],
  }),
  component: Discover,
});

const PAGE = 8;
type Sort = "popularity" | "rating" | "newest";

function Discover() {
  const [query, setQuery] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [yearMin, setYearMin] = useState(1980);
  const [yearMax, setYearMax] = useState(2026);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<Sort>("popularity");
  const [limit, setLimit] = useState(PAGE);
  const [selected, setSelected] = useState<Movie | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const toggleGenre = (g: string) =>
    setGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);

  const filtered = useMemo(() => {
    const list = MOVIES.filter((m) => {
      if (query && !m.title.toLowerCase().includes(query.toLowerCase())) return false;
      if (genres.length && !genres.some((g) => m.genres.includes(g))) return false;
      if (m.year < yearMin || m.year > yearMax) return false;
      if (m.rating < minRating) return false;
      return true;
    });
    list.sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "newest") return b.year - a.year;
      return b.popularity - a.popularity;
    });
    return list;
  }, [query, genres, yearMin, yearMax, minRating, sort]);

  const visible = filtered.slice(0, limit);

  const FilterPanel = (
    <div className="glass neon-border rounded-2xl p-5 space-y-6 sticky top-20">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-cyan mb-3">Genres</p>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((g) => (
            <button key={g} onClick={() => toggleGenre(g)}
              className={`px-3 py-1 text-xs rounded-full glass border transition ${genres.includes(g) ? "text-cyan glow-cyan border-cyan/60" : "text-muted-foreground border-transparent hover:text-foreground"}`}>
              {g}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-cyan mb-3">Year Range</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>{yearMin}</span><span>{yearMax}</span>
        </div>
        <input type="range" min={1980} max={2026} value={yearMin} onChange={(e) => setYearMin(Math.min(+e.target.value, yearMax))} className="w-full accent-cyan" />
        <input type="range" min={1980} max={2026} value={yearMax} onChange={(e) => setYearMax(Math.max(+e.target.value, yearMin))} className="w-full accent-cyan mt-1" />
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-cyan mb-3">Min Rating: <span className="text-foreground">{minRating.toFixed(1)}</span></p>
        <input type="range" min={0} max={10} step={0.5} value={minRating} onChange={(e) => setMinRating(+e.target.value)} className="w-full accent-cyan" />
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-cyan mb-3">Sort By</p>
        <div className="grid grid-cols-3 gap-2">
          {(["popularity", "rating", "newest"] as Sort[]).map((s) => (
            <button key={s} onClick={() => setSort(s)}
              className={`px-2 py-2 text-xs rounded-lg glass capitalize transition ${sort === s ? "text-cyan glow-cyan" : "text-muted-foreground hover:text-foreground"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => { setGenres([]); setYearMin(1980); setYearMax(2026); setMinRating(0); setQuery(""); setSort("popularity"); }}
        className="w-full text-xs py-2 rounded-lg glass hover:text-cyan transition"
      >
        Reset Filters
      </button>
    </div>
  );

  return (
    <div className="relative">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="absolute inset-0 h-[600px] overflow-hidden pointer-events-none"><ParticleField /></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <p className="text-cyan text-xs uppercase tracking-[0.3em]">Catalog</p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mt-2">Discover</h1>
        <p className="text-muted-foreground mt-2 max-w-xl">Tune the filters and find your next obsession in the cinematic archive.</p>

        <div className="mt-8 flex gap-3 items-center">
          <div className="flex-1 glass neon-border rounded-full flex items-center px-5 py-3">
            <Search className="size-5 text-cyan" />
            <input
              value={query} onChange={(e) => { setQuery(e.target.value); setLimit(PAGE); }}
              placeholder="Search the archive…"
              className="flex-1 bg-transparent outline-none px-4 text-base placeholder:text-muted-foreground"
            />
          </div>
          <button onClick={() => setFilterOpen(true)} className="lg:hidden size-12 rounded-full glass neon-border flex items-center justify-center">
            <SlidersHorizontal className="size-5 text-cyan" />
          </button>
        </div>

        <div className="mt-8 grid lg:grid-cols-[280px_1fr] gap-8">
          <aside className="hidden lg:block">{FilterPanel}</aside>

          <main>
            <p className="text-sm text-muted-foreground mb-4">{filtered.length} {filtered.length === 1 ? "result" : "results"}</p>
            {visible.length === 0 ? (
              <div className="glass neon-border rounded-2xl p-16 text-center relative overflow-hidden">
                <div className="absolute inset-0 grid-bg opacity-30" />
                <div className="relative">
                  <div className="size-20 mx-auto rounded-full glass flex items-center justify-center mb-4 animate-float">
                    <Search className="size-8 text-cyan" />
                  </div>
                  <p className="font-display text-xl font-bold">No transmissions detected</p>
                  <p className="text-muted-foreground text-sm mt-2">Try widening your filters.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {visible.map((m) => <MovieCard key={m.id} movie={m} onClick={() => setSelected(m)} />)}
                </div>
                {limit < filtered.length && (
                  <div className="text-center mt-10">
                    <button onClick={() => setLimit((l) => l + PAGE)} className="px-8 py-3 rounded-full font-semibold animate-glow-pulse" style={{ background: "var(--gradient-neon)", color: "var(--background)", boxShadow: "var(--shadow-glow-cyan)" }}>
                      Load More
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>

        {filterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setFilterOpen(false)} />
            <div className="absolute inset-y-0 right-0 w-[320px] max-w-[90vw] p-4 overflow-y-auto">
              <button onClick={() => setFilterOpen(false)} className="mb-3 size-9 rounded-full glass flex items-center justify-center"><X className="size-4" /></button>
              {FilterPanel}
            </div>
          </div>
        )}

        <MovieModal movie={selected} onClose={() => setSelected(null)} />
      </div>
    </div>
  );
}
