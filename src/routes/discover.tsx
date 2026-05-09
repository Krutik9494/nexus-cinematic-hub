import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { GENRES, MOVIES, type Movie } from "@/lib/movies";
import { MovieCard } from "@/components/MovieCard";
import { MovieModal } from "@/components/MovieModal";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover — NEXUS" },
      { name: "description", content: "Explore the full catalog of cinematic experiences." },
    ],
  }),
  component: Discover,
});

function Discover() {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("All");
  const [selected, setSelected] = useState<Movie | null>(null);

  const filtered = useMemo(() => MOVIES.filter((m) => {
    const g = genre === "All" || m.genres.includes(genre);
    const q = !query || m.title.toLowerCase().includes(query.toLowerCase());
    return g && q;
  }), [query, genre]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <p className="text-cyan text-xs uppercase tracking-[0.3em]">Catalog</p>
      <h1 className="font-display text-4xl sm:text-5xl font-bold mt-2">Discover</h1>

      <div className="mt-8 glass neon-border rounded-full flex items-center px-5 py-3 max-w-2xl">
        <Search className="size-5 text-cyan" />
        <input
          value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the archive…"
          className="flex-1 bg-transparent outline-none px-4 text-base placeholder:text-muted-foreground"
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {GENRES.map((g) => (
          <button key={g} onClick={() => setGenre(g)}
            className={`px-4 py-1.5 text-xs rounded-full glass neon-border transition ${genre === g ? "text-cyan glow-cyan" : "text-muted-foreground hover:text-foreground"}`}>
            {g}
          </button>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {filtered.map((m) => <MovieCard key={m.id} movie={m} onClick={() => setSelected(m)} />)}
      </div>

      <MovieModal movie={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
