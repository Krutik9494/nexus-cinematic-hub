import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { GENRES, type Movie } from "@/lib/movies";
import { MovieCard, MovieCardSkeleton } from "@/components/MovieCard";
import { MovieModal } from "@/components/MovieModal";
import { ParticleField } from "@/components/ParticleField";
import { tmdbDiscover, tmdbSearch } from "@/lib/tmdb.functions";
import { useTmdbKey } from "@/lib/tmdb-key";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover — NEXUS" },
      { name: "description", content: "Advanced movie filtering across Hollywood, Bollywood and beyond." },
      { property: "og:title", content: "Discover — NEXUS" },
      { property: "og:description", content: "Advanced movie filtering across Hollywood, Bollywood and beyond." },
    ],
  }),
  component: Discover,
});

type Sort = "popularity.desc" | "vote_average.desc" | "primary_release_date.desc";
type Lang = "all" | "en" | "hi";

function useDebounced<T>(value: T, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

function Discover() {
  const [query, setQuery] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const yearMin = 2000;
  const [yearMax, setYearMax] = useState(2026);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<Sort>("popularity.desc");
  const [language, setLanguage] = useState<Lang>("all");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState<Movie[][]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedInitial, setSelectedInitial] = useState<Movie | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const debouncedQuery = useDebounced(query.trim(), 400);

  const apiKey = useTmdbKey();
  const discoverFn = useServerFn(tmdbDiscover);
  const searchFn = useServerFn(tmdbSearch);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
    setPages([]);
  }, [debouncedQuery, genres, yearMin, yearMax, minRating, sort, language]);

  const queryKey = useMemo(
    () => ["discover", debouncedQuery, genres, yearMin, yearMax, minRating, sort, language, page, !!apiKey],
    [debouncedQuery, genres, yearMin, yearMax, minRating, sort, language, page, apiKey],
  );

  const result = useQuery({
    queryKey,
    queryFn: async () => {
      if (debouncedQuery) {
        return searchFn({ data: { query: debouncedQuery, page, apiKey } });
      }
      return discoverFn({
        data: {
          sortBy: sort,
          genres: genres.length ? genres : undefined,
          yearMin,
          yearMax,
          minRating,
          language: language === "all" ? undefined : language,
          region: language === "hi" ? "IN" : undefined,
          page,
          apiKey,
        },
      });
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    if (result.data) {
      setPages((prev) => {
        const next = [...prev];
        next[result.data.page - 1] = result.data.results;
        return next;
      });
    }
  }, [result.data]);

  const visible = pages.flat();
  const total = result.data?.totalResults ?? visible.length;
  const hasMore = result.data ? result.data.page < result.data.totalPages : false;

  const toggleGenre = (g: string) =>
    setGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));

  const FilterPanel = (
    <div className="glass neon-border rounded-2xl p-5 space-y-6 sticky top-20">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-cyan mb-3">Language</p>
        <div className="grid grid-cols-3 gap-2">
          {(["all", "en", "hi"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLanguage(l)}
              className={`px-2 py-2 text-xs rounded-lg glass uppercase tracking-wider transition ${language === l ? "text-cyan glow-cyan" : "text-muted-foreground hover:text-foreground"}`}
            >
              {l === "all" ? "All" : l === "en" ? "English" : "Hindi"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-cyan mb-3">Genres</p>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto scrollbar-hide pr-1">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => toggleGenre(g)}
              className={`px-3 py-1 text-xs rounded-full glass border transition ${genres.includes(g) ? "text-cyan glow-cyan border-cyan/60" : "text-muted-foreground border-transparent hover:text-foreground"}`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-cyan mb-3">Year Range</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>From {yearMin}</span><span>Up to {yearMax}</span>
        </div>
        <input type="range" min={2000} max={2026} value={yearMax} onChange={(e) => setYearMax(+e.target.value)} className="w-full accent-cyan" />
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-cyan mb-3">
          Min Rating: <span className="text-foreground">{minRating.toFixed(1)}</span>
        </p>
        <input type="range" min={0} max={10} step={0.5} value={minRating} onChange={(e) => setMinRating(+e.target.value)} className="w-full accent-cyan" />
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-cyan mb-3">Sort By</p>
        <div className="grid grid-cols-3 gap-2">
          {([
            ["popularity.desc", "Popular"],
            ["vote_average.desc", "Rating"],
            ["primary_release_date.desc", "Newest"],
          ] as [Sort, string][]).map(([s, label]) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-2 py-2 text-xs rounded-lg glass transition ${sort === s ? "text-cyan glow-cyan" : "text-muted-foreground hover:text-foreground"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => {
          setGenres([]); setYearMax(2026); setMinRating(0);
          setQuery(""); setSort("popularity.desc"); setLanguage("all");
        }}
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
              value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the archive…"
              className="flex-1 bg-transparent outline-none px-4 text-base placeholder:text-muted-foreground"
            />
            {result.isFetching && (
              <span className="text-[10px] text-cyan uppercase tracking-widest animate-glow-pulse">Loading</span>
            )}
          </div>
          <button onClick={() => setFilterOpen(true)} className="lg:hidden size-12 rounded-full glass neon-border flex items-center justify-center">
            <SlidersHorizontal className="size-5 text-cyan" />
          </button>
        </div>

        <div className="mt-8 grid lg:grid-cols-[280px_1fr] gap-8">
          <aside className="hidden lg:block">{FilterPanel}</aside>

          <main>
            <p className="text-sm text-muted-foreground mb-4">{total.toLocaleString()} {total === 1 ? "result" : "results"}</p>

            {result.isError && pages.length === 0 ? (
              <div className="glass neon-border rounded-2xl p-10 text-center">
                <p className="text-destructive font-semibold">Could not reach TMDB.</p>
                <p className="text-muted-foreground text-sm mt-2">Verify your TMDB_API_KEY and try again.</p>
              </div>
            ) : visible.length === 0 && !result.isLoading ? (
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
                  {visible.map((m) => (
                    <MovieCard
                      key={m.id}
                      movie={m}
                      onClick={() => { setSelectedInitial(m); setSelectedId(m.id); }}
                    />
                  ))}
                  {result.isLoading && Array.from({ length: 8 }).map((_, i) => <MovieCardSkeleton key={`s-${i}`} />)}
                </div>
                {hasMore && (
                  <div className="text-center mt-10">
                    <button
                      disabled={result.isFetching}
                      onClick={() => setPage((p) => p + 1)}
                      className="px-8 py-3 rounded-full font-semibold animate-glow-pulse disabled:opacity-60"
                      style={{ background: "var(--gradient-neon)", color: "var(--background)", boxShadow: "var(--shadow-glow-cyan)" }}
                    >
                      {result.isFetching ? "Loading…" : "Load More"}
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

        <MovieModal
          movieId={selectedId}
          initial={selectedInitial}
          onClose={() => setSelectedId(null)}
          onSwitch={(m) => { setSelectedInitial(m); setSelectedId(m.id); }}
        />
      </div>
    </div>
  );
}
