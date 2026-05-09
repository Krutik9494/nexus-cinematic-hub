import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useServerFn } from "@tanstack/react-start";
import { Search, Sparkles, TrendingUp, Flame, Music } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { ALL_GENRES, type Movie } from "@/lib/movies";
import { MovieCard, MovieCardSkeleton } from "@/components/MovieCard";
import { MovieModal } from "@/components/MovieModal";
import { Carousel } from "@/components/Carousel";
import { ParticleField } from "@/components/ParticleField";
import {
  tmdbBollywood,
  tmdbDiscover,
  tmdbSearch,
  tmdbTrending,
} from "@/lib/tmdb.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NEXUS — Your Personal Cinematic Universe" },
      {
        name: "description",
        content:
          "A futuristic movie watchlist powered by TMDB — Hollywood, Bollywood and beyond.",
      },
      { property: "og:title", content: "NEXUS — Your Personal Cinematic Universe" },
      {
        property: "og:description",
        content: "Discover, track, and rate your favorite movies.",
      },
    ],
  }),
  component: Home,
});

function useDebounced<T>(value: T, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

function Section({
  icon,
  eyebrow,
  title,
  color = "text-cyan",
  children,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6">
        <div className={`flex items-center gap-2 ${color} text-xs uppercase tracking-[0.3em]`}>
          {icon} {eyebrow}
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function GridSkeleton({ n = 10 }: { n?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
      {Array.from({ length: n }).map((_, i) => <MovieCardSkeleton key={i} />)}
    </div>
  );
}

function Home() {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("All");
  const [selected, setSelected] = useState<Movie | null>(null);
  const debouncedQuery = useDebounced(query.trim(), 400);

  const trendingFn = useServerFn(tmdbTrending);
  const bollywoodFn = useServerFn(tmdbBollywood);
  const discoverFn = useServerFn(tmdbDiscover);
  const searchFn = useServerFn(tmdbSearch);

  const trending = useQuery({
    queryKey: ["trending"],
    queryFn: () => trendingFn(),
    staleTime: 5 * 60_000,
  });
  const bollywood = useQuery({
    queryKey: ["bollywood"],
    queryFn: () => bollywoodFn(),
    staleTime: 5 * 60_000,
  });
  const popular = useQuery({
    queryKey: ["popular", genre, debouncedQuery],
    queryFn: () => {
      if (debouncedQuery) {
        return searchFn({ data: { query: debouncedQuery } }).then((r) => r.results);
      }
      return discoverFn({
        data: {
          sortBy: "popularity.desc",
          genres: genre === "All" ? undefined : [genre],
        },
      }).then((r) => r.results);
    },
    staleTime: 60_000,
  });

  return (
    <div>
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden">
        <img
          src={heroBg}
          alt=""
          width={1920}
          height={1024}
          className="absolute inset-0 size-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute inset-0"><ParticleField /></div>

        <div className="relative max-w-4xl mx-auto px-4 text-center py-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass neon-border text-xs uppercase tracking-[0.3em] text-cyan animate-glow-pulse">
            <Sparkles className="size-3" /> Welcome to Nexus
          </div>
          <h1 className="mt-6 font-display text-5xl sm:text-7xl lg:text-8xl font-bold leading-[1.05]">
            Your Personal <br />
            <span className="text-gradient">Cinematic Universe</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time movie data from TMDB — discover, rate, and curate films from Hollywood, Bollywood, and the world.
          </p>

          <div className="mt-10 max-w-2xl mx-auto relative">
            <div
              className="absolute inset-0 rounded-full opacity-60 blur-2xl"
              style={{ background: "var(--gradient-neon)" }}
            />
            <div className="relative glass neon-border rounded-full flex items-center px-5 py-3">
              <Search className="size-5 text-cyan" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search any movie, real-time…"
                className="flex-1 bg-transparent outline-none px-4 text-base placeholder:text-muted-foreground"
              />
              <span className="hidden sm:block text-xs text-muted-foreground px-3">
                {popular.isFetching ? "Searching…" : ""}
              </span>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {ALL_GENRES.slice(0, 9).map((g) => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className={`px-4 py-1.5 text-xs rounded-full glass neon-border transition ${
                  genre === g
                    ? "text-cyan glow-cyan"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Trending */}
      <Section icon={<TrendingUp className="size-4" />} eyebrow="Trending" title="This Week">
        {trending.isLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-44 sm:w-52 shrink-0"><MovieCardSkeleton /></div>
            ))}
          </div>
        ) : trending.data?.length ? (
          <Carousel movies={trending.data} onSelect={setSelected} />
        ) : (
          <p className="text-muted-foreground text-sm">No trending data right now.</p>
        )}
      </Section>

      {/* Popular / Search results */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-neon-purple text-xs uppercase tracking-[0.3em]">
              <Flame className="size-4" /> Popular
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2">
              {debouncedQuery ? `Results for "${debouncedQuery}"` : genre !== "All" ? genre : "Popular Movies"}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">{popular.data?.length ?? 0} titles</p>
        </div>
        {popular.isLoading ? (
          <GridSkeleton />
        ) : popular.isError ? (
          <ErrorBox message="Could not load movies." />
        ) : popular.data && popular.data.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {popular.data.map((m) => (
              <MovieCard key={m.id} movie={m} onClick={() => setSelected(m)} />
            ))}
          </div>
        ) : (
          <div className="glass rounded-2xl p-16 text-center">
            <p className="text-muted-foreground">No transmissions found in this frequency.</p>
          </div>
        )}
      </section>

      {/* Bollywood Hits */}
      <Section icon={<Music className="size-4" />} eyebrow="From India" title="Bollywood Hits" color="text-neon-purple">
        {bollywood.isLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-44 sm:w-52 shrink-0"><MovieCardSkeleton /></div>
            ))}
          </div>
        ) : bollywood.data?.length ? (
          <Carousel movies={bollywood.data} onSelect={setSelected} />
        ) : (
          <p className="text-muted-foreground text-sm">No Bollywood hits available.</p>
        )}
      </Section>

      <MovieModal movieId={selected?.id ?? null} initial={selected} onClose={() => setSelected(null)} onSwitch={(m) => setSelected(m)} />
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="glass neon-border rounded-2xl p-10 text-center">
      <p className="text-destructive font-semibold">{message}</p>
      <p className="text-muted-foreground text-sm mt-2">The signal is weak — try again in a moment.</p>
    </div>
  );
}
