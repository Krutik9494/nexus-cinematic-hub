import { useSyncExternalStore } from "react";

export type WatchlistItem = {
  id: string;
  addedAt: number;
  rating: number;
  favorite?: boolean;
  watched?: boolean;
};

const KEY = "nexus_watchlist";

const read = (): WatchlistItem[] => {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
};

const listeners = new Set<() => void>();
let cache: WatchlistItem[] = read();

const emit = () => {
  cache = read();
  listeners.forEach((l) => l());
};

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
};

const write = (items: WatchlistItem[]) => {
  localStorage.setItem(KEY, JSON.stringify(items));
  emit();
};

export const watchlist = {
  add(id: string) {
    const items = read();
    if (items.find((i) => i.id === id)) return;
    write([...items, { id, addedAt: Date.now(), rating: 0 }]);
  },
  remove(id: string) { write(read().filter((i) => i.id !== id)); },
  rate(id: string, rating: number) {
    write(read().map((i) => (i.id === id ? { ...i, rating } : i)));
  },
  toggleFavorite(id: string) {
    const items = read();
    const exists = items.find((i) => i.id === id);
    if (!exists) {
      write([...items, { id, addedAt: Date.now(), rating: 0, favorite: true }]);
    } else {
      write(items.map((i) => (i.id === id ? { ...i, favorite: !i.favorite } : i)));
    }
  },
  toggleWatched(id: string) {
    const items = read();
    const exists = items.find((i) => i.id === id);
    if (!exists) {
      write([...items, { id, addedAt: Date.now(), rating: 0, watched: true }]);
    } else {
      write(items.map((i) => (i.id === id ? { ...i, watched: !i.watched } : i)));
    }
  },
  reorder(ids: string[]) {
    const items = read();
    const map = new Map(items.map((i) => [i.id, i]));
    const ordered = ids.map((id) => map.get(id)).filter(Boolean) as WatchlistItem[];
    write(ordered);
  },
  has(id: string) { return !!read().find((i) => i.id === id); },
};

export const useWatchlist = () =>
  useSyncExternalStore(subscribe, () => cache, () => [] as WatchlistItem[]);
