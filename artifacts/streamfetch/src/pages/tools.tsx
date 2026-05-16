import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  DownloadCloud,
  FileText,
  Music2,
  Scissors,
  Subtitles,
  Layers,
  ArrowRight,
  Lock,
  Zap,
  Crown,
  CheckCircle2,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { useSEO } from "@/hooks/use-seo";
import { ToolReviews } from "@/components/ToolReviews";

const BADGE = {
  free: { label: "Free", color: "bg-green-500/15 text-green-400 border-green-500/30" },
  pro: { label: "Pro", color: "bg-violet-500/15 text-violet-400 border-violet-500/30" },
  elite: { label: "Elite", color: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
};

const tools = [
  {
    id: "downloader",
    title: "Video Downloader",
    description:
      "Download videos from YouTube, TikTok, Twitter, Instagram and 1000+ sites in MP4, WebM, and more.",
    icon: DownloadCloud,
    accentColor: "text-primary",
    iconBg: "bg-primary/10 border-primary/20",
    hoverBorder: "hover:border-primary/40",
    hoverGlow: "hover:shadow-primary/10",
    tier: "free" as const,
    href: "/",
    available: true,
  },
  {
    id: "audio",
    title: "Audio Extractor",
    description:
      "Extract the audio track from any video as high-quality MP3 or M4A. Perfect for podcasts and music.",
    icon: Music2,
    accentColor: "text-cyan-400",
    iconBg: "bg-cyan-500/10 border-cyan-500/20",
    hoverBorder: "hover:border-cyan-500/40",
    hoverGlow: "hover:shadow-cyan-500/10",
    tier: "free" as const,
    href: "/",
    available: true,
  },
  {
    id: "transcribe",
    title: "AI Transcription",
    description:
      "Paste a YouTube URL or upload an audio file and get a full AI-generated text transcript in seconds.",
    icon: FileText,
    accentColor: "text-indigo-400",
    iconBg: "bg-indigo-500/10 border-indigo-500/20",
    hoverBorder: "hover:border-indigo-500/40",
    hoverGlow: "hover:shadow-indigo-500/10",
    tier: "elite" as const,
    href: "/tools/transcribe",
    available: true,
  },
  {
    id: "subtitles",
    title: "Subtitle Downloader",
    description:
      "Download auto-generated or manual subtitles from YouTube videos as SRT or VTT files.",
    icon: Subtitles,
    accentColor: "text-teal-400",
    iconBg: "bg-teal-500/10 border-teal-500/20",
    hoverBorder: "hover:border-teal-500/40",
    hoverGlow: "hover:shadow-teal-500/10",
    tier: "pro" as const,
    href: "/tools/subtitles",
    available: true,
  },
  {
    id: "batch",
    title: "Batch Downloader",
    description:
      "Download an entire playlist or channel at once. Queue multiple videos and download them together.",
    icon: Layers,
    accentColor: "text-orange-400",
    iconBg: "bg-orange-500/10 border-orange-500/20",
    hoverBorder: "hover:border-orange-500/40",
    hoverGlow: "hover:shadow-orange-500/10",
    tier: "pro" as const,
    href: "/pricing",
    available: false,
    comingSoon: false,
  },
  {
    id: "trim",
    title: "Video Trimmer",
    description:
      "Cut and trim a specific segment of a video before downloading — no extra software needed.",
    icon: Scissors,
    accentColor: "text-rose-400",
    iconBg: "bg-rose-500/10 border-rose-500/20",
    hoverBorder: "hover:border-rose-500/40",
    hoverGlow: "hover:shadow-rose-500/10",
    tier: "elite" as const,
    href: "/pricing",
    available: false,
    comingSoon: true,
  },
];

const tierIcon = {
  free: <Zap className="w-3 h-3" />,
  pro: <Zap className="w-3 h-3" />,
  elite: <Crown className="w-3 h-3" />,
};

export default function Tools() {
  useSEO({
    title: "All Tools – Video Downloader, Audio Extractor, AI Transcription | StreamFetch",
    description:
      "Access all StreamFetch tools in one place: download MP4 videos, extract MP3 audio, generate AI transcripts, download subtitles, and batch-download playlists from YouTube, TikTok, Instagram and 1000+ sites.",
    keywords: "video downloader tool, audio extractor, youtube to mp3 converter, ai video transcription, subtitle downloader, batch youtube downloader, playlist downloader, online video tools",
    canonical: "/tools",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "StreamFetch Tools",
      "description": "All video download and processing tools available on StreamFetch",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Video Downloader",
          "description": "Download MP4 videos from YouTube, TikTok, Twitter, Instagram and 1000+ sites",
          "url": "https://fbf109c9-a25e-4b26-8f8e-4430fa6216da-00-3jx30vaggl6ui.worf.replit.dev/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Audio Extractor",
          "description": "Extract high-quality MP3 or M4A audio from any video",
          "url": "https://fbf109c9-a25e-4b26-8f8e-4430fa6216da-00-3jx30vaggl6ui.worf.replit.dev/"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "AI Transcription",
          "description": "Convert YouTube videos or audio files to text using Whisper AI",
          "url": "https://fbf109c9-a25e-4b26-8f8e-4430fa6216da-00-3jx30vaggl6ui.worf.replit.dev/tools/transcribe"
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": "Subtitle Downloader",
          "description": "Download auto-generated or manual subtitles from YouTube as SRT or VTT",
          "url": "https://fbf109c9-a25e-4b26-8f8e-4430fa6216da-00-3jx30vaggl6ui.worf.replit.dev/pricing"
        },
        {
          "@type": "ListItem",
          "position": 5,
          "name": "Batch Downloader",
          "description": "Download entire YouTube playlists or multiple videos at once",
          "url": "https://fbf109c9-a25e-4b26-8f8e-4430fa6216da-00-3jx30vaggl6ui.worf.replit.dev/pricing"
        }
      ]
    }
  });

  const { user } = useAuthStore();

  const userPlan = user?.isAdmin ? "elite" : (user?.plan ?? "free");
  const planRank: Record<string, number> = { free: 0, basic: 1, pro: 2, elite: 3 };
  const userRank = planRank[userPlan] ?? 0;
  const tierRank: Record<string, number> = { free: 0, pro: 2, elite: 3 };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-secondary to-background">
      {/* Header */}
      <section className="w-full pt-20 pb-10 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
        >
          <Zap className="w-4 h-4" />
          All Tools
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="text-4xl md:text-5xl font-display font-extrabold tracking-tight text-foreground mb-4"
        >
          Everything you need to{" "}
          <span className="text-gradient">save content.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-muted-foreground text-lg max-w-xl mx-auto"
        >
          Download, extract, transcribe and more — all from one place.
        </motion.p>
      </section>

      {/* Tools Grid */}
      <section className="w-full max-w-5xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool, i) => {
            const Icon = tool.icon;
            const badge = BADGE[tool.tier];
            const canAccess = tool.available && (userRank >= tierRank[tool.tier] || tool.tier === "free");
            const destination = canAccess ? tool.href : "/pricing";

            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.06 * i }}
              >
                <Link href={destination}>
                  <div
                    className={`group relative flex flex-col h-full bg-card border border-border rounded-2xl p-5 cursor-pointer transition-all duration-300 ${tool.hoverBorder} hover:shadow-lg ${tool.hoverGlow} hover:-translate-y-1 ${!tool.available ? "opacity-80" : ""}`}
                  >
                    {/* Top row: icon + badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${tool.iconBg} ${tool.accentColor}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.color}`}>
                          {tierIcon[tool.tier]}
                          {badge.label}
                        </span>
                        {tool.comingSoon && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-secondary text-muted-foreground border-border">
                            Coming soon
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title + description */}
                    <h3 className="text-base font-display font-bold text-foreground mb-1.5 leading-snug">
                      {tool.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                      {tool.description}
                    </p>

                    {/* CTA */}
                    <div className="mt-4 pt-4 border-t border-border/60">
                      {tool.available ? (
                        <div className={`inline-flex items-center gap-1.5 text-sm font-semibold ${tool.accentColor} group-hover:gap-3 transition-all`}>
                          {canAccess ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Use tool
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4" />
                              Upgrade to access
                            </>
                          )}
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      ) : tool.comingSoon ? (
                        <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                          <Lock className="w-3.5 h-3.5" />
                          Coming soon
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                          <Lock className="w-3.5 h-3.5" />
                          Upgrade to access
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Upgrade CTA */}
        {(!user || userPlan === "free" || userPlan === "basic") && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 p-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-accent/5 text-center"
          >
            <Crown className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <h3 className="text-2xl font-display font-bold text-foreground mb-2">Unlock all tools</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Upgrade to Pro or Elite to access AI Transcription, Subtitle Downloader, Batch Downloader and more.
            </p>
            <Link href="/pricing">
              <button className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20">
                View Plans
              </button>
            </Link>
          </motion.div>
        )}
      </section>

      <ToolReviews
        reviews={TOOLS_REVIEWS}
        title="Used daily by creators worldwide"
        subtitle="Thousands of people use StreamFetch tools to save, convert and transcribe content every day."
        ratingCount="8,500+"
      />
    </div>
  );
}

