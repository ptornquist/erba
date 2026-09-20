import type { PlateId } from "@/lib/types";

const PALETTES: Record<PlateId, { sky: string; earth: string; accent: string; ink: string }> = {
  "pitch-night": { sky: "#1a2744", earth: "#1e4d32", accent: "#c9a227", ink: "#0b1220" },
  "olympic-track": { sky: "#c56a3a", earth: "#8a3b2a", accent: "#f2d38a", ink: "#2a140c" },
  "ice-rink": { sky: "#1c2c44", earth: "#d7e4ef", accent: "#b4222a", ink: "#152033" },
  "boxing-ring": { sky: "#3a1d18", earth: "#6b2a22", accent: "#d4b35a", ink: "#140c0a" },
  "lawn-tennis": { sky: "#87a45c", earth: "#3f6b3a", accent: "#f3efe2", ink: "#1d2a16" },
  hardwood: { sky: "#4a2614", earth: "#c9843e", accent: "#efd7a3", ink: "#24140c" },
  "rugby-turf": { sky: "#245c46", earth: "#1b3d2e", accent: "#e8d5a3", ink: "#0e1f18" },
  velodrome: { sky: "#35506b", earth: "#c4b8a4", accent: "#d3553a", ink: "#182230" },
};

export function ArchivePlate({ plateId }: { plateId: PlateId }) {
  const palette = PALETTES[plateId];
  return (
    <svg viewBox="0 0 800 500" className="h-full w-full" aria-hidden="true">
      <defs>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>
      <rect width="800" height="500" fill={palette.sky} />
      <rect width="800" height="500" filter="url(#grain)" opacity="0.12" />

      {plateId === "pitch-night" && <Pitch palette={palette} />}
      {plateId === "olympic-track" && <Track palette={palette} />}
      {plateId === "ice-rink" && <Rink palette={palette} />}
      {plateId === "boxing-ring" && <Ring palette={palette} />}
      {plateId === "lawn-tennis" && <Tennis palette={palette} />}
      {plateId === "hardwood" && <Court palette={palette} />}
      {plateId === "rugby-turf" && <Rugby palette={palette} />}
      {plateId === "velodrome" && <Track palette={palette} />}

      <rect width="800" height="500" fill="none" stroke={palette.accent} strokeWidth="18" opacity="0.35" />
    </svg>
  );
}

function Pitch({ palette }: { palette: (typeof PALETTES)[PlateId] }) {
  return (
    <g>
      <ellipse cx="400" cy="430" rx="420" ry="140" fill={palette.earth} />
      <rect x="80" y="220" width="640" height="250" rx="8" fill={palette.earth} />
      <g fill="none" stroke="#e8f0e4" strokeWidth="3" opacity="0.7">
        <rect x="110" y="240" width="580" height="210" />
        <line x1="400" y1="240" x2="400" y2="450" />
        <circle cx="400" cy="345" r="48" />
        <rect x="110" y="292" width="90" height="110" />
        <rect x="600" y="292" width="90" height="110" />
      </g>
      <circle cx="160" cy="90" r="36" fill={palette.accent} opacity="0.8" />
      <polygon points="250,80 270,140 310,90 290,160 330,120" fill="#f4e6c8" opacity="0.25" />
      <circle cx="620" cy="70" r="8" fill="#f4e6c8" />
      <circle cx="640" cy="88" r="5" fill="#f4e6c8" />
      <circle cx="605" cy="95" r="4" fill="#f4e6c8" />
    </g>
  );
}

function Track({ palette }: { palette: (typeof PALETTES)[PlateId] }) {
  return (
    <g>
      <ellipse cx="400" cy="310" rx="310" ry="160" fill={palette.earth} />
      <ellipse cx="400" cy="310" rx="230" ry="110" fill={palette.sky} opacity="0.35" />
      <ellipse cx="400" cy="310" rx="180" ry="80" fill="#2c1810" opacity="0.35" />
      <g stroke={palette.accent} strokeWidth="3" fill="none" opacity="0.55">
        <ellipse cx="400" cy="310" rx="300" ry="150" />
        <ellipse cx="400" cy="310" rx="270" ry="132" />
        <ellipse cx="400" cy="310" rx="240" ry="114" />
      </g>
      <rect x="120" y="40" width="18" height="90" fill="#f4e6c8" />
      <rect x="160" y="55" width="18" height="75" fill="#f4e6c8" opacity="0.7" />
      <rect x="200" y="30" width="18" height="100" fill="#f4e6c8" opacity="0.85" />
      <path d="M480 390 C 520 350, 590 340, 640 300" stroke="#f4e6c8" strokeWidth="6" fill="none" />
    </g>
  );
}

