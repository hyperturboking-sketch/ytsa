import { useEffect, useRef } from "react";

export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isDark = document.documentElement.classList.contains("dark");

    const count = 55;
    const styleTag = document.createElement("style");
    let css = "";
    const elements: HTMLDivElement[] = [];

    for (let i = 0; i < count; i++) {
      const isViolet = Math.random() > 0.45;
      const size = Math.random() * 3 + 1;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const duration = Math.random() * 22 + 14;
      const delay = Math.random() * -22;
      const driftX = (Math.random() - 0.5) * 60;
      const driftY = (Math.random() - 0.5) * 60;
      const opacityA = isDark
        ? (Math.random() * 0.6 + 0.25).toFixed(2)
        : (Math.random() * 0.5 + 0.2).toFixed(2);
      const opacityB = isDark
        ? (Math.random() * 0.15 + 0.04).toFixed(2)
        : (Math.random() * 0.1 + 0.05).toFixed(2);
      const scaleB = (Math.random() * 0.4 + 0.85).toFixed(2);

      const color = isDark
        ? isViolet ? "rgba(167,139,250,0.85)" : "rgba(129,140,248,0.7)"
        : isViolet ? "rgba(124,58,237,0.4)"   : "rgba(99,102,241,0.35)";

      const glow = isDark
        ? isViolet ? "rgba(139,92,246,0.65)"  : "rgba(99,102,241,0.5)"
        : isViolet ? "rgba(124,58,237,0.3)"   : "rgba(79,70,229,0.25)";

      css += `
        @keyframes p${i} {
          0%   { transform: translate(0,0) scale(1); opacity: ${opacityA}; }
          100% { transform: translate(${driftX}px,${driftY}px) scale(${scaleB}); opacity: ${opacityB}; }
        }
      `;

      const dot = document.createElement("div");
      dot.style.cssText = `
        position:absolute;left:${x}%;top:${y}%;
        width:${size}px;height:${size}px;border-radius:50%;
        background:${color};box-shadow:0 0 ${size * 5}px ${glow};
        animation:p${i} ${duration}s ${delay}s infinite ease-in-out alternate;
        pointer-events:none;
      `;
      container.appendChild(dot);
      elements.push(dot);
    }

    const orbs = isDark
      ? [
          { x: 50,  y: -10, color: "rgba(109,40,217,0.18)",  size: 900, d: 14 },
          { x: 15,  y: 40,  color: "rgba(99,102,241,0.10)",  size: 600, d: 10 },
          { x: 85,  y: 50,  color: "rgba(139,92,246,0.08)",  size: 550, d: 16 },
          { x: 50,  y: 110, color: "rgba(15,15,15,0.95)",    size: 700, d: 18 },
        ]
      : [
          { x: 20,  y: 10,  color: "rgba(139,92,246,0.12)",  size: 700, d: 14 },
          { x: 80,  y: 20,  color: "rgba(99,102,241,0.10)",  size: 600, d: 12 },
          { x: 50,  y: 60,  color: "rgba(167,139,250,0.08)", size: 800, d: 16 },
          { x: 10,  y: 70,  color: "rgba(109,40,217,0.07)",  size: 500, d: 10 },
          { x: 90,  y: 80,  color: "rgba(124,58,237,0.06)",  size: 550, d: 18 },
        ];

    orbs.forEach((orb, i) => {
      css += `
        @keyframes orb${i} {
          0%   { transform:translate(-50%,-50%) scale(1);    opacity:0.9; }
          100% { transform:translate(-50%,-50%) scale(1.25); opacity:1;   }
        }
      `;
      const el = document.createElement("div");
      el.style.cssText = `
        position:absolute;left:${orb.x}%;top:${orb.y}%;
        width:${orb.size}px;height:${orb.size}px;border-radius:50%;
        background:radial-gradient(circle,${orb.color} 0%,transparent 70%);
        transform:translate(-50%,-50%);filter:blur(60px);
        animation:orb${i} ${orb.d}s ease-in-out infinite alternate;
        pointer-events:none;
      `;
      container.appendChild(el);
      elements.push(el);
    });

    styleTag.textContent = css;
    document.head.appendChild(styleTag);

    return () => {
      elements.forEach(el => el.remove());
      styleTag.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    />
  );
}
