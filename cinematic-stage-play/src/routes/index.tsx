import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, TrendingUp, Flame, Music, Award } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { HeroCinematic } from "@/components/HeroCinematic";
import { type Movie } from "@/lib/movies";
import { MovieCard, MovieCardSkeleton } from "@/components/MovieCard";
import { MovieModal } from "@/components/MovieModal";
import { Carousel } from "@/components/Carousel";
import { ParticleField } from "@/components/ParticleField";
import {
  tmdbBollywood,
  tmdbDiscover,
  tmdbSearch,
  tmdbTopRated,
  tmdbTrending,
} from "@/lib/tmdb.functions";
import { useTmdbKey } from "@/lib/tmdb-key";

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

type Mood = {
  id: string;
  label: string;
  emoji: string;
  tagline: string;
  genres: string[];
  sortBy: string;
  minRating?: number;
};

const MOODS: Mood[] = [
  { id: "happy", label: "Happy", emoji: "😄", tagline: "Feel-good laughs and warm endings.", genres: ["Comedy", "Family"], sortBy: "popularity.desc", minRating: 6.5 },
  { id: "sad", label: "Reflective", emoji: "🥲", tagline: "Slow burns that hit deep.", genres: ["Drama"], sortBy: "vote_average.desc", minRating: 7.5 },
  { id: "thrill", label: "Thrilled", emoji: "😱", tagline: "Edge-of-your-seat tension.", genres: ["Thriller", "Mystery"], sortBy: "popularity.desc", minRating: 6.5 },
  { id: "adventurous", label: "Adventurous", emoji: "🗺️", tagline: "Big worlds, bigger journeys.", genres: ["Adventure", "Action"], sortBy: "popularity.desc", minRating: 6.5 },
  { id: "romantic", label: "Romantic", emoji: "💖", tagline: "Love, longing, and slow dances.", genres: ["Romance"], sortBy: "popularity.desc", minRating: 6.5 },
  { id: "mindbender", label: "Mind-bent", emoji: "🧠", tagline: "Reality-warping sci-fi.", genres: ["Science Fiction"], sortBy: "vote_average.desc", minRating: 7.5 },
  { id: "spooky", label: "Spooky", emoji: "👻", tagline: "Lights off. Volume up.", genres: ["Horror"], sortBy: "popularity.desc", minRating: 6 },
  { id: "inspired", label: "Inspired", emoji: "🌟", tagline: "True stories that move you.", genres: ["History", "Drama"], sortBy: "vote_average.desc", minRating: 7.5 },
  { id: "nostalgic", label: "Nostalgic", emoji: "📼", tagline: "Animated classics for all ages.", genres: ["Animation", "Family"], sortBy: "vote_average.desc", minRating: 7.5 },
];

function Home() {
  const [mood, setMood] = useState<Mood>(MOODS[0]);
  const [selected, setSelected] = useState<Movie | null>(null);

  const apiKey = useTmdbKey();
  const trendingFn = useServerFn(tmdbTrending);
  const bollywoodFn = useServerFn(tmdbBollywood);
  const discoverFn = useServerFn(tmdbDiscover);
  const topRatedFn = useServerFn(tmdbTopRated);

  const topRated = useQuery({
    queryKey: ["topRated", !!apiKey],
    queryFn: () => topRatedFn({ data: { apiKey } }),
    staleTime: 10 * 60_000,
  });

  const trending = useQuery({
    queryKey: ["trending", !!apiKey],
    queryFn: () => trendingFn({ data: { apiKey } }),
    staleTime: 5 * 60_000,
  });
  const bollywood = useQuery({
    queryKey: ["bollywood", !!apiKey],
    queryFn: () => bollywoodFn({ data: { apiKey } }),
    staleTime: 5 * 60_000,
  });
  const popular = useQuery({
    queryKey: ["mood", mood.id, !!apiKey],
    queryFn: () =>
      discoverFn({
        data: {
          sortBy: mood.sortBy,
          genres: mood.genres,
          minRating: mood.minRating,
          apiKey,
        },
      }).then((r) => r.results),
    staleTime: 60_000,
  });

  return (
    <div>
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden">
        <HeroCinematic />
        <img src={heroBg} alt="" className="hidden" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 30%, rgba(5,5,7,0.7) 80%, rgba(5,5,7,0.95) 100%)",
          }}
        />
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute inset-0"><ParticleField /></div>

        <div className="relative max-w-4xl mx-auto px-4 text-center py-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass neon-border text-xs uppercase tracking-[0.3em] text-cyan animate-glow-pulse">
            <Sparkles className="size-3" /> Mood Match
          </div>
          <h1 className="mt-6 font-display text-5xl sm:text-7xl lg:text-8xl font-bold leading-[1.05]">
            How are you <span className="text-gradient">feeling?</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Pick a mood — we'll tune the screen to match.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-2 sm:gap-3 max-w-3xl mx-auto">
            {MOODS.map((m) => {
              const active = m.id === mood.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMood(m)}
                  className={`group px-4 sm:px-5 py-2.5 rounded-full glass neon-border transition flex items-center gap-2 text-sm ${
                    active
                      ? "text-cyan glow-cyan scale-[1.03]"
                      : "text-muted-foreground hover:text-foreground hover:scale-[1.02]"
                  }`}
                >
                  <span className="text-base">{m.emoji}</span>
                  <span className="font-medium">{m.label}</span>
                </button>
              );
            })}
          </div>

          <p className="mt-6 text-sm text-cyan/90 italic min-h-[1.25rem]">
            {mood.tagline}
          </p>
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

      {/* Best Movies of All Time */}
      <Section icon={<Award className="size-4" />} eyebrow="Highest Rated" title="Best Movies of All Time" color="text-cyan">
        {topRated.isLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-44 sm:w-52 shrink-0"><MovieCardSkeleton /></div>
            ))}
          </div>
        ) : topRated.data?.length ? (
          <Carousel movies={topRated.data} onSelect={setSelected} />
        ) : (
          <p className="text-muted-foreground text-sm">No top-rated movies available.</p>
        )}
      </Section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-neon-purple text-xs uppercase tracking-[0.3em]">
              <Flame className="size-4" /> Popular
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2">
              {mood.emoji} Picked for your {mood.label.toLowerCase()} mood
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
