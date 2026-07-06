import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Monitor, Apple, Terminal, Download, CheckCircle2,
  Shield, Zap, Wifi, ArrowRight, Star, ChevronDown, ChevronUp,
  Chrome, Globe
} from "lucide-react";
import { useSEO } from "@/hooks/use-seo";

type Platform = "windows" | "mac" | "linux";

function detectPlatform(): Platform {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("win")) return "windows";
  if (ua.includes("mac")) return "mac";
  return "linux";
}

const RELEASES = {
  windows: {
    label: "Download for Windows",
    sublabel: "Windows 10 / 11 · 64-bit",
    ext: ".exe installer",
    icon: Monitor,
    color: "from-blue-500 to-cyan-500",
    bg: "from-blue-500/10 to-cyan-500/10",
    border: "border-blue-500/30",
    // Update this URL after publishing to GitHub Releases:
    url: "https://github.com/YOUR_USERNAME/YOUR_REPO/releases/latest/download/YTSave-Setup-Windows.exe",
  },
  mac: {
    label: "Download for macOS",
    sublabel: "macOS 12+ · Intel & Apple Silicon",
    ext: ".dmg disk image",
    icon: Apple,
    color: "from-violet-500 to-purple-500",
    bg: "from-violet-500/10 to-purple-500/10",
    border: "border-violet-500/30",
    url: "https://github.com/YOUR_USERNAME/YOUR_REPO/releases/latest/download/YTSave-macOS.dmg",
  },
  linux: {
    label: "Download for Linux",
    sublabel: "Ubuntu, Fedora, Arch & more",
    ext: ".AppImage · no install needed",
    icon: Terminal,
    color: "from-emerald-500 to-teal-500",
    bg: "from-emerald-500/10 to-teal-500/10",
    border: "border-emerald-500/30",
    url: "https://github.com/YOUR_USERNAME/YOUR_REPO/releases/latest/download/YTSave-Linux.AppImage",
  },
};

const STEPS: Record<Platform, { step: string; detail: string }[]> = {
  windows: [
    { step: "Download the installer", detail: "Click the button above to download YTSave-Setup.exe" },
    { step: "Run the installer", detail: "Double-click the .exe and follow the setup wizard" },
    { step: "Launch YTSave", detail: "Open from the Desktop shortcut or Start Menu" },
    { step: "Paste any video URL", detail: "YouTube, TikTok, Instagram — it all works instantly" },
  ],
  mac: [
    { step: "Download the disk image", detail: "Click the button above to download YTSave.dmg" },
    { step: "Open the .dmg file", detail: "Double-click it and drag YTSave to your Applications folder" },
    { step: "Launch YTSave", detail: "Open from Applications or Spotlight search" },
    { step: "Paste any video URL", detail: "YouTube, TikTok, Instagram — it all works instantly" },
  ],
  linux: [
    { step: "Download the AppImage", detail: "Click the button above to download YTSave.AppImage" },
    { step: "Make it executable", detail: "Run: chmod +x YTSave-Linux.AppImage" },
    { step: "Launch YTSave", detail: "Double-click the file or run it from the terminal" },
    { step: "Paste any video URL", detail: "YouTube, TikTok, Instagram — it all works instantly" },
  ],
};

