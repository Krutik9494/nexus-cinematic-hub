import { useEffect, useState } from "react";

const KEY = "nexus_guest_mode";
const EVENT = "nexus:guest-changed";

export function isGuest(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function enterGuest() {
  localStorage.setItem(KEY, "1");
  window.dispatchEvent(new Event(EVENT));
}

export function exitGuest() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function useGuest(): boolean {
  const [guest, setGuest] = useState<boolean>(() => isGuest());
  useEffect(() => {
    const update = () => setGuest(isGuest());
    window.addEventListener(EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);
  return guest;
}
