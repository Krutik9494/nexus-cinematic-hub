import { Star, Plus, Check, Heart, Eye } from "lucide-react";
import type { Movie } from "@/lib/movies";
import { watchlist, useWatchlist } from "@/lib/watchlist-store";
import { toast } from "sonner";

type Props = { movie: Movie; onClick?: () => void };

export function MovieCard({ movie, onClick }: Props) {
  const items = useWatchlist();
  const item = items.find((i) => i.id === movie.id);
  const inList = !!item;
  const fav = !!item?.favorite;
  const watched = !!item?.watched;

  const stop = (fn: () => void) => (e: React.MouseEvent) => { e.stopPropagation(); fn(); };

  const toggleList = () => {
    if (inList) { watchlist.remove(movie.id); toast("Removed from watchlist"); }
    else { watchlist.add(movie.id); toast.success("Added to watchlist"); }
  };
  const toggleFav = () => { watchlist.toggleFavorite(movie.id); toast.success(fav ? "Removed from favorites" : "Added to favorites"); };
  const toggleWatched = () => { watchlist.toggleWatched(movie.id); toast.success(watched ? "Marked unwatched" : "Marked as watched"); };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.();
        }
      }}
      className="group relative text-left rounded-xl overflow-hidden glass neon-border transition-all duration-300 hover:-translate-y-1 hover:glow-cyan focus:outline-none focus:ring-2 focus:ring-cyan w-full"
    >
      <div className="aspect-[2/3] overflow-hidden relative">
        <img
          src={movie.poster} alt={movie.title} loading="lazy"
          className={`size-full object-cover transition-transform duration-500 group-hover:scale-110 ${watched ? "grayscale-[40%]" : ""}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-80 group-hover:opacity-95 transition" />

        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          <button
            onClick={stop(toggleFav)}
            aria-label="Favorite"
            className={`size-7 rounded-full glass flex items-center justify-center transition ${fav ? "text-favorite" : "text-muted-foreground hover:text-favorite"}`}
            style={fav ? { boxShadow: "0 0 14px color-mix(in oklab, var(--favorite) 60%, transparent)" } : undefined}
          >
            <Heart className={`size-3.5 ${fav ? "fill-current" : ""}`} />
          </button>
          {watched && (
            <span className="size-7 rounded-full glass flex items-center justify-center text-cyan" title="Watched">
              <Eye className="size-3.5" />
            </span>
          )}
        </div>

        <div className="absolute top-2 right-2 glass rounded-full px-2 py-0.5 flex items-center gap-1 text-xs">
          <Star className="size-3 fill-cyan text-cyan" />
          <span className="font-semibold">{movie.rating.toFixed(1)}</span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-2 group-hover:translate-y-0 transition space-y-1.5">
          <button
            onClick={stop(toggleList)}
            className="w-full glass neon-border rounded-md py-1.5 text-xs font-medium flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition hover:text-cyan"
          >
            {inList ? <><Check className="size-3.5" /> In Watchlist</> : <><Plus className="size-3.5" /> Add to Watchlist</>}
          </button>
          <button
            onClick={stop(toggleWatched)}
            className={`w-full glass rounded-md py-1.5 text-xs font-medium flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition ${watched ? "text-cyan" : "hover:text-cyan"}`}
          >
            <Eye className="size-3.5" /> {watched ? "Watched" : "Mark Watched"}
          </button>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-display font-semibold truncate">{movie.title}</h3>
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-0.5">
          <span>{movie.year}</span>
          <span className="truncate ml-2">{movie.genres[0]}</span>
        </div>
      </div>
    </div>
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="rounded-xl glass overflow-hidden">
      <div className="aspect-[2/3] bg-muted/30 animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-muted/30 rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-muted/30 rounded animate-pulse" />
      </div>
    </div>
  );
}
