import { ParticleField } from "./ParticleField";

/**
 * Full-screen fixed cinematic background.
 * Layers (back -> front):
 *  1. Deep space radial gradients
 *  2. Perspective neon grid (drifting)
 *  3. Floating holographic film elements (reels, frames, clapperboards)
 *  4. Particle field (canvas)
 *  5. Sweeping projector light beam
 *  6. Scanlines + vignette overlay
 */
export function CinematicBackground() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      style={{ background: "#050507" }}
    >
      {/* 1. Radial space gradients */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 800px at 15% 20%, rgba(20,30,80,0.45), transparent 60%), radial-gradient(900px 700px at 85% 80%, rgba(60,15,90,0.35), transparent 60%), radial-gradient(700px 600px at 50% 50%, rgba(0,40,80,0.25), transparent 70%)",
        }}
      />

      {/* 2. Perspective neon grid */}
      <div
        className="absolute inset-0 flex items-end justify-center"
        style={{ perspective: "900px" }}
      >
        <div
          className="cinematic-grid"
          style={{
            width: "260%",
            height: "180%",
            transform: "rotateX(62deg) translateY(8%)",
            transformOrigin: "center center",
            backgroundImage:
              "linear-gradient(to right, rgba(0,245,255,0.28) 1px, transparent 1px), linear-gradient(to bottom, rgba(176,38,255,0.24) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            opacity: 0.45,
            maskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />
      </div>

      {/* Mirror grid on top half (subtle) */}
      <div
        className="absolute inset-0 flex items-start justify-center"
        style={{ perspective: "900px" }}
      >
        <div
          className="cinematic-grid-rev"
          style={{
            width: "260%",
            height: "180%",
            transform: "rotateX(-62deg) translateY(-8%)",
            transformOrigin: "center center",
            backgroundImage:
              "linear-gradient(to right, rgba(0,245,255,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(176,38,255,0.16) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            opacity: 0.3,
            maskImage:
              "radial-gradient(ellipse at center, black 25%, transparent 70%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 25%, transparent 70%)",
          }}
        />
      </div>

      {/* 3. Floating holographic film elements */}
      <FloatingHolograms />

      {/* 4. Particle field */}
      <div className="absolute inset-0">
        <ParticleField />
      </div>

      {/* 5. Sweeping projector light beam */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="projector-beam" />
        <div className="projector-beam projector-beam-2" />
      </div>

      {/* 6. Scanlines */}
      <div
        className="absolute inset-0 mix-blend-overlay opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.6) 0px, rgba(255,255,255,0.6) 1px, transparent 1px, transparent 3px)",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 95%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      {/* Local styles */}
      <style>{`
        @keyframes grid-drift {
          0%   { background-position: 0 0, 0 0; }
          100% { background-position: 80px 80px, 80px 80px; }
        }
        .cinematic-grid {
          animation: grid-drift 14s linear infinite;
          filter: drop-shadow(0 0 8px rgba(0,245,255,0.35));
        }
        .cinematic-grid-rev {
          animation: grid-drift 22s linear infinite reverse;
          filter: drop-shadow(0 0 6px rgba(176,38,255,0.3));
        }

        @keyframes holo-float {
          0%   { transform: translate3d(0,0,0) rotate(var(--r,0deg)); opacity: 0; }
          15%  { opacity: var(--o,0.18); }
          85%  { opacity: var(--o,0.18); }
          100% { transform: translate3d(var(--dx,40px), var(--dy,-60px), 0) rotate(calc(var(--r,0deg) + var(--rd,20deg))); opacity: 0; }
        }
        .holo {
          position: absolute;
          will-change: transform, opacity;
          animation: holo-float var(--dur,28s) ease-in-out infinite;
          animation-delay: var(--delay,0s);
        }

        @keyframes beam-sweep {
          0%   { transform: translateX(-40%) rotate(18deg); opacity: 0; }
          10%  { opacity: 0.55; }
          50%  { opacity: 0.35; }
          90%  { opacity: 0.45; }
          100% { transform: translateX(140%) rotate(18deg); opacity: 0; }
        }
        .projector-beam {
          position: absolute;
          top: -30%;
          left: 0;
          width: 35%;
          height: 160%;
          background: linear-gradient(90deg, transparent, rgba(0,245,255,0.18), rgba(255,255,255,0.08), rgba(176,38,255,0.14), transparent);
          filter: blur(30px);
          animation: beam-sweep 18s ease-in-out infinite;
          mix-blend-mode: screen;
        }
        .projector-beam-2 {
          animation-duration: 24s;
          animation-delay: 9s;
          background: linear-gradient(90deg, transparent, rgba(176,38,255,0.18), rgba(0,245,255,0.12), transparent);
          width: 28%;
        }

        @media (prefers-reduced-motion: reduce) {
          .cinematic-grid, .cinematic-grid-rev,
          .holo, .projector-beam { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

/* --- Floating holographic SVG elements --- */
function FloatingHolograms() {
  const items = [
    { type: "reel", top: "12%", left: "8%", size: 110, dur: 32, delay: 0, dx: 60, dy: -40, r: 0, rd: 90, o: 0.18, color: "#00F5FF" },
    { type: "frame", top: "70%", left: "12%", size: 140, dur: 36, delay: 6, dx: -40, dy: -70, r: -8, rd: 12, o: 0.12, color: "#B026FF" },
    { type: "clap", top: "20%", left: "78%", size: 120, dur: 30, delay: 3, dx: -50, dy: 60, r: 12, rd: -20, o: 0.14, color: "#00F5FF" },
    { type: "reel", top: "65%", left: "82%", size: 90, dur: 28, delay: 10, dx: 30, dy: -50, r: 0, rd: -120, o: 0.15, color: "#B026FF" },
    { type: "frame", top: "40%", left: "45%", size: 170, dur: 40, delay: 14, dx: 20, dy: 30, r: 4, rd: 8, o: 0.08, color: "#00F5FF" },
    { type: "reel", top: "85%", left: "55%", size: 70, dur: 26, delay: 2, dx: -20, dy: -60, r: 0, rd: 180, o: 0.16, color: "#B026FF" },
    { type: "clap", top: "8%", left: "40%", size: 90, dur: 34, delay: 12, dx: 30, dy: 40, r: -10, rd: 18, o: 0.12, color: "#00F5FF" },
  ];

  return (
    <div className="absolute inset-0">
      {items.map((it, i) => (
        <div
          key={i}
          className="holo"
          style={
            {
              top: it.top,
              left: it.left,
              width: it.size,
              height: it.size,
              ["--dur" as any]: `${it.dur}s`,
              ["--delay" as any]: `${it.delay}s`,
              ["--dx" as any]: `${it.dx}px`,
              ["--dy" as any]: `${it.dy}px`,
              ["--r" as any]: `${it.r}deg`,
              ["--rd" as any]: `${it.rd}deg`,
              ["--o" as any]: it.o,
              filter: `drop-shadow(0 0 12px ${it.color}) drop-shadow(0 0 24px ${it.color}88)`,
            } as React.CSSProperties
          }
        >
          {it.type === "reel" && <ReelSvg color={it.color} />}
          {it.type === "frame" && <FrameSvg color={it.color} />}
          {it.type === "clap" && <ClapSvg color={it.color} />}
        </div>
      ))}
    </div>
  );
}

function ReelSvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <g fill="none" stroke={color} strokeWidth="1.2">
        <circle cx="50" cy="50" r="46" />
        <circle cx="50" cy="50" r="36" />
        <circle cx="50" cy="50" r="6" />
        <circle cx="50" cy="20" r="6" />
        <circle cx="50" cy="80" r="6" />
        <circle cx="20" cy="50" r="6" />
        <circle cx="80" cy="50" r="6" />
        <circle cx="29" cy="29" r="5" />
        <circle cx="71" cy="29" r="5" />
        <circle cx="29" cy="71" r="5" />
        <circle cx="71" cy="71" r="5" />
      </g>
    </svg>
  );
}

function FrameSvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 160 100" className="w-full h-full">
      <g fill="none" stroke={color} strokeWidth="1.2">
        <rect x="2" y="2" width="156" height="96" rx="4" />
        <rect x="10" y="10" width="140" height="80" rx="2" opacity="0.5" />
        {/* film perforations */}
        {[10, 30, 50, 70, 90, 110, 130].map((x) => (
          <rect key={`t${x}`} x={x} y="-2" width="14" height="6" />
        ))}
        {[10, 30, 50, 70, 90, 110, 130].map((x) => (
          <rect key={`b${x}`} x={x} y="96" width="14" height="6" />
        ))}
      </g>
    </svg>
  );
}

function ClapSvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <g fill="none" stroke={color} strokeWidth="1.2">
        <rect x="6" y="40" width="88" height="54" rx="3" />
        <path d="M6 30 L94 22 L96 38 L8 46 Z" />
        <path d="M14 28 L24 42 M34 25 L44 39 M54 22 L64 36 M74 19 L84 33" />
      </g>
    </svg>
  );
}
