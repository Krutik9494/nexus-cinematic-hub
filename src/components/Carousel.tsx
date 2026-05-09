import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Movie } from "@/lib/movies";
import { MovieCard } from "./MovieCard";

export function Carousel({ movies, onSelect }: { movies: Movie[]; onSelect: (m: Movie) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * 600, behavior: "smooth" });

  return (
    <div className="relative group">
      <div ref={ref} className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2">
        {movies.map((m) => (
          <div key={m.id} className="snap-start shrink-0 w-44 sm:w-52">
            <MovieCard movie={m} onClick={() => onSelect(m)} />
          </div>
        ))}
      </div>
      <button onClick={() => scroll(-1)} className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 size-10 rounded-full glass items-center justify-center opacity-0 group-hover:opacity-100 transition hover:glow-cyan">
        <ChevronLeft className="size-5" />
      </button>
      <button onClick={() => scroll(1)} className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 size-10 rounded-full glass items-center justify-center opacity-0 group-hover:opacity-100 transition hover:glow-cyan">
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
