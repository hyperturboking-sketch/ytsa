import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ADS_CONFIG } from "@/config/ads";

interface AdPlaceholderProps {
  className?: string;
  type?: "banner" | "sidebar" | "rectangle";
  slot?: keyof typeof ADS_CONFIG.slots;
}

const isConfigured = Boolean(ADS_CONFIG.publisherId && ADS_CONFIG.publisherId.startsWith("ca-pub-"));

export default function AdPlaceholder({ className, type = "banner", slot }: AdPlaceholderProps) {
  const adRef = useRef<HTMLModElement>(null);

  const slotId = slot ? ADS_CONFIG.slots[slot] : "";
  const showRealAd = isConfigured && Boolean(slotId);

  useEffect(() => {
    if (!showRealAd) return;

    if (!document.querySelector(`script[src*="adsbygoogle"]`)) {
      const script = document.createElement("script");
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_CONFIG.publisherId}`;
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }

    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (_) {}
  }, [showRealAd]);

  const typeClasses = {
    banner: "w-full h-24 sm:h-32",
    sidebar: "w-full h-[600px]",
    rectangle: "w-full aspect-video sm:aspect-square max-w-sm mx-auto",
  };

  if (showRealAd) {
    return (
      <div className={cn("overflow-hidden", typeClasses[type], className)}>
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={ADS_CONFIG.publisherId}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border-2 border-dashed border-white/10 bg-secondary/30 flex items-center justify-center group",
        typeClasses[type],
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />
      <span className="relative z-10 text-xs sm:text-sm font-mono tracking-[0.2em] text-muted-foreground/60 uppercase">
        Advertisement
      </span>

      <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-white/10" />
      <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-white/10" />
      <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-white/10" />
      <div className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-white/10" />
    </div>
  );
}
