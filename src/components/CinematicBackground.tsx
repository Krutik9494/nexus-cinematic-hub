import { useEffect, useRef } from "react";

/**
 * Cinematic background — "Theater of Light".
 *
 * Layers (back -> front):
 *  1. Deep matte black with cool radial wash
 *  2. Vertical translucent film strips drifting at different parallax speeds
 *  3. Soft horizontal "marquee" light bands at top & bottom
 *  4. A volumetric projector light cone sweeping diagonally
 *  5. Dust motes drifting inside the beam (canvas)
 *  6. Subtle film-grain + vignette
 *
 * Always-on cyber/cinema aesthetic; ignores light/dark toggles.
 */
export function CinematicBackground() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      style={{ background: "#050507" }}
    >
      {/* 1. Cool radial wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 900px at 80% 0%, rgba(0,80,120,0.35), transparent 60%), radial-gradient(1000px 800px at 10% 100%, rgba(70,10,110,0.32), transparent 60%), radial-gradient(700px 700px at 50% 50%, rgba(0,30,50,0.25), transparent 70%)",
        }}
      />

      {/* 2. Drifting film strips */}
      <FilmStrips />

      {/* 3. Marquee light bands */}
      <div
        className="absolute top-0 left-0 right-0 h-[120px] opacity-40"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,245,255,0.18), transparent)",
          maskImage:
            "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-[140px] opacity-35"
        style={{
          background:
            "linear-gradient(to top, rgba(176,38,255,0.22), transparent)",
          maskImage:
            "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
        }}
      />

      {/* 4. Projector light cone */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="projector-cone" />
        <div className="projector-cone-secondary" />
      </div>

      {/* 5. Dust motes inside the beam */}
      <DustCanvas />

      {/* 6. Grain + vignette */}
      <div
        className="absolute inset-0 mix-blend-overlay opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 3px)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 92%, rgba(0,0,0,0.9) 100%)",
        }}
      />

      <style>{`
        @keyframes strip-drift-up {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(0, -50%, 0); }
        }
        @keyframes strip-drift-down {
          from { transform: translate3d(0, -50%, 0); }
          to   { transform: translate3d(0, 0, 0); }
        }
        .strip-track {
          position: absolute;
          top: -10%;
          height: 220%;
          will-change: transform;
        }

        @keyframes cone-sweep {
          0%   { transform: translateX(-30%) translateY(-10%) rotate(22deg); opacity: 0.0; }
          15%  { opacity: 0.55; }
          50%  { opacity: 0.4; }
          85%  { opacity: 0.5; }
          100% { transform: translateX(60%) translateY(15%) rotate(22deg); opacity: 0.0; }
        }
        .projector-cone {
          position: absolute;
          top: -25%;
          left: -10%;
          width: 70%;
          height: 160%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(0,245,255,0.10) 25%,
            rgba(255,255,255,0.18) 50%,
            rgba(176,38,255,0.10) 75%,
            transparent 100%
          );
          filter: blur(40px);
          mix-blend-mode: screen;
          animation: cone-sweep 26s ease-in-out infinite;
        }
        .projector-cone-secondary {
          position: absolute;
          bottom: -25%;
          right: -10%;
          width: 55%;
          height: 140%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(176,38,255,0.14),
            rgba(0,245,255,0.10),
            transparent
          );
          filter: blur(50px);
          mix-blend-mode: screen;
          animation: cone-sweep 34s ease-in-out -12s infinite reverse;
        }

        @media (prefers-reduced-motion: reduce) {
          .strip-track,
          .projector-cone,
          .projector-cone-secondary { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

/* ---------- Film strips ---------- */

function FilmStrips() {
  // Each strip: left position (%), width (px), duration (s), direction, hue, opacity, delay
  const strips = [
    { left: "4%",  w: 70,  dur: 55, dir: "up",   color: "#00F5FF", op: 0.18, delay: 0 },
    { left: "18%", w: 56,  dur: 80, dir: "down", color: "#B026FF", op: 0.13, delay: -10 },
    { left: "32%", w: 90,  dur: 70, dir: "up",   color: "#00F5FF", op: 0.09, delay: -25 },
    { left: "50%", w: 60,  dur: 95, dir: "down", color: "#FFFFFF", op: 0.07, delay: -5 },
    { left: "64%", w: 80,  dur: 60, dir: "up",   color: "#B026FF", op: 0.16, delay: -18 },
    { left: "80%", w: 54,  dur: 85, dir: "down", color: "#00F5FF", op: 0.12, delay: -32 },
    { left: "92%", w: 64,  dur: 65, dir: "up",   color: "#B026FF", op: 0.10, delay: -8 },
  ];

  return (
    <div className="absolute inset-0">
      {strips.map((s, i) => (
        <div
          key={i}
          className="strip-track"
          style={{
            left: s.left,
            width: s.w,
            opacity: s.op,
            animation: `${s.dir === "up" ? "strip-drift-up" : "strip-drift-down"} ${s.dur}s linear infinite`,
            animationDelay: `${s.delay}s`,
            filter: `drop-shadow(0 0 8px ${s.color}88)`,
          }}
        >
          <FilmStrip color={s.color} />
          <FilmStrip color={s.color} />
        </div>
      ))}
    </div>
  );
}

/**
 * Single film strip: vertical band with perforations down both edges
 * and faint frame divisions. Pure SVG — crisp at any size, two stacked
 * for seamless looping.
 */
function FilmStrip({ color }: { color: string }) {
  // Build perforation rects
  const perfs = [];
  for (let y = 4; y < 100; y += 6) {
    perfs.push(
      <rect key={`l${y}`} x={1.5} y={`${y}%`} width={3.5} height={3} rx={0.6} />,
      <rect key={`r${y}`} x={"calc(100% - 5)" as any} y={`${y}%`} width={3.5} height={3} rx={0.6} />,
    );
  }

  // Frame dividers
  const frames = [];
  for (let i = 1; i < 18; i++) {
    frames.push(
      <line
        key={`f${i}`}
        x1={6}
        x2={"calc(100% - 6)" as any}
        y1={`${(i / 18) * 100}%`}
        y2={`${(i / 18) * 100}%`}
        stroke={color}
        strokeOpacity={0.35}
        strokeWidth={0.6}
      />
    );
  }

  return (
    <svg
      width="100%"
      height="50%"
      viewBox="0 0 60 600"
      preserveAspectRatio="none"
      className="block"
    >
      {/* strip body */}
      <rect
        x={0}
        y={0}
        width={60}
        height={600}
        fill={color}
        fillOpacity={0.05}
        stroke={color}
        strokeOpacity={0.4}
        strokeWidth={0.8}
      />
      {/* edge rails */}
      <rect x={6} y={0} width={0.6} height={600} fill={color} fillOpacity={0.5} />
      <rect x={53.4} y={0} width={0.6} height={600} fill={color} fillOpacity={0.5} />

      {/* perforations along both edges */}
      <g fill={color} fillOpacity={0.55}>
        {Array.from({ length: 30 }).map((_, i) => (
          <g key={i}>
            <rect x={1.5} y={i * 20 + 4} width={3} height={10} rx={1} />
            <rect x={55.5} y={i * 20 + 4} width={3} height={10} rx={1} />
          </g>
        ))}
      </g>

      {/* frame dividers */}
      <g stroke={color} strokeOpacity={0.35} strokeWidth={0.5}>
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1={8} x2={52} y1={i * 50 + 50} y2={i * 50 + 50} />
        ))}
      </g>

      {/* faint inner frame fills (suggest film cells) */}
      <g fill={color} fillOpacity={0.04}>
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x={9} y={i * 50 + 2} width={42} height={46} />
        ))}
      </g>
    </svg>
  );
}

/* ---------- Dust motes canvas ---------- */

function DustCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0;
    type Mote = { x: number; y: number; vx: number; vy: number; r: number; a: number; pa: number };
    let motes: Mote[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const init = () => {
      const count = Math.min(70, Math.floor((w * h) / 22000));
      motes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -Math.random() * 0.25 - 0.05,
        r: Math.random() * 1.4 + 0.3,
        a: Math.random() * 0.6 + 0.2,
        pa: Math.random() * Math.PI * 2,
      }));
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        m.x += m.vx;
        m.y += m.vy;
        m.pa += 0.03;
        if (m.y < -5) { m.y = h + 5; m.x = Math.random() * w; }
        if (m.x < -5) m.x = w + 5;
        if (m.x > w + 5) m.x = -5;

        const flicker = 0.6 + Math.sin(m.pa) * 0.4;
        const alpha = m.a * flicker;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 240, 255, ${alpha * 0.7})`;
        ctx.shadowColor = "rgba(0, 245, 255, 0.8)";
        ctx.shadowBlur = 6;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
      void t;
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
      style={{ opacity: 0.55 }}
    />
  );
}
