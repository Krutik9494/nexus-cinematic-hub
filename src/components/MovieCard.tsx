import { Star, Plus, Check } from "lucide-react";
import type { Movie } from "@/lib/movies";
import { watchlist, useWatchlist } from "@/lib/watchlist-store";
import { toast } from "sonner";

type Props = { movie: Movie; onClick?: () => void };

export function MovieCard({ movie, onClick }: Props) {
  const items = useWatchlist();
  const inList = items.some((i) => i.id === movie.id);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inList) { watchlist.remove(movie.id); toast("Removed from watchlist"); }
    else { watchlist.add(movie.id); toast.success("Added to watchlist"); }
  };

  return (
    <button
      onClick={onClick}
      className="group relative text-left rounded-xl overflow-hidden glass neon-border transition-all duration-300 hover:-translate-y-1 hover:glow-cyan focus:outline-none focus:ring-2 focus:ring-cyan w-full"
    >
      <div className="aspect-[2/3] overflow-hidden relative">
        <img
          src={movie.poster} alt={movie.title} loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-80 group-hover:opacity-95 transition" />
        <div className="absolute top-2 right-2 glass rounded-full px-2 py-0.5 flex items-center gap-1 text-xs">
          <Star className="size-3 fill-cyan text-cyan" />
          <span className="font-semibold">{movie.rating.toFixed(1)}</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-2 group-hover:translate-y-0 transition">
          <button
            onClick={toggle}
            className="w-full glass neon-border rounded-md py-1.5 text-xs font-medium flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition hover:text-cyan"
          >
            {inList ? <><Check className="size-3.5" /> In Watchlist</> : <><Plus className="size-3.5" /> Add to Watchlist</>}
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
    </button>
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