const TOOLS_REVIEWS = [
  {
    name: "Olivia Park",
    handle: "@oliviapark_yt",
    avatar: "https://randomuser.me/api/portraits/women/61.jpg",
    rating: 5,
    text: "I've tried every downloader out there and StreamFetch is by far the most reliable. It handles every platform I throw at it with zero issues.",
    tag: "Video Downloader",
  },
  {
    name: "Nathan Sanders",
    handle: "@nate_nomad",
    avatar: "https://randomuser.me/api/portraits/men/14.jpg",
    rating: 5,
    text: "As a digital nomad I often need offline videos for flights. The batch downloader on Pro saves me so much time prepping for long trips.",
    tag: "Batch Downloader",
  },
  {
    name: "Zoe Marchetti",
    handle: "@zoeteaches",
    avatar: "https://randomuser.me/api/portraits/women/39.jpg",
    rating: 5,
    text: "I download and transcribe educational YouTube videos for my students. These tools together are an absolute game changer for teaching.",
    tag: "Education",
  },
  {
    name: "Carlos Reyes",
    handle: "@carlosrmktg",
    avatar: "https://randomuser.me/api/portraits/men/55.jpg",
    rating: 5,
    text: "The subtitle downloader is underrated. I use it to grab SRT files from competitor videos for content research. Super useful for marketers.",
    tag: "Subtitle Tool",
  },
  {
    name: "Aisha Nwosu",
    handle: "@aisha.freelance",
    avatar: "https://randomuser.me/api/portraits/women/72.jpg",
    rating: 5,
    text: "I'm a freelance video editor and use the audio extractor constantly to pull soundtracks. Crystal clear 320kbps output every time.",
    tag: "Audio Extractor",
  },
  {
    name: "Leo Kaufman",
    handle: "@leokdev",
    avatar: "https://randomuser.me/api/portraits/men/28.jpg",
    rating: 5,
    text: "StreamFetch is genuinely the best all-in-one media toolkit online. The UI is clean and every tool just works without needing a tutorial.",
    tag: "All Tools",
  },
];
