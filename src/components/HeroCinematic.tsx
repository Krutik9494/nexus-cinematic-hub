import { useEffect, useRef, useState } from "react";
import blackhole from "@/assets/clip-blackhole.mp4";
import battle from "@/assets/clip-battle.mp4";
import battlesDemo from "@/assets/clip-battles-demo.mp4";
import flyingCars from "@/assets/clip-flying-cars.mp4";
import movieDemo from "@/assets/clip-movie-demo.mp4";

/**
 * Looping cinematic background built from user-supplied clips.
 * Each clip plays for ~8.5s, then crossfades to the next, looping forever.
 */
const CLIPS = [blackhole, battle, flyingCars, battlesDemo, movieDemo];
const CLIP_DURATION = 8500;
const FADE_MS = 1200;

export function HeroCinematic() {
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);
  const refs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % CLIPS.length);
    }, CLIP_DURATION);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const v = refs.current[active];
    if (v) {
      try {
        v.currentTime = 0;
        void v.play();
      } catch {
        /* ignore */
      }
    }
  }, [active]);

  if (!mounted) {
    return <div className="absolute inset-0 overflow-hidden bg-background" />;
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {CLIPS.map((src, i) => (
        <video
          key={src}
          ref={(el) => {
            refs.current[i] = el;
          }}
          src={src}
          autoPlay={i === 0}
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 size-full object-cover"
          style={{
            opacity: i === active ? 1 : 0,
            transition: `opacity ${FADE_MS}ms ease-in-out`,
          }}
        />
      ))}
    </div>
  );
}
