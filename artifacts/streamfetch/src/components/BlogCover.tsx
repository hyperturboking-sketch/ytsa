interface BlogCoverProps {
  emoji: string;
  gradient: string;
  pattern?: "dots" | "grid" | "waves" | "crosses" | "diagonal";
  coverImage?: string;
  title?: string;
  className?: string;
  size?: "card" | "hero";
}

const PATTERNS: Record<string, string> = {
  dots: `<pattern id="p" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="white" fill-opacity="0.15"/></pattern>`,
  grid: `<pattern id="p" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="white" stroke-opacity="0.1" stroke-width="0.75"/></pattern>`,
  crosses: `<pattern id="p" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M10 6v8M6 10h8" stroke="white" stroke-opacity="0.12" stroke-width="0.8" stroke-linecap="round"/></pattern>`,
  diagonal: `<pattern id="p" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect x="0" y="0" width="7" height="14" fill="white" fill-opacity="0.06"/></pattern>`,
  waves: `<pattern id="p" x="0" y="0" width="40" height="20" patternUnits="userSpaceOnUse"><path d="M0 10 Q10 0 20 10 Q30 20 40 10" fill="none" stroke="white" stroke-opacity="0.1" stroke-width="1"/></pattern>`,
};

export default function BlogCover({
  emoji,
  gradient,
  pattern = "dots",
  coverImage,
  className = "",
  size = "card",
}: BlogCoverProps) {
  const isHero = size === "hero";
  const heightClass = isHero ? "h-52 sm:h-72 md:h-80" : "aspect-[16/9]";

  if (coverImage) {
    return (
      <div className={`relative overflow-hidden w-full ${heightClass} ${className}`}>
        <img
          src={coverImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
        {/* Subtle vignette to make overlaid text readable */}
        {isHero && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10 pointer-events-none" />
        )}
        {!isHero && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
        )}
      </div>
    );
  }

  const pid = `p-${gradient.replace(/\s/g, "").slice(0, 8)}`;
  const patternSvg = PATTERNS[pattern].replace(/id="p"/g, `id="${pid}"`);

  return (
    <div className={`relative overflow-hidden w-full ${heightClass} ${className}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} style={{ zIndex: 0 }} />
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }} aria-hidden="true">
        <defs dangerouslySetInnerHTML={{ __html: patternSvg }} />
        <rect width="100%" height="100%" fill={`url(#${pid})`} />
      </svg>
      <div className="absolute rounded-full border border-white/10" style={{ width: isHero ? 320 : 180, height: isHero ? 320 : 180, top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 2 }} />
      <div className="absolute rounded-full border border-white/[0.07]" style={{ width: isHero ? 500 : 280, height: isHero ? 500 : 280, top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 2 }} />
      <div className="absolute rounded-full border border-white/[0.04]" style={{ width: isHero ? 700 : 380, height: isHero ? 700 : 380, top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 2 }} />
      <div className="absolute rounded-full bg-white/10 blur-3xl" style={{ width: isHero ? 280 : 140, height: isHero ? 280 : 140, top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 2 }} />
      <div className="absolute top-[-20%] right-[-10%] w-1/2 h-full rounded-full bg-white/10 blur-2xl" style={{ zIndex: 2 }} />
      <div className="absolute bottom-[-20%] left-[-10%] w-1/3 h-2/3 rounded-full bg-black/10 blur-2xl" style={{ zIndex: 2 }} />
      <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 3 }}>
        <span className="select-none" style={{ fontSize: isHero ? "5rem" : "3.5rem", filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.25))", lineHeight: 1 }}>{emoji}</span>
      </div>
    </div>
  );
}
