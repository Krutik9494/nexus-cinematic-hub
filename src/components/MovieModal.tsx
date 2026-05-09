import { X, Clock, Calendar, Plus, Check, Heart, Eye, Play } from "lucide-react";
import { similarTo, type Movie } from "@/lib/movies";
import { watchlist, useWatchlist } from "@/lib/watchlist-store";
import { StarRating } from "./StarRating";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export function MovieModal({ movie, onClose }: { movie: Movie | null; onClose: () => void }) {
  const items = useWatchlist();
  const item = movie ? items.find((i) => i.id === movie.id) : null;
  const inList = !!item;
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    if (!movie) return;
    setShowTrailer(false);
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

  const similar = similarTo(movie);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl glass neon-border animate-scale-in scrollbar-hide">
        <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl bg-black">
          {showTrailer ? (
            <iframe
              className="absolute inset-0 size-full"
              src={`https://www.youtube.com/embed/${movie.trailerId}?autoplay=1&rel=0`}
              title="Trailer"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <>
              <img src={movie.backdrop} alt="" className="size-full object-cover opacity-70" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background" />
              <button
                onClick={() => setShowTrailer(true)}
                className="absolute inset-0 flex items-center justify-center group"
                aria-label="Play trailer"
              >
                <span className="size-20 rounded-full glass neon-border flex items-center justify-center group-hover:glow-cyan transition" style={{ background: "var(--gradient-neon)" }}>
                  <Play className="size-8 fill-background text-background ml-1" />
                </span>
              </button>
            </>
          )}
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 z-10 size-9 rounded-full glass flex items-center justify-center hover:glow-cyan transition">
          <X className="size-4" />
        </button>

        <div className="p-6 sm:p-8 grid sm:grid-cols-[200px_1fr] gap-6">
          <img src={movie.poster} alt={movie.title} className="rounded-xl w-full sm:w-[200px] aspect-[2/3] object-cover glow-purple -mt-24 sm:-mt-32 relative z-10" />
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

            <div className="mt-6 flex flex-wrap gap-3 items-center">
              <button
                onClick={toggle}
                className="px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                style={{ background: "var(--gradient-neon)", color: "var(--background)", boxShadow: "var(--shadow-glow-cyan)" }}
              >
                {inList ? <><Check className="size-4" /> In Watchlist</> : <><Plus className="size-4" /> Add to Watchlist</>}
              </button>
              <button
                onClick={() => { watchlist.toggleFavorite(movie.id); toast.success("Updated favorites"); }}
                className={`size-11 rounded-lg glass neon-border flex items-center justify-center transition ${item?.favorite ? "text-[#ff3d77]" : "hover:text-[#ff3d77]"}`}
                aria-label="Favorite"
              >
                <Heart className={`size-5 ${item?.favorite ? "fill-current" : ""}`} />
              </button>
              <button
                onClick={() => { watchlist.toggleWatched(movie.id); toast.success("Updated watched"); }}
                className={`size-11 rounded-lg glass neon-border flex items-center justify-center transition ${item?.watched ? "text-cyan" : "hover:text-cyan"}`}
                aria-label="Watched"
              >
                <Eye className="size-5" />
              </button>
            </div>

            <div className="mt-6">
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

        {/* Cast */}
        <div className="px-6 sm:px-8 pb-6">
          <h3 className="font-display text-lg font-semibold mb-3">Cast</h3>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-2 px-2">
            {movie.cast.map((c) => (
              <div key={c.name} className="shrink-0 w-28 text-center">
                <div className="size-24 mx-auto rounded-full overflow-hidden glass neon-border">
                  <img src={c.photo} alt={c.name} className="size-full object-cover" />
                </div>
                <p className="mt-2 text-xs font-semibold truncate">{c.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{c.character}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Similar */}
        <div className="px-6 sm:px-8 pb-8">
          <h3 className="font-display text-lg font-semibold mb-3">Movies Like This</h3>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-2 px-2">
            {similar.map((m) => (
              <button key={m.id} onClick={() => { setShowTrailer(false); /* swap movie via parent not available */ }} className="shrink-0 w-32 text-left group">
                <div className="aspect-[2/3] rounded-lg overflow-hidden glass neon-border group-hover:glow-cyan transition">
                  <img src={m.poster} alt={m.title} className="size-full object-cover group-hover:scale-110 transition duration-500" />
                </div>
                <p className="mt-2 text-xs font-semibold truncate">{m.title}</p>
                <p className="text-[10px] text-muted-foreground">{m.year}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
