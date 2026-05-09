import { useEffect, useRef, useState } from "react";
import cine1 from "@/assets/cine-1.jpg";
import cine2 from "@/assets/cine-2.jpg";
import cine3 from "@/assets/cine-3.jpg";
import cine4 from "@/assets/cine-4.jpg";
import cine5 from "@/assets/cine-5.jpg";

/**
 * Cinematic background — animated movie-scene collage.
 *
 * - Cross-fades between blockbuster-style cinematic stills
 * - Slow Ken Burns pan + zoom on each scene
 * - Mouse parallax (subtle)
 * - Floating embers / dust (canvas)
 * - Heavy dark gradient + vignette so UI remains readable
 * - Always-on cyber/cinema aesthetic; ignores light/dark toggles
 */

const SCENES = [cine1, cine2, cine3, cine4, cine5];
const SCENE_DURATION = 14000; // ms per scene

export function CinematicBackground() {
  const [index, setIndex] = useState(0);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  // Cycle scenes
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SCENES.length);
    }, SCENE_DURATION);
    return () => clearInterval(id);
  }, []);

  // Subtle mouse parallax
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2; // -1..1
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setParallax({ x, y });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      style={{ background: "var(--background)" }}
    >
      {/* Scene layers (cross-fade + Ken Burns) */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate3d(${parallax.x * -10}px, ${parallax.y * -10}px, 0)`,
          transition: "transform 600ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {SCENES.map((src, i) => {
          const active = i === index;
          return (
            <div
              key={src}
              className="absolute inset-0"
              style={{
                opacity: active ? 1 : 0,
                transition: "opacity 2200ms ease-in-out",
              }}
            >
              <div
                className="absolute -inset-[6%] bg-center bg-cover"
                style={{
                  backgroundImage: `url(${src})`,
                  animation: active
                    ? `ken-burns-${i % 4} ${SCENE_DURATION + 4000}ms ease-in-out forwards`
                    : "none",
                  filter: "saturate(1.05) contrast(1.05)",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Cinematic color grade — cyan/purple wash */}
      <div
        className="absolute inset-0 mix-blend-color opacity-40"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,80,140,0.6), rgba(70,10,110,0.5))",
        }}
      />

      {/* Heavy dark gradient + vignette for readability */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(5,5,7,0.55) 0%, rgba(5,5,7,0.78) 55%, rgba(5,5,7,0.95) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(5,5,7,0.85) 0%, rgba(5,5,7,0.35) 25%, rgba(5,5,7,0.45) 70%, rgba(5,5,7,0.95) 100%)",
        }}
      />

      {/* Soft scanlines */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.6) 0 1px, transparent 1px 3px)",
          mixBlendMode: "overlay",
        }}
      />

      {/* Lens flare highlights */}
      <div
        className="absolute -top-32 -left-32 size-[520px] rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(0,245,255,0.55), transparent 60%)",
          filter: "blur(40px)",
          mixBlendMode: "screen",
          animation: "flare-drift-a 22s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -bottom-40 -right-32 size-[620px] rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(176,38,255,0.55), transparent 60%)",
          filter: "blur(50px)",
          mixBlendMode: "screen",
          animation: "flare-drift-b 28s ease-in-out infinite",
        }}
      />

      {/* Floating embers / film dust */}
      <Embers />

      {/* Film grain */}
      <div
        className="absolute inset-0 opacity-[0.08] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "3px 3px, 5px 5px",
          backgroundPosition: "0 0, 1px 2px",
        }}
      />

      <style>{`
        @keyframes ken-burns-0 {
          0%   { transform: scale(1.05) translate3d(0, 0, 0); }
          100% { transform: scale(1.18) translate3d(-2%, -1.5%, 0); }
        }
        @keyframes ken-burns-1 {
          0%   { transform: scale(1.08) translate3d(-1%, 1%, 0); }
          100% { transform: scale(1.20) translate3d(2%, -1%, 0); }
        }
        @keyframes ken-burns-2 {
          0%   { transform: scale(1.10) translate3d(1%, -1%, 0); }
          100% { transform: scale(1.22) translate3d(-2%, 1.5%, 0); }
        }
        @keyframes ken-burns-3 {
          0%   { transform: scale(1.06) translate3d(0, 1%, 0); }
          100% { transform: scale(1.18) translate3d(2%, -1.5%, 0); }
        }
        @keyframes flare-drift-a {
          0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.28; }
          50%      { transform: translate3d(40px, 30px, 0); opacity: 0.42; }
        }
        @keyframes flare-drift-b {
          0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.26; }
          50%      { transform: translate3d(-40px, -30px, 0); opacity: 0.4; }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="ken-burns"], [style*="flare-drift"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

/* Floating cinematic embers + dust motes */
function Embers() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0;
    type P = { x: number; y: number; vx: number; vy: number; r: number; a: number; pa: number; ember: boolean };
    let parts: P[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const init = () => {
      const count = Math.min(90, Math.floor((w * h) / 18000));
      parts = Array.from({ length: count }, () => {
        const ember = Math.random() < 0.35;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.2,
          vy: -Math.random() * (ember ? 0.5 : 0.18) - 0.05,
          r: ember ? Math.random() * 1.6 + 0.6 : Math.random() * 1.1 + 0.3,
          a: Math.random() * 0.6 + 0.25,
          pa: Math.random() * Math.PI * 2,
          ember,
        };
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy;
        p.pa += 0.04;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        const flicker = 0.55 + Math.sin(p.pa) * 0.45;
        const alpha = p.a * flicker;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        if (p.ember) {
          ctx.fillStyle = `rgba(255, 170, 90, ${alpha})`;
          ctx.shadowColor = "rgba(255, 120, 40, 0.9)";
          ctx.shadowBlur = 10;
        } else {
          ctx.fillStyle = `rgba(220, 240, 255, ${alpha * 0.7})`;
          ctx.shadowColor = "rgba(0, 245, 255, 0.7)";
          ctx.shadowBlur = 6;
        }
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    resize(); init(); raf = requestAnimationFrame(draw);
    const onResize = () => { resize(); init(); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 size-full pointer-events-none"
      style={{ opacity: 0.7 }}
    />
  );
}