const FEATURES = [
  {
    icon: Shield,
    title: "No bot detection — ever",
    desc: "Downloads run from your own IP and use your browser's YouTube session. No server, no blocks.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    icon: Zap,
    title: "Blazing fast downloads",
    desc: "Parallel segment downloading goes directly to your disk — no upload/download through a server.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: Wifi,
    title: "Works completely offline",
    desc: "All processing is local. Only yt-dlp needs internet — your data never touches our servers.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Chrome,
    title: "Auto-imports your cookies",
    desc: "Reads your logged-in Chrome/Firefox session automatically. No setup, no manual steps needed.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
];

const FAQS = [
  {
    q: "Do I need to be logged into YouTube?",
    a: "Not strictly, but it helps for age-restricted content. The app reads your existing browser cookies — if you're already logged into YouTube in Chrome or Firefox, you're good to go with no extra steps.",
  },
  {
    q: "Why is the desktop app better than the website?",
    a: "The web version runs on a server with a datacenter IP, which YouTube flags and blocks. The desktop app runs yt-dlp on your own machine with your own residential IP and browser cookies, so YouTube never sees a bot.",
  },
  {
    q: "Is it safe to install?",
    a: "Yes. The app is open-source — you can inspect all the code in this repository. It runs a small local web server (only accessible on your machine), launches your browser to it, and uses yt-dlp for downloads.",
  },
  {
    q: "Does it support 4K?",
    a: "Yes. Running locally gives access to all formats yt-dlp supports, including 4K, 8K, and lossless audio. No format restrictions.",
  },
  {
    q: "Will it work on Apple Silicon (M1/M2/M3)?",
    a: "Yes. The macOS build is a universal binary that runs natively on both Intel and Apple Silicon.",
  },
];

function PlatformCard({
  platform,
  selected,
  onClick,
}: {
  platform: Platform;
  selected: boolean;
  onClick: () => void;
}) {
  const info = RELEASES[platform];
  const Icon = info.icon;

  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-2xl border p-4 text-left transition-all duration-200 ${
        selected
          ? `bg-gradient-to-br ${info.bg} ${info.border} shadow-lg`
          : "border-border bg-card hover:border-primary/30 hover:bg-card/80"
      }`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br ${info.bg} ${info.border} border`}>
        <Icon className={`w-5 h-5 bg-gradient-to-br ${info.color} bg-clip-text`} style={{ color: selected ? "transparent" : undefined }} />
        {selected && <Icon className={`w-5 h-5 text-white`} style={{ display: "none" }} />}
        <Icon className="w-5 h-5 text-foreground/80" />
      </div>
      <p className="font-semibold text-sm text-foreground leading-tight">
        {platform === "windows" ? "Windows" : platform === "mac" ? "macOS" : "Linux"}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">{info.sublabel}</p>
      {selected && (
        <span className={`inline-flex items-center gap-1 mt-2 text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r ${info.color} bg-clip-text text-transparent`}>
          ● Selected
        </span>
      )}
    </button>
  );
}

