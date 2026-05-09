import { useEffect, useState } from "react";

export const TMDB_KEY_STORAGE = "nexus_tmdb_key";
const EVENT = "nexus:tmdb-key-changed";

export function getTmdbKey(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return localStorage.getItem(TMDB_KEY_STORAGE) || undefined;
  } catch {
    return undefined;
  }
}

export function setTmdbKey(key: string) {
  localStorage.setItem(TMDB_KEY_STORAGE, key);
  window.dispatchEvent(new Event(EVENT));
}

export function clearTmdbKey() {
  localStorage.removeItem(TMDB_KEY_STORAGE);
  window.dispatchEvent(new Event(EVENT));
}

export function useTmdbKey(): string | undefined {
  const [key, setKey] = useState<string | undefined>(() => getTmdbKey());
  useEffect(() => {
    const update = () => setKey(getTmdbKey());
    window.addEventListener(EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);
  return key;
}
