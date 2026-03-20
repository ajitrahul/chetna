/**
 * CosmicMandala — A decorative SVG mandala for Vedic aesthetic pages.
 * Use as a background watermark or hero decoration.
 */
export default function CosmicMandala({
  size = 400,
  opacity = 0.12,
  className = '',
  animate = false,
}: {
  size?: number;
  opacity?: number;
  className?: string;
  animate?: boolean;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity, pointerEvents: 'none', userSelect: 'none' }}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="mandalaGold" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="1" />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={r * 0.95} fill="none" stroke="#D4AF37" strokeWidth="0.5" />
      <circle cx={cx} cy={cy} r={r * 0.9} fill="none" stroke="#D4AF37" strokeWidth="0.3" />

      {/* 12-pointed star (zodiac wheel outer) */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const x1 = cx + r * 0.9 * Math.cos(angle);
        const y1 = cy + r * 0.9 * Math.sin(angle);
        const x2 = cx + r * 0.5 * Math.cos(angle);
        const y2 = cy + r * 0.5 * Math.sin(angle);
        return (
          <line
            key={`spoke-${i}`}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#D4AF37" strokeWidth="0.5" opacity="0.7"
          />
        );
      })}

      {/* 12 house divisions */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const midAngle = ((i * 30 + 15) * Math.PI) / 180;
        const px = cx + r * 0.72 * Math.cos(midAngle);
        const py = cy + r * 0.72 * Math.sin(midAngle);
        return (
          <circle key={`dot-${i}`} cx={px} cy={py} r="1.5" fill="#D4AF37" opacity="0.6" />
        );
      })}

      {/* Inner rings */}
      <circle cx={cx} cy={cy} r={r * 0.6} fill="none" stroke="#D4AF37" strokeWidth="0.4" />
      <circle cx={cx} cy={cy} r={r * 0.4} fill="none" stroke="#D4AF37" strokeWidth="0.3" />
      <circle cx={cx} cy={cy} r={r * 0.2} fill="none" stroke="#D4AF37" strokeWidth="0.5" />

      {/* 6-pointed inner star (Shatkona / Star of Consciousness) */}
      {[0, 60, 120].map((deg) => {
        const a1 = (deg * Math.PI) / 180;
        const a2 = ((deg + 120) * Math.PI) / 180;
        const a3 = ((deg + 240) * Math.PI) / 180;
        const rr = r * 0.38;
        return (
          <polygon
            key={`triangle-${deg}`}
            points={[
              `${cx + rr * Math.cos(a1)},${cy + rr * Math.sin(a1)}`,
              `${cx + rr * Math.cos(a2)},${cy + rr * Math.sin(a2)}`,
              `${cx + rr * Math.cos(a3)},${cy + rr * Math.sin(a3)}`,
            ].join(' ')}
            fill="none"
            stroke="#D4AF37"
            strokeWidth="0.6"
            opacity="0.8"
          />
        );
      })}

      {/* Center lotus dot */}
      <circle cx={cx} cy={cy} r="4" fill="#D4AF37" opacity="0.9" />
      <circle cx={cx} cy={cy} r="2" fill="#fff" opacity="0.6" />

      {/* 8 petal lotus in middle ring */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * 45 * Math.PI) / 180;
        const px = cx + r * 0.28 * Math.cos(angle);
        const py = cy + r * 0.28 * Math.sin(angle);
        return (
          <ellipse
            key={`petal-${i}`}
            cx={px} cy={py}
            rx={r * 0.07} ry={r * 0.035}
            fill="none"
            stroke="#D4AF37"
            strokeWidth="0.5"
            opacity="0.7"
            transform={`rotate(${i * 45 + 90}, ${px}, ${py})`}
          />
        );
      })}

      {/* Optional: slow rotation animation */}
      {animate && (
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`0 ${cx} ${cy}`}
          to={`360 ${cx} ${cy}`}
          dur="120s"
          repeatCount="indefinite"
        />
      )}
    </svg>
  );
}
