import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import bgMusic from "@/assets/bg-music.mp3";

const KEY = "nexus_music_on";

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const a = new Audio(bgMusic);
    a.loop = true;
    a.volume = 0.35;
    audioRef.current = a;

    const wantOn = (() => { try { return localStorage.getItem(KEY) === "1"; } catch { return false; } })();
    if (wantOn) {
      // Try autoplay; will fail without user gesture, then we wait for one.
      a.play().then(() => setPlaying(true)).catch(() => {
        const resume = () => {
          a.play().then(() => setPlaying(true)).catch(() => {});
          window.removeEventListener("pointerdown", resume);
          window.removeEventListener("keydown", resume);
        };
        window.addEventListener("pointerdown", resume, { once: true });
        window.addEventListener("keydown", resume, { once: true });
      });
    }
    return () => { a.pause(); audioRef.current = null; };
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
      try { localStorage.setItem(KEY, "0"); } catch {}
    } else {
      a.play().then(() => {
        setPlaying(true);
        try { localStorage.setItem(KEY, "1"); } catch {}
      }).catch(() => {});
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={playing ? "Mute background music" : "Play background music"}
      title={playing ? "Mute cinematic score" : "Play cinematic score"}
      className="size-9 rounded-full glass flex items-center justify-center hover:glow-cyan transition"
      style={playing ? { boxShadow: "var(--shadow-glow-cyan)" } : undefined}
    >
      {playing
        ? <Volume2 className="size-4 text-cyan" />
        : <VolumeX className="size-4 text-muted-foreground" />}
    </button>
  );
}
