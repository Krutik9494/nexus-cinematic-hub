import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Film, Star, Eye, Heart, TrendingUp } from "lucide-react";
import { MOVIES } from "@/lib/movies";
import { useWatchlist } from "@/lib/watchlist-store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — NEXUS" },
      { name: "description", content: "Your cinematic journey at a glance." },
    ],
  }),
  component: Profile,
});

function Ring({ value, max = 10, label, sub, color = "var(--cyan)" }: { value: number; max?: number; label: string; sub: string; color?: string }) {
  const pct = Math.max(0, Math.min(1, value / max));
  const r = 52, c = 2 * Math.PI * r;
  return (
    <div className="glass neon-border rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="relative">
        <svg width={130} height={130} className="-rotate-90">
          <circle cx={65} cy={65} r={r} stroke="oklch(0.2 0.03 280)" strokeWidth={8} fill="none" />
          <circle cx={65} cy={65} r={r} stroke={color} strokeWidth={8} fill="none"
            strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 10px ${color})`, transition: "stroke-dashoffset 0.8s ease" }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="font-display text-3xl font-bold">{value.toFixed(value % 1 === 0 ? 0 : 1)}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{sub}</span>
        </div>
      </div>
      <p className="mt-4 text-sm font-semibold">{label}</p>
    </div>
  );
}

function Profile() {
  const items = useWatchlist();

  const stats = useMemo(() => {
    const enriched = items.map((it) => ({ it, m: MOVIES.find((x) => x.id === it.id)! })).filter((x) => x.m);
    const watched = enriched.filter((x) => x.it.watched).length;
    const fav = enriched.filter((x) => x.it.favorite).length;
    const rated = enriched.filter((x) => x.it.rating > 0);
    const avg = rated.length ? rated.reduce((s, x) => s + x.it.rating, 0) / rated.length : 0;
    const genreCount: Record<string, number> = {};
    enriched.forEach((x) => x.m.genres.forEach((g) => { genreCount[g] = (genreCount[g] || 0) + 1; }));
    const topGenres = Object.entries(genreCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const recent = [...enriched].sort((a, b) => b.it.addedAt - a.it.addedAt).slice(0, 8);
    return { total: enriched.length, watched, fav, avg, topGenres, recent };
  }, [items]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center gap-5">
        <div className="size-20 rounded-full flex items-center justify-center" style={{ background: "var(--gradient-neon)", boxShadow: "var(--shadow-glow-cyan)" }}>
          <span className="font-display text-3xl font-bold text-background">N</span>
        </div>
        <div>
          <p className="text-cyan text-xs uppercase tracking-[0.3em]">Operative</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mt-1">Nexus User</h1>
          <p className="text-muted-foreground mt-1">Curating the universe, one film at a time.</p>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Ring value={stats.total} max={Math.max(20, stats.total)} label="Watchlist" sub="titles" />
        <Ring value={stats.avg} label="Avg Rating" sub="of 10" color="oklch(0.62 0.27 305)" />
        <Ring value={stats.watched} max={Math.max(stats.total, 1)} label="Watched" sub="films" color="oklch(0.72 0.2 240)" />
        <Ring value={stats.fav} max={Math.max(stats.total, 1)} label="Favorites" sub="loved" color="oklch(0.7 0.25 20)" />
      </div>

      <div className="mt-10 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 glass neon-border rounded-2xl p-6">
          <div className="flex items-center gap-2 text-cyan text-xs uppercase tracking-[0.25em] mb-4"><TrendingUp className="size-4" /> Top Genres</div>
          {stats.topGenres.length === 0 ? (
            <p className="text-sm text-muted-foreground">Add movies to reveal your taste signature.</p>
          ) : (
            <div className="space-y-3">
              {stats.topGenres.map(([g, n]) => {
                const pct = (n / stats.topGenres[0][1]) * 100;
                return (
                  <div key={g}>
                    <div className="flex justify-between text-sm mb-1"><span>{g}</span><span className="text-muted-foreground">{n}</span></div>
                    <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--gradient-neon)", boxShadow: "0 0 10px var(--cyan)" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 glass neon-border rounded-2xl p-6">
          <div className="flex items-center gap-2 text-cyan text-xs uppercase tracking-[0.25em] mb-4"><Star className="size-4" /> My Cinematic Journey</div>
          {stats.recent.length === 0 ? (
            <div className="py-10 text-center">
              <Film className="size-12 text-cyan mx-auto mb-3 animate-float" style={{ filter: "drop-shadow(0 0 12px var(--cyan))" }} />
              <p className="text-muted-foreground text-sm">Your timeline awaits its first transmission.</p>
              <Link to="/discover" className="mt-4 inline-block px-5 py-2 rounded-full text-sm font-semibold" style={{ background: "var(--gradient-neon)", color: "var(--background)" }}>Discover Now</Link>
            </div>
          ) : (
            <div className="relative pl-4">
              <div className="absolute left-0 top-0 bottom-0 w-px" style={{ background: "var(--gradient-neon)" }} />
              <div className="space-y-4">
                {stats.recent.map(({ it, m }) => (
                  <div key={m.id} className="relative flex items-center gap-4">
                    <div className="absolute -left-[18px] size-3 rounded-full" style={{ background: "var(--cyan)", boxShadow: "0 0 12px var(--cyan)" }} />
                    <img src={m.poster} alt={m.title} className="w-12 h-16 object-cover rounded-md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{m.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(it.addedAt).toLocaleDateString()} · {m.genres[0]}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {it.favorite && <Heart className="size-3.5 fill-current text-[#ff3d77]" />}
                      {it.watched && <Eye className="size-3.5 text-cyan" />}
                      {it.rating > 0 && <span className="text-cyan">★ {it.rating}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
