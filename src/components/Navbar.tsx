import { Link } from "@tanstack/react-router";
import { Search, Moon, Sun, User, Film } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/lib/theme-store";

export function Navbar() {
  const { theme, toggle } = useTheme();
  const [q, setQ] = useState("");

  return (
    <header className="fixed top-0 inset-x-0 z-50 glass border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="relative">
            <Film className="size-6 text-cyan" style={{ filter: "drop-shadow(0 0 8px var(--cyan))" }} />
          </div>
          <span className="font-display text-xl font-bold tracking-widest text-gradient">NEXUS</span>
        </Link>

        <div className="hidden md:flex flex-1 max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search the cinematic universe…"
            className="w-full glass rounded-full pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan/50 transition"
          />
        </div>

        <nav className="flex items-center gap-1 sm:gap-2 ml-auto">
          <Link to="/" activeOptions={{ exact: true }} className="hidden sm:block px-3 py-2 text-sm rounded-md hover:text-cyan transition" activeProps={{ className: "text-cyan" }}>Home</Link>
          <Link to="/discover" className="hidden sm:block px-3 py-2 text-sm rounded-md hover:text-cyan transition" activeProps={{ className: "text-cyan" }}>Discover</Link>
          <Link to="/watchlist" className="px-3 py-2 text-sm rounded-md hover:text-cyan transition" activeProps={{ className: "text-cyan" }}>Watchlist</Link>
          <button onClick={toggle} aria-label="Toggle theme" className="size-9 rounded-full glass flex items-center justify-center hover:glow-cyan transition">
            {theme === "dark" ? <Moon className="size-4 text-cyan" /> : <Sun className="size-4 text-cyan" />}
          </button>
          <button aria-label="Profile" className="size-9 rounded-full glass flex items-center justify-center hover:glow-purple transition">
            <User className="size-4 text-neon-purple" />
          </button>
        </nav>
      </div>
    </header>
  );
}
