import { X, Clock, Calendar, Plus, Check } from "lucide-react";
import type { Movie } from "@/lib/movies";
import { watchlist, useWatchlist } from "@/lib/watchlist-store";
import { StarRating } from "./StarRating";
import { toast } from "sonner";
import { useEffect } from "react";

export function MovieModal({ movie, onClose }: { movie: Movie | null; onClose: () => void }) {
  const items = useWatchlist();
  const item = movie ? items.find((i) => i.id === movie.id) : null;
  const inList = !!item;

  useEffect(() => {
    if (!movie) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [movie, onClose]);

  if (!movie) return null;

  const toggle = () => {
    if (inList) { watchlist.remove(movie.id); toast("Removed from watchlist"); }
    else { watchlist.add(movie.id); toast.success("Added to watchlist"); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl glass neon-border animate-scale-in scrollbar-hide">
        <div className="absolute inset-x-0 top-0 h-64 overflow-hidden rounded-t-2xl">
          <img src={movie.backdrop} alt="" className="size-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 z-10 size-9 rounded-full glass flex items-center justify-center hover:glow-cyan transition">
          <X className="size-4" />
        </button>

        <div className="relative pt-32 sm:pt-40 p-6 sm:p-8 grid sm:grid-cols-[200px_1fr] gap-6">
          <img src={movie.poster} alt={movie.title} className="rounded-xl w-full sm:w-[200px] aspect-[2/3] object-cover glow-purple" />
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">{movie.title}</h2>
            <p className="text-cyan italic mt-1">{movie.tagline}</p>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="size-4" /> {movie.year}</span>
              <span className="flex items-center gap-1"><Clock className="size-4" /> {movie.runtime}m</span>
              <span className="flex items-center gap-1">★ {movie.rating.toFixed(1)}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {movie.genres.map((g) => (
                <span key={g} className="text-xs px-3 py-1 rounded-full glass border border-cyan/30 text-cyan">{g}</span>
              ))}
            </div>
            <p className="mt-5 text-sm leading-relaxed text-foreground/90">{movie.overview}</p>

            <div className="mt-6 space-y-4">
              <button
                onClick={toggle}
                className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                style={{ background: "var(--gradient-neon)", color: "var(--background)", boxShadow: "var(--shadow-glow-cyan)" }}
              >
                {inList ? <><Check className="size-4" /> In Watchlist</> : <><Plus className="size-4" /> Add to Watchlist</>}
              </button>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Your Rating</p>
                <StarRating
                  value={item?.rating || 0}
                  onChange={(v) => {
                    if (!inList) watchlist.add(movie.id);
                    watchlist.rate(movie.id, v);
                    toast.success("Rating saved");
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
