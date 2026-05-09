import { useEffect, useRef, useState } from "react";
import blackhole from "@/assets/scene-blackhole.mp4.asset.json";
import explosion from "@/assets/scene-explosion.mp4.asset.json";
import hero from "@/assets/scene-hero.mp4.asset.json";
import battle from "@/assets/scene-battle.mp4.asset.json";
import city from "@/assets/scene-city.mp4.asset.json";

/**
 * Queue of 5 cinematic clips that auto-advance with smooth crossfade
 * transitions in the hero section background.
 */
const CLIPS = [blackhole.url, explosion.url, hero.url, battle.url, city.url];
const CLIP_DURATION = 8500; // ms per clip before crossfading to next
const FADE_MS = 1400;

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

  // Restart the active clip from 0 whenever it becomes active so each
  // segment plays from the beginning.
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
