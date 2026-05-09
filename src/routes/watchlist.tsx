import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Grid3x3, List, Trash2, Film } from "lucide-react";
import { MOVIES, type Movie } from "@/lib/movies";
import { useWatchlist, watchlist } from "@/lib/watchlist-store";
import { MovieCard } from "@/components/MovieCard";
import { MovieModal } from "@/components/MovieModal";
import { StarRating } from "@/components/StarRating";
import { toast } from "sonner";

export const Route = createFileRoute("/watchlist")({
  head: () => ({
    meta: [
      { title: "My Watchlist — NEXUS" },
      { name: "description", content: "Your personal cinematic queue." },
    ],
  }),
  component: WatchlistPage,
});

type Sort = "added" | "rating" | "title";

function WatchlistPage() {
  const items = useWatchlist();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState<Sort>("added");
  const [selected, setSelected] = useState<Movie | null>(null);

  const list = useMemo(() => {
    const enriched = items
      .map((it) => ({ it, movie: MOVIES.find((m) => m.id === it.id)! }))
      .filter((x) => x.movie);
    enriched.sort((a, b) => {
      if (sort === "rating") return b.it.rating - a.it.rating;
      if (sort === "title") return a.movie.title.localeCompare(b.movie.title);
      return b.it.addedAt - a.it.addedAt;
    });
    return enriched;
  }, [items, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-cyan text-xs uppercase tracking-[0.3em]">Personal Archive</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mt-2">My Watchlist</h1>
          <p className="text-muted-foreground mt-2">{list.length} {list.length === 1 ? "title" : "titles"} in your queue</p>
        </div>
        {list.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              value={sort} onChange={(e) => setSort(e.target.value as Sort)}
              className="glass neon-border rounded-lg px-3 py-2 text-sm outline-none"
            >
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

      {list.length === 0 ? (
        <div className="glass neon-border rounded-2xl p-12 sm:p-20 text-center relative overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="relative">
            <div className="size-20 mx-auto rounded-full glass flex items-center justify-center mb-6 animate-float">
              <Film className="size-10 text-cyan" style={{ filter: "drop-shadow(0 0 12px var(--cyan))" }} />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold">Your archive is empty</h2>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">Start curating your cinematic universe — discover and add films from the home page.</p>
            <Link to="/" className="mt-8 inline-block px-6 py-3 rounded-lg font-semibold" style={{ background: "var(--gradient-neon)", color: "var(--background)", boxShadow: "var(--shadow-glow-cyan)" }}>
              Discover Movies
            </Link>
          </div>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {list.map(({ movie }) => <MovieCard key={movie.id} movie={movie} onClick={() => setSelected(movie)} />)}
        </div>
      ) : (
        <div className="space-y-3">
          {list.map(({ movie, it }) => (
            <div key={movie.id} className="glass neon-border rounded-xl p-4 flex flex-col sm:flex-row gap-4 hover:glow-cyan transition">
              <button onClick={() => setSelected(movie)} className="shrink-0">
                <img src={movie.poster} alt={movie.title} className="w-20 h-28 object-cover rounded-lg" />
              </button>
              <div className="flex-1 min-w-0">
                <button onClick={() => setSelected(movie)} className="text-left">
                  <h3 className="font-display font-bold text-lg truncate hover:text-cyan transition">{movie.title}</h3>
                </button>
                <p className="text-sm text-muted-foreground mt-1">{movie.year} · {movie.genres.join(", ")}</p>
                <p className="text-sm text-foreground/80 mt-2 line-clamp-2">{movie.overview}</p>
                <div className="mt-3">
                  <StarRating value={it.rating} size={18} onChange={(v) => { watchlist.rate(movie.id, v); toast.success("Rating saved"); }} />
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

      <MovieModal movie={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
