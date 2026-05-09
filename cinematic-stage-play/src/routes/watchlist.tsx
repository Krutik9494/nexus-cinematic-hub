import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Grid3x3, List, Trash2, Film, Heart, Eye, GripVertical } from "lucide-react";
import type { Movie } from "@/lib/movies";
import { useWatchlist, watchlist } from "@/lib/watchlist-store";
import { tmdbBatch } from "@/lib/tmdb.functions";
import { useTmdbKey } from "@/lib/tmdb-key";
import { MovieCard, MovieCardSkeleton } from "@/components/MovieCard";
import { MovieModal } from "@/components/MovieModal";
import { StarRating } from "@/components/StarRating";
import { toast } from "sonner";

export const Route = createFileRoute("/watchlist")({
  head: () => ({
    meta: [
      { title: "My Watchlist — NEXUS" },
      { name: "description", content: "Your personal cinematic queue." },
      { property: "og:title", content: "My Watchlist — NEXUS" },
      { property: "og:description", content: "Your personal cinematic queue." },
    ],
  }),
  component: WatchlistPage,
});

type Sort = "added" | "rating" | "title";
type Tab = "all" | "favorites" | "watched";

function WatchlistPage() {
  const items = useWatchlist();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState<Sort>("added");
  const [tab, setTab] = useState<Tab>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedInitial, setSelectedInitial] = useState<Movie | null>(null);
  const dragId = useRef<string | null>(null);

  const ids = items.map((i) => i.id);
  const idsKey = ids.join(",");

  const apiKey = useTmdbKey();
  const batchFn = useServerFn(tmdbBatch);
  const movies = useQuery({
    queryKey: ["watchlist-movies", idsKey, !!apiKey],
    queryFn: () => batchFn({ data: { ids, apiKey } }),
    enabled: ids.length > 0,
    staleTime: 5 * 60_000,
  });

  const list = useMemo(() => {
    const moviesById = new Map((movies.data || []).map((m) => [m.id, m]));
    const enriched = items
      .map((it) => ({ it, movie: moviesById.get(it.id) }))
      .filter((x): x is { it: typeof x.it; movie: Movie } => !!x.movie)
      .filter((x) => (tab === "all" ? true : tab === "favorites" ? x.it.favorite : x.it.watched));
    if (sort !== "added" || tab !== "all") {
      enriched.sort((a, b) => {
        if (sort === "rating") return b.it.rating - a.it.rating;
        if (sort === "title") return a.movie.title.localeCompare(b.movie.title);
        return b.it.addedAt - a.it.addedAt;
      });
    }
    return enriched;
  }, [items, movies.data, sort, tab]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: "all", label: "All", icon: <Film className="size-3.5" />, count: items.length },
    { key: "favorites", label: "Favorites", icon: <Heart className="size-3.5" />, count: items.filter((i) => i.favorite).length },
    { key: "watched", label: "Watched", icon: <Eye className="size-3.5" />, count: items.filter((i) => i.watched).length },
  ];

  const onDrop = (targetId: string) => {
    const sourceId = dragId.current;
    dragId.current = null;
    if (!sourceId || sourceId === targetId) return;
    const all = list.map((x) => x.movie.id);
    const from = all.indexOf(sourceId);
    const to = all.indexOf(targetId);
    if (from < 0 || to < 0) return;
    all.splice(to, 0, all.splice(from, 1)[0]);
    if (tab === "all" && sort === "added") {
      watchlist.reorder(all);
      toast.success("Reordered");
    } else {
      toast("Reordering only available in All / Date Added view");
    }
  };

  const total = items.length;
  const watchedCount = items.filter((i) => i.watched).length;
  const progress = total ? Math.round((watchedCount / total) * 100) : 0;

  const open = (m: Movie) => { setSelectedInitial(m); setSelectedId(m.id); };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-cyan text-xs uppercase tracking-[0.3em]">Personal Archive</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mt-2">My Watchlist</h1>
          <p className="text-muted-foreground mt-2">{list.length} {list.length === 1 ? "title" : "titles"} in view</p>
        </div>
        {total > 0 && (
          <div className="flex items-center gap-2">
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="glass neon-border rounded-lg px-3 py-2 text-sm outline-none">
              <option value="added">Date Added</option>
              <option value="rating">My Rating</option>
              <option value="title">Title</option>
            </select>
            <div className="glass rounded-lg p-1 flex">
              <button onClick={() => setView("grid")} className={`size-8 rounded flex items-center justify-center transition ${view === "grid" ? "bg-cyan/20 text-cyan" : "text-muted-foreground"}`}><Grid3x3 className="size-4" /></button>
              <button onClick={() => setView("list")} className={`size-8 rounded flex items-center justify-center transition ${view === "list" ? "bg-cyan/20 text-cyan" : "text-muted-foreground"}`}><List className="size-4" /></button>
            </div>
          </div>
        )}
      </div>

      {total > 0 && (
        <div className="mb-6 glass neon-border rounded-xl p-4 flex items-center gap-4">
          <Eye className="size-5 text-cyan" />
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Watch Progress</span>
              <span className="text-cyan font-semibold">{watchedCount} / {total} · {progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: "var(--gradient-neon)", boxShadow: "0 0 10px var(--cyan)" }} />
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-full glass text-sm flex items-center gap-2 transition ${tab === t.key ? "text-cyan glow-cyan neon-border" : "text-muted-foreground hover:text-foreground"}`}>
            {t.icon} {t.label}
            <span className="text-[10px] opacity-70">{t.count}</span>
          </button>
        ))}
      </div>

      {total === 0 ? (
        <div className="glass neon-border rounded-2xl p-12 sm:p-20 text-center relative overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="relative">
            <div className="size-20 mx-auto rounded-full glass flex items-center justify-center mb-6 animate-float">
              <Film className="size-10 text-cyan" style={{ filter: "drop-shadow(0 0 12px var(--cyan))" }} />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold">Your archive is empty</h2>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">Start curating your cinematic universe.</p>
            <Link to="/discover" className="mt-8 inline-block px-6 py-3 rounded-lg font-semibold" style={{ background: "var(--gradient-neon)", color: "var(--background)", boxShadow: "var(--shadow-glow-cyan)" }}>
              Discover Movies
            </Link>
          </div>
        </div>
      ) : movies.isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {Array.from({ length: Math.min(total, 10) }).map((_, i) => <MovieCardSkeleton key={i} />)}
        </div>
      ) : list.length === 0 ? (
        <div className="glass neon-border rounded-2xl p-12 text-center">
          <p className="font-display text-xl">No {tab} yet.</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {list.map(({ movie }) => <MovieCard key={movie.id} movie={movie} onClick={() => open(movie)} />)}
        </div>
      ) : (
        <div className="space-y-3">
          {list.map(({ movie, it }) => (
            <div
              key={movie.id}
              draggable
              onDragStart={() => { dragId.current = movie.id; }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(movie.id)}
              className="glass neon-border rounded-xl p-4 flex flex-col sm:flex-row gap-4 hover:glow-cyan transition cursor-grab active:cursor-grabbing"
            >
              <div className="hidden sm:flex items-center text-muted-foreground"><GripVertical className="size-5" /></div>
              <button onClick={() => open(movie)} className="shrink-0">
                <img src={movie.poster} alt={movie.title} className={`w-20 h-28 object-cover rounded-lg ${it.watched ? "grayscale-[40%]" : ""}`} />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={() => open(movie)} className="text-left">
                    <h3 className="font-display font-bold text-lg truncate hover:text-cyan transition">{movie.title}</h3>
                  </button>
                  {it.favorite && <Heart className="size-4 fill-current text-favorite" />}
                  {it.watched && <span className="text-[10px] uppercase tracking-widest text-cyan border border-cyan/40 px-2 py-0.5 rounded-full">Watched</span>}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{movie.year || "—"} · {movie.genres.join(", ")}</p>
                <p className="text-sm text-foreground/80 mt-2 line-clamp-2">{movie.overview}</p>
                <div className="mt-3 flex items-center gap-3">
                  <StarRating value={it.rating} size={18} onChange={(v) => { watchlist.rate(movie.id, v); toast.success("Rating saved"); }} />
                  <button onClick={() => watchlist.toggleFavorite(movie.id)} className={`size-8 rounded-full glass flex items-center justify-center transition ${it.favorite ? "text-favorite" : "hover:text-favorite"}`}>
                    <Heart className={`size-3.5 ${it.favorite ? "fill-current" : ""}`} />
                  </button>
                  <button onClick={() => watchlist.toggleWatched(movie.id)} className={`size-8 rounded-full glass flex items-center justify-center transition ${it.watched ? "text-cyan" : "hover:text-cyan"}`}>
                    <Eye className="size-3.5" />
                  </button>
                </div>
              </div>
              <button
                onClick={() => { watchlist.remove(movie.id); toast("Removed from watchlist"); }}
                className="self-start size-9 rounded-full glass flex items-center justify-center text-destructive hover:bg-destructive/10 transition"
                aria-label="Remove"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <MovieModal
        movieId={selectedId}
        initial={selectedInitial}
        onClose={() => setSelectedId(null)}
        onSwitch={(m) => { setSelectedInitial(m); setSelectedId(m.id); }}
      />
    </div>
  );
}
