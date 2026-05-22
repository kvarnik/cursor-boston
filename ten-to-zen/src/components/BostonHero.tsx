export function BostonHero({ compact = false }: { compact?: boolean }) {
  return (
    <svg
      className={`boston-hero${compact ? " boston-hero--compact" : ""}`}
      viewBox="0 0 400 120"
      aria-hidden
    >
      <defs>
        <linearGradient id="river" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7eb8d4" />
          <stop offset="100%" stopColor="#a8c5da" />
        </linearGradient>
      </defs>
      <rect width="400" height="120" fill="#f5f0e8" />
      <rect y="72" width="400" height="48" fill="url(#river)" opacity="0.85" />
      <path
        d="M0 95 Q100 88 200 92 T400 90 L400 120 L0 120 Z"
        fill="#6ba3be"
        opacity="0.5"
      />
      <rect x="40" y="28" width="18" height="55" fill="#2c3e50" opacity="0.7" />
      <rect x="65" y="18" width="22" height="65" fill="#2c3e50" opacity="0.75" />
      <rect x="95" y="35" width="16" height="48" fill="#2c3e50" opacity="0.65" />
      <rect x="120" y="12" width="26" height="71" fill="#2c3e50" />
      <rect x="155" y="32" width="20" height="51" fill="#2c3e50" opacity="0.8" />
      <rect x="185" y="22" width="24" height="61" fill="#2c3e50" opacity="0.9" />
      <rect x="220" y="38" width="18" height="45" fill="#2c3e50" opacity="0.7" />
      <rect x="250" y="15" width="28" height="68" fill="#2c3e50" />
      <rect x="290" y="30" width="20" height="53" fill="#2c3e50" opacity="0.75" />
      <rect x="320" y="25" width="22" height="58" fill="#2c3e50" opacity="0.85" />
      <ellipse cx="340" cy="100" rx="28" ry="14" fill="#e07a5f" opacity="0.9" />
      <path
        d="M312 98 C318 88 328 86 340 90 C352 86 362 88 368 98"
        stroke="#c8102e"
        strokeWidth="2"
        fill="none"
        opacity="0.6"
      />
      <circle cx="355" cy="92" r="3" fill="#2c3e50" />
      <circle cx="363" cy="92" r="3" fill="#2c3e50" />
    </svg>
  );
}