export default function DownloadPage() {
  const [platform, setPlatform] = useState<Platform>("windows");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  useSEO({
    title: "Download YTSave Desktop App — Windows, Mac & Linux",
    description: "Download the YTSave desktop app. Runs on your own machine — no IP blocks, no bot detection. Supports YouTube, TikTok, Instagram and 1000+ sites.",
    canonical: "/download",
  });

  const release = RELEASES[platform];
  const steps = STEPS[platform];
  const PlatformIcon = release.icon;

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" },
    transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
  });

  return (
    <div className="w-full flex flex-col items-center">

      {/* HERO */}
      <section className="w-full relative overflow-hidden bg-gradient-to-b from-violet-950/30 via-background to-background border-b border-border py-14 sm:py-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[50%] translate-x-[-50%] w-[600px] h-[400px] rounded-full bg-violet-600/10 blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-300 text-xs font-bold uppercase tracking-wider mb-5">
              <Download className="w-3 h-3" /> Desktop App
            </span>

            <h1 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-foreground mb-4 leading-tight">
              Download that actually{" "}
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                works
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-2">
              Runs on your own machine. Your IP, your browser cookies, zero bot detection.
              YouTube, TikTok, Instagram, and 1000+ other sites.
            </p>
            <p className="text-sm text-muted-foreground/60 mb-8">Free · Open source · No account needed</p>

            {/* Platform selector */}
            <div className="flex gap-3 mb-6 max-w-sm mx-auto">
              {(["windows", "mac", "linux"] as Platform[]).map((p) => (
                <PlatformCard key={p} platform={p} selected={platform === p} onClick={() => setPlatform(p)} />
              ))}
            </div>

            {/* Primary download button */}
            <motion.div
              key={platform}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-3"
            >
              <a
                href={release.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r ${release.color} text-white font-bold text-base shadow-xl hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200`}
              >
                <PlatformIcon className="w-5 h-5" />
                {release.label}
                <ArrowRight className="w-4 h-4" />
              </a>
              <p className="text-xs text-muted-foreground">{release.ext} · Free download</p>
            </motion.div>

            {/* Other platforms */}
            <div className="flex items-center justify-center gap-4 mt-5">
              {(["windows", "mac", "linux"] as Platform[]).filter(p => p !== platform).map((p) => {
                const r = RELEASES[p];
                const Icon = r.icon;
                return (
                  <a
                    key={p}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {p === "windows" ? "Windows" : p === "mac" ? "macOS" : "Linux"}
                  </a>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-16">

        {/* WHY DESKTOP */}
        <motion.div {...fadeUp(0)}>
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Why desktop?</p>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              Server IPs get blocked. Your IP doesn't.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div key={i} {...fadeUp(i * 0.06)}>
                <div className="rounded-2xl border border-border bg-card p-5 h-full flex gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${f.bg}`}>
                    <f.icon className={`w-5 h-5 ${f.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground mb-1">{f.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* HOW TO INSTALL */}
        <motion.div {...fadeUp(0)}>
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Installation</p>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              Up and running in 60 seconds
            </h2>
          </div>
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-[22px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary/40 via-primary/20 to-transparent hidden sm:block" />
            <div className="space-y-4">
              {steps.map((s, i) => (
                <motion.div key={i} {...fadeUp(i * 0.07)}>
                  <div className="flex gap-4 items-start">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0 z-10">
                      <span className="text-sm font-bold text-violet-400">{i + 1}</span>
                    </div>
                    <div className="flex-1 rounded-2xl border border-border bg-card p-4 sm:p-5">
                      <p className="font-semibold text-sm text-foreground">{s.step}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{s.detail}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* COMPARISON */}
        <motion.div {...fadeUp(0)}>
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Comparison</p>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              Web vs Desktop
            </h2>
          </div>
          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="grid grid-cols-3 text-xs font-bold uppercase tracking-wider text-muted-foreground bg-secondary/50 px-4 py-3">
              <span>Feature</span>
              <span className="text-center">Web App</span>
              <span className="text-center">Desktop App</span>
            </div>
            {[
              ["No IP blocks", false, true],
              ["No bot detection", false, true],
              ["4K / 8K downloads", false, true],
              ["Works without account", true, true],
              ["YouTube, TikTok, 1000+ sites", true, true],
              ["No install needed", true, false],
              ["Works from any device", true, false],
            ].map(([label, web, desktop], i) => (
              <div key={i} className={`grid grid-cols-3 px-4 py-3.5 text-sm border-t border-border ${i % 2 === 0 ? "bg-card" : "bg-secondary/20"}`}>
                <span className="text-foreground/80 font-medium">{label as string}</span>
                <span className="text-center">
                  {web
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500 inline" />
                    : <span className="text-muted-foreground/40 text-lg leading-none">—</span>
                  }
                </span>
                <span className="text-center">
                  {desktop
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500 inline" />
                    : <span className="text-muted-foreground/40 text-lg leading-none">—</span>
                  }
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div {...fadeUp(0)}>
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">FAQ</p>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              Common questions
            </h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <motion.div key={i} {...fadeUp(i * 0.04)}>
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="font-semibold text-sm text-foreground">{faq.q}</span>
                    {openFaq === i
                      ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    }
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FINAL CTA */}
        <motion.div {...fadeUp(0)}>
          <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-violet-950/30 via-indigo-950/20 to-background p-8 sm:p-12 text-center">
            <div className="text-4xl mb-4">⬇️</div>
            <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-foreground mb-3">
              Ready to download without limits?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              The desktop app is free and open source. Your downloads, your machine, your speed.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={RELEASES[platform].url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r ${RELEASES[platform].color} text-white font-bold text-sm shadow-lg hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200`}
              >
                <PlatformIcon className="w-4 h-4" />
                {RELEASES[platform].label}
              </a>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
              >
                <Globe className="w-4 h-4" />
                Use the web version instead
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
