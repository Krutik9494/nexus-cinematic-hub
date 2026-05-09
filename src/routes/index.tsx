import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, TrendingUp, Flame, Music, Award, X, Star, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import { watchlist, useWatchlist } from "@/lib/watchlist-store";
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
  tmdbPosterLookup,
  tmdbSearch,
  tmdbTopRated,
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

type MoodPick = {
  id: string;
  title: string;
  year: number;
  rating: number;
  description: string;
  poster: string;
};

type Mood = {
  id: string;
  label: string;
  emoji: string;
  tagline: string;
  genres: string[];
  sortBy: string;
  minRating?: number;
  picks: MoodPick[];
};

const MOODS: Mood[] = [
  { id: "happy", label: "Happy", emoji: "😊", tagline: "Feel-good laughs and warm endings.", genres: ["Comedy", "Family"], sortBy: "popularity.desc", minRating: 6.5, picks: [
    { id: "mock-happy-1", title: "Paddington 2", year: 2017, rating: 8.2, description: "A lovable bear's joyful adventure spreading kindness.", poster: "https://image.tmdb.org/t/p/w500/1OFxiUTwTNOFYj6KEvK4ZWdSg7Z.jpg" },
    { id: "mock-happy-2", title: "The Grand Budapest Hotel", year: 2014, rating: 8.1, description: "A whimsical caper through a pastel European fantasy.", poster: "https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg" },
    { id: "mock-happy-3", title: "Amélie", year: 2001, rating: 8.3, description: "A shy Parisian dreamer engineers tiny moments of joy.", poster: "https://image.tmdb.org/t/p/w500/f0uorE7K7ggHfr8r7pUyi3jpndE.jpg" },
  ]},
  { id: "sad", label: "Reflective", emoji: "🤔", tagline: "Slow burns that hit deep.", genres: ["Drama"], sortBy: "vote_average.desc", minRating: 7.5, picks: [
    { id: "mock-sad-1", title: "Manchester by the Sea", year: 2016, rating: 7.8, description: "Grief, family, and the weight of a New England winter.", poster: "https://image.tmdb.org/t/p/w500/o9VXhBb3tIRWnUcFr6MUI0aGzMt.jpg" },
    { id: "mock-sad-2", title: "Lost in Translation", year: 2003, rating: 7.7, description: "Two strangers find quiet connection in neon Tokyo.", poster: "https://image.tmdb.org/t/p/w500/3Pl0o7p1vEhxfwkoH4z0OeDzDOL.jpg" },
    { id: "mock-sad-3", title: "The Father", year: 2020, rating: 8.2, description: "An aching portrait of memory unraveling.", poster: "https://image.tmdb.org/t/p/w500/pr3bBE6FuiXANbozSjEC8zQjXOQ.jpg" },
  ]},
  { id: "thrill", label: "Thrilled", emoji: "😲", tagline: "Edge-of-your-seat tension.", genres: ["Thriller", "Mystery"], sortBy: "popularity.desc", minRating: 6.5, picks: [
    { id: "mock-thrill-1", title: "Se7en", year: 1995, rating: 8.6, description: "Two detectives chase a killer staging the seven sins.", poster: "https://image.tmdb.org/t/p/w500/6yoghtyTpznpBik8EngEmJskVUO.jpg" },
    { id: "mock-thrill-2", title: "Prisoners", year: 2013, rating: 8.1, description: "A father's frantic search becomes a moral abyss.", poster: "https://image.tmdb.org/t/p/w500/tuLOlDjudGFFQK5kg1yId0Ew6Wo.jpg" },
    { id: "mock-thrill-3", title: "Gone Girl", year: 2014, rating: 8.1, description: "A vanishing wife unspools a chilling marriage.", poster: "https://image.tmdb.org/t/p/w500/ts996lKsxvjkO2yiYG0ht4qAicO.jpg" },
  ]},
  { id: "adventurous", label: "Adventurous", emoji: "🗺️", tagline: "Big worlds, bigger journeys.", genres: ["Adventure", "Action"], sortBy: "popularity.desc", minRating: 6.5, picks: [
    { id: "mock-adv-1", title: "Raiders of the Lost Ark", year: 1981, rating: 8.4, description: "Whip-cracking globe-trotting pulp at its peak.", poster: "https://image.tmdb.org/t/p/w500/ceG9VzoRAVGwivFU403Wc3AHRys.jpg" },
    { id: "mock-adv-2", title: "Mad Max: Fury Road", year: 2015, rating: 8.1, description: "A roaring desert chase painted in chrome and fire.", poster: "https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg" },
    { id: "mock-adv-3", title: "The Fellowship of the Ring", year: 2001, rating: 8.8, description: "An epic walk into shadow with friends to remember.", poster: "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg" },
  ]},
  { id: "romantic", label: "Romantic", emoji: "❤️", tagline: "Love, longing, and slow dances.", genres: ["Romance"], sortBy: "popularity.desc", minRating: 6.5, picks: [
    { id: "mock-rom-1", title: "Dilwale Dulhania Le Jayenge", year: 1995, rating: 8.6, description: "A Bollywood classic where love crosses every border.", poster: "https://image.tmdb.org/t/p/w500/2CAL2433ZeIihfX1Hb2139CX0pW.jpg" },
    { id: "mock-rom-2", title: "Pride & Prejudice", year: 2005, rating: 7.8, description: "Misunderstandings, mist-soaked moors, and yearning.", poster: "https://image.tmdb.org/t/p/w500/sGjIvtVvTlWnia2zfJfHz41vrJ7.jpg" },
    { id: "mock-rom-3", title: "La La Land", year: 2016, rating: 8.0, description: "A jazz-lit love letter to dreams and what they cost.", poster: "https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg" },
  ]},
  { id: "mindbender", label: "Mind-bent", emoji: "🌀", tagline: "Reality-warping sci-fi.", genres: ["Science Fiction"], sortBy: "vote_average.desc", minRating: 7.5, picks: [
    { id: "mock-mind-1", title: "Inception", year: 2010, rating: 8.4, description: "Heists inside dreams, folded across time.", poster: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg" },
    { id: "mock-mind-2", title: "Primer", year: 2004, rating: 6.9, description: "Two engineers stumble on time travel — and themselves.", poster: "https://image.tmdb.org/t/p/w500/h0ZRUCK1Cw0NcpvhB3lN20oJZWz.jpg" },
    { id: "mock-mind-3", title: "Everything Everywhere All at Once", year: 2022, rating: 8.0, description: "A tax-day multiverse for a tired mother.", poster: "https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg" },
  ]},
  { id: "spooky", label: "Spooky", emoji: "👻", tagline: "Lights off. Volume up.", genres: ["Horror"], sortBy: "popularity.desc", minRating: 6, picks: [
    { id: "mock-spook-1", title: "Hereditary", year: 2018, rating: 7.3, description: "A grieving family unravels into ancestral dread.", poster: "https://image.tmdb.org/t/p/w500/p9wE8JjCUtmRQcqJxzqVj1npVlj.jpg" },
    { id: "mock-spook-2", title: "The Conjuring", year: 2013, rating: 7.5, description: "Paranormal investigators face a quietly evil farmhouse.", poster: "https://image.tmdb.org/t/p/w500/wVYREutTvI2tmxr6ujrHT704wGF.jpg" },
    { id: "mock-spook-3", title: "Get Out", year: 2017, rating: 7.7, description: "A weekend visit with the in-laws turns surgical.", poster: "https://image.tmdb.org/t/p/w500/tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg" },
  ]},
  { id: "inspired", label: "Inspired", emoji: "✨", tagline: "True stories that move you.", genres: ["History", "Drama"], sortBy: "vote_average.desc", minRating: 7.5, picks: [
    { id: "mock-insp-1", title: "The Pursuit of Happyness", year: 2006, rating: 8.0, description: "A father refuses to let poverty define his son's future.", poster: "https://image.tmdb.org/t/p/w500/3LvUbXgL8gnHTZlDvAZRyVFjMNN.jpg" },
    { id: "mock-insp-2", title: "Hidden Figures", year: 2016, rating: 7.9, description: "Three brilliant women launch America into orbit.", poster: "https://image.tmdb.org/t/p/w500/lP5eKh8WOcPysfELrUpGhHJGZEH.jpg" },
    { id: "mock-insp-3", title: "Soul", year: 2020, rating: 8.0, description: "A jazz teacher learns what makes a life feel alive.", poster: "https://image.tmdb.org/t/p/w500/hm58Jw4Lw8OIeECIq5qyPYhAeRJ.jpg" },
  ]},
  { id: "nostalgic", label: "Nostalgic", emoji: "📼", tagline: "Animated classics for all ages.", genres: ["Animation", "Family"], sortBy: "vote_average.desc", minRating: 7.5, picks: [
    { id: "mock-nost-1", title: "Spirited Away", year: 2001, rating: 8.5, description: "A girl wanders into a bathhouse of strange spirits.", poster: "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg" },
    { id: "mock-nost-2", title: "Toy Story", year: 1995, rating: 8.3, description: "The toys come alive when no one is looking.", poster: "https://image.tmdb.org/t/p/w500/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg" },
    { id: "mock-nost-3", title: "The Lion King", year: 1994, rating: 8.5, description: "A young prince finds his roar across the savanna.", poster: "https://image.tmdb.org/t/p/w500/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg" },
  ]},
  { id: "scifi", label: "Sci-fi", emoji: "🌌", tagline: "Stars, signals, and impossible engines.", genres: ["Science Fiction"], sortBy: "popularity.desc", minRating: 7, picks: [
    { id: "mock-sci-1", title: "Interstellar", year: 2014, rating: 8.4, description: "A father slips through wormholes to save humanity.", poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg" },
    { id: "mock-sci-2", title: "Dune", year: 2021, rating: 7.8, description: "A messianic heir walks into the spice and the sand.", poster: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg" },
    { id: "mock-sci-3", title: "Blade Runner 2049", year: 2017, rating: 8.0, description: "A replicant detective hunts the ghost of a miracle.", poster: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg" },
  ]},
];

function Home() {
  const [mood, setMood] = useState<Mood>(MOODS[0]);
  const [picksMood, setPicksMood] = useState<Mood | null>(null);
  const [selected, setSelected] = useState<Movie | null>(null);
  const picksRef = useRef<HTMLDivElement>(null);

  const handleMoodClick = (m: Mood) => {
    setMood(m);
    setPicksMood(m);
    setTimeout(() => picksRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const trendingFn = useServerFn(tmdbTrending);
  const bollywoodFn = useServerFn(tmdbBollywood);
  const discoverFn = useServerFn(tmdbDiscover);
  const topRatedFn = useServerFn(tmdbTopRated);

  const topRated = useQuery({
    queryKey: ["topRated"],
    queryFn: () => topRatedFn(),
    staleTime: 10 * 60_000,
  });

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
    queryKey: ["mood", mood.id],
    queryFn: () =>
      discoverFn({
        data: {
          sortBy: mood.sortBy,
          genres: mood.genres,
          minRating: mood.minRating,
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
            Pick a mood and we'll find your movie.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-2 sm:gap-3 max-w-3xl mx-auto">
            {MOODS.map((m) => {
              const active = m.id === mood.id;
              return (
                <button
                  key={m.id}
                  onClick={() => handleMoodClick(m)}
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

      {/* Mood picks (instant recommendations) */}
      <div ref={picksRef}>
        {picksMood && (
          <MoodPicksSection
            key={picksMood.id}
            mood={picksMood}
            onClose={() => setPicksMood(null)}
          />
        )}
      </div>

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

function MoodPicksSection({ mood, onClose }: { mood: Mood; onClose: () => void }) {
  const items = useWatchlist();
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <div className="glass neon-border rounded-3xl p-6 sm:p-8" style={{ boxShadow: "0 0 60px -20px rgba(0,245,255,0.35)" }}>
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-cyan text-xs uppercase tracking-[0.3em]">
              <Sparkles className="size-4" /> Mood Picks
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mt-2">
              <span className="mr-2">{mood.emoji}</span>
              Movies for your <span className="text-gradient">{mood.label}</span> vibe
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close recommendations"
            className="size-9 rounded-full glass neon-border flex items-center justify-center text-muted-foreground hover:text-cyan transition shrink-0"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {mood.picks.map((p) => {
            const inList = !!items.find((i) => i.id === p.id);
            return (
              <div key={p.id} className="group rounded-2xl overflow-hidden glass neon-border transition hover:-translate-y-1 hover:glow-cyan">
                <div className="aspect-[2/3] overflow-hidden relative">
                  <PickPoster title={p.title} year={p.year} src={p.poster} />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                  <div className="absolute top-2 right-2 glass rounded-full px-2 py-0.5 flex items-center gap-1 text-xs">
                    <Star className="size-3 fill-cyan text-cyan" />
                    <span className="font-semibold">{p.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-display font-semibold text-lg leading-tight">{p.title}</h3>
                  <p className="text-xs text-muted-foreground">{p.year}</p>
                  <p className="text-sm text-foreground/80 line-clamp-2">{p.description}</p>
                  <button
                    onClick={() => {
                      if (inList) {
                        watchlist.remove(p.id);
                        toast("Removed from watchlist");
                      } else {
                        watchlist.add(p.id);
                        toast.success(`Added "${p.title}" to your watchlist`);
                      }
                    }}
                    className={`mt-2 w-full rounded-full py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition glass neon-border ${
                      inList ? "text-cyan glow-cyan" : "text-foreground hover:text-cyan hover:glow-cyan"
                    }`}
                  >
                    {inList ? <><Check className="size-4" /> In Watchlist</> : <><Plus className="size-4" /> Add to Watchlist</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PickPoster({ src, title, year }: { src: string; title: string; year?: number }) {
  const posterLookupFn = useServerFn(tmdbPosterLookup);
  const { data: livePoster, isLoading } = useQuery({
    queryKey: ["tmdbLivePoster", title, year],
    queryFn: async () => {
      const res = await posterLookupFn({ data: { title, year } });
      return res.poster;
    },
    staleTime: 24 * 60 * 60_000,
  });

  const [loaded, setLoaded] = useState(false);
  const [fallback, setFallback] = useState(false);
  const finalSrc = fallback ? src : livePoster || src;

  return (
    <>
      {(!loaded || isLoading) && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted/40 to-muted/10" />
      )}
      <img
        key={finalSrc}
        src={finalSrc}
        alt={title}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!fallback && finalSrc !== src) {
            setFallback(true);
            setLoaded(false);
          } else {
            setLoaded(true);
          }
        }}
        className="size-full object-cover aspect-[2/3] transition-transform duration-500 group-hover:scale-110"
      />
    </>
  );
}
