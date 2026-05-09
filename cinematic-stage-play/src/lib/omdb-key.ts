import { useEffect, useState } from "react";

export const OMDB_KEY_STORAGE = "nexus_omdb_key";
const EVENT = "nexus:omdb-key-changed";

export function getOmdbKey(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return localStorage.getItem(OMDB_KEY_STORAGE) || undefined;
  } catch {
    return undefined;
  }
}

export function setOmdbKey(key: string) {
  localStorage.setItem(OMDB_KEY_STORAGE, key);
  window.dispatchEvent(new Event(EVENT));
}

export function clearOmdbKey() {
  localStorage.removeItem(OMDB_KEY_STORAGE);
  window.dispatchEvent(new Event(EVENT));
}

export function useOmdbKey(): string | undefined {
  const [key, setKey] = useState<string | undefined>(() => getOmdbKey());
  useEffect(() => {
    const update = () => setKey(getOmdbKey());
    window.addEventListener(EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);
  return key;
}