function Rink({ palette }: { palette: (typeof PALETTES)[PlateId] }) {
  return (
    <g>
      <rect x="70" y="80" width="660" height="360" rx="120" fill={palette.earth} />
      <rect x="110" y="120" width="580" height="280" rx="100" fill="#f7fbff" />
      <ellipse cx="400" cy="260" rx="70" ry="70" fill="none" stroke={palette.accent} strokeWidth="8" />
      <line x1="400" y1="120" x2="400" y2="400" stroke="#b4222a" strokeWidth="6" />
      <rect x="110" y="210" width="70" height="100" fill="none" stroke="#355a8a" strokeWidth="6" />
      <rect x="620" y="210" width="70" height="100" fill="none" stroke="#355a8a" strokeWidth="6" />
      <circle cx="250" cy="180" r="10" fill="#1c2c44" opacity="0.45" />
      <circle cx="560" cy="320" r="12" fill="#b4222a" opacity="0.5" />
    </g>
  );
}

function Ring({ palette }: { palette: (typeof PALETTES)[PlateId] }) {
  return (
    <g>
      <polygon points="140,430 660,430 600,160 200,160" fill={palette.earth} />
      <polygon points="200,160 600,160 560,80 240,80" fill="#5c241c" />
      <g stroke={palette.accent} strokeWidth="10" fill="none">
        <line x1="220" y1="170" x2="180" y2="410" />
        <line x1="580" y1="170" x2="620" y2="410" />
        <line x1="230" y1="230" x2="570" y2="230" />
        <line x1="210" y1="300" x2="590" y2="300" />
        <line x1="195" y1="360" x2="605" y2="360" />
      </g>
      <circle cx="400" cy="70" r="28" fill={palette.accent} />
    </g>
  );
}

function Tennis({ palette }: { palette: (typeof PALETTES)[PlateId] }) {
  return (
    <g>
      <rect x="0" y="220" width="800" height="280" fill={palette.earth} />
      <rect x="180" y="80" width="440" height="360" fill="#3f7a45" />
      <g stroke="#f3efe2" strokeWidth="4" fill="none">
        <rect x="200" y="100" width="400" height="320" />
        <line x1="400" y1="100" x2="400" y2="420" />
        <line x1="200" y1="260" x2="600" y2="260" />
        <rect x="270" y="160" width="260" height="200" />
      </g>
      <line x1="400" y1="100" x2="400" y2="420" stroke="#f3efe2" strokeWidth="10" opacity="0.4" />
      <circle cx="455" cy="210" r="9" fill="#f4e6c8" />
    </g>
  );
}

function Court({ palette }: { palette: (typeof PALETTES)[PlateId] }) {
  return (
    <g>
      <rect x="80" y="60" width="640" height="380" fill={palette.earth} />
      <g stroke={palette.accent} strokeWidth="5" fill="none">
        <rect x="110" y="90" width="580" height="320" />
        <line x1="400" y1="90" x2="400" y2="410" />
        <circle cx="400" cy="250" r="55" />
        <path d="M110 170 A 90 90 0 0 1 110 330" />
        <path d="M690 170 A 90 90 0 0 0 690 330" />
      </g>
      <circle cx="250" cy="200" r="14" fill="#2a150c" opacity="0.45" />
      <circle cx="520" cy="300" r="16" fill="#2a150c" opacity="0.35" />
    </g>
  );
}

function Rugby({ palette }: { palette: (typeof PALETTES)[PlateId] }) {
  return (
    <g>
      <rect x="60" y="140" width="680" height="300" fill={palette.earth} />
      <g stroke={palette.accent} strokeWidth="3" fill="none" opacity="0.8">
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={90 + i * 77} y1="150" x2={90 + i * 77} y2="430" />
        ))}
      </g>
      <rect x="70" y="240" width="18" height="90" fill="#e8d5a3" />
      <rect x="712" y="240" width="18" height="90" fill="#e8d5a3" />
      <ellipse cx="400" cy="300" rx="22" ry="14" fill="#e8d5a3" />
    </g>
  );
}
