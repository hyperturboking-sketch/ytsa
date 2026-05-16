import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, CloudLightning, Music, Video, ArrowRight, Loader2, Link2, CheckCircle2, DownloadCloud, Crown, Lock, Sparkles, Zap, Shield } from "lucide-react";
import { ToolReviews } from "@/components/ToolReviews";
import { useAnalyzeVideo } from "@/hooks/use-api";
import { VideoInfo, VideoFormat } from "@workspace/api-client-react/src/generated/api.schemas";
import AdPlaceholder from "@/components/layout/AdPlaceholder";
import { formatBytes } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/use-seo";
import HeroScene from "@/components/HeroScene";
import { useAuthStore } from "@/lib/auth";
import { useLocation } from "wouter";

const PLATFORMS = [
  {
    name: "YouTube",
    color: "#FF0000",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  },
  {
    name: "TikTok",
    color: "#010101",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.2 8.2 0 0 0 4.79 1.52V6.75a4.85 4.85 0 0 1-1.02-.06z"/></svg>`,
  },
  {
    name: "Twitter / X",
    color: "#000000",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  },
  {
    name: "Instagram",
    color: "#E1306C",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>`,
  },
  {
    name: "Facebook",
    color: "#1877F2",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
  },
  {
    name: "Vimeo",
    color: "#1AB7EA",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.787 4.789.968 5.507.537 2.443 1.124 3.664 1.769 3.664.498 0 1.245-.786 2.243-2.359 1-.574 1.57-2.19 1.718-2.9.153-.703-.176-1.55-.987-2.147-.816-.6-2.023-.562-3.468.09-.484.213-.988.507-1.516.883-.54-3.022.755-5.39 3.876-7.1C18.135.56 20.307.073 21.677.5c1.374.43 2.206 1.779 2.3 4.016.052 1.247-.214 1.9 0 1.9z"/></svg>`,
  },
  {
    name: "SoundCloud",
    color: "#FF5500",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M1.175 12.225c-.017 0-.034.003-.05.006l-.006-.006-.016.002a.524.524 0 0 0-.524.524v6.133a.524.524 0 0 0 .524.524l.002-.002.002.002h.068a.524.524 0 0 0 .524-.524V12.75a.524.524 0 0 0-.524-.525zm2.134-.956c-.017 0-.034.003-.051.007l-.007-.007-.016.002a.524.524 0 0 0-.524.524v7.09a.524.524 0 0 0 .524.523l.003-.001.002.001h.069a.524.524 0 0 0 .524-.524v-7.09a.524.524 0 0 0-.524-.525zm2.136-.546c-.017 0-.034.003-.05.007l-.007-.007-.016.002a.524.524 0 0 0-.524.524v7.635a.524.524 0 0 0 .524.524l.002-.001.002.001h.069a.524.524 0 0 0 .524-.524v-7.635a.524.524 0 0 0-.524-.526zm2.133.296c-.017 0-.034.003-.05.007l-.006-.007-.017.002a.524.524 0 0 0-.524.524v7.34a.524.524 0 0 0 .524.523l.002-.001.002.001h.069a.524.524 0 0 0 .524-.524v-7.34a.524.524 0 0 0-.524-.525zm2.136-.723c-.017 0-.034.003-.05.007l-.007-.007-.016.002a.524.524 0 0 0-.524.524v8.062a.524.524 0 0 0 .524.524l.002-.001.002.001h.069a.524.524 0 0 0 .524-.524v-8.062a.524.524 0 0 0-.524-.526zm2.133.5c-.017 0-.034.003-.05.007l-.006-.007-.017.002a.524.524 0 0 0-.524.524v7.562a.524.524 0 0 0 .524.524l.002-.001.002.001h.069a.524.524 0 0 0 .524-.524v-7.562a.524.524 0 0 0-.524-.526zm5.267-4.81c-1.35 0-2.56.557-3.432 1.454-.344-3.336-3.147-5.942-6.57-5.942-3.648 0-6.606 2.958-6.606 6.606 0 .166.009.33.022.493A2.86 2.86 0 0 0 0 10.753a2.86 2.86 0 0 0 2.86 2.858h14.279a4.787 4.787 0 0 0 4.787-4.787 4.787 4.787 0 0 0-4.787-4.787z"/></svg>`,
  },
  {
    name: "Twitch",
    color: "#9146FF",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>`,
  },
  {
    name: "Dailymotion",
    color: "#0066DC",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12.003 0C5.379 0 0 5.379 0 12.003S5.379 24 12.003 24 24 18.621 24 12.003 18.621 0 12.003 0zm5.487 14.588c-.577 1.966-2.294 3.315-4.333 3.315-2.543 0-4.614-2.071-4.614-4.614s2.071-4.614 4.614-4.614c1.237 0 2.359.493 3.188 1.292l.79-2.677h2.204l-1.849 7.298zm-4.333-3.759c-.793 0-1.437.644-1.437 1.437s.644 1.437 1.437 1.437 1.437-.644 1.437-1.437-.644-1.437-1.437-1.437z"/></svg>`,
  },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40, filter: "blur(4px)", scale: 0.98 },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)", scale: 1 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function Home() {
  useSEO({
    title: "YTSave – Free Video & Audio Downloader | YouTube, TikTok, Instagram, Twitter",
    description: "Download videos and audio from YouTube, TikTok, Twitter, Instagram, Facebook and 1000+ sites. Choose MP4 1080p/4K or MP3/M4A audio. 100% free, no software required.",
    keywords: "video downloader, youtube downloader, tiktok downloader, instagram downloader, twitter video downloader, facebook video downloader, mp4 downloader, mp3 downloader, youtube to mp3, youtube to mp4, free video downloader, online video downloader, audio extractor, download youtube videos",
    canonical: "/",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "YTSave",
        "url": "https://fbf109c9-a25e-4b26-8f8e-4430fa6216da-00-3jx30vaggl6ui.worf.replit.dev/",
        "description": "Download videos and audio from YouTube, TikTok, Twitter, Instagram and 1000+ sites.",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Any",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "featureList": [
          "Download YouTube videos in MP4 up to 4K",
          "Extract audio as MP3 or M4A",
          "Supports TikTok, Twitter, Instagram, Facebook and 1000+ sites",
          "No software installation required",
          "AI transcription powered by Whisper",
          "Batch downloads for Pro users"
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What video sites does YTSave support?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "YTSave supports YouTube, TikTok, Twitter/X, Instagram, Facebook, Vimeo, Dailymotion, SoundCloud, Twitch and over 1000 other video sites powered by yt-dlp."
            }
          },
          {
            "@type": "Question",
            "name": "What formats can I download?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "You can download videos in MP4 at 4K, 1080p, 720p or 480p, or extract audio as high-quality MP3 or M4A files."
            }
          },
          {
            "@type": "Question",
            "name": "Is YTSave free to use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, YTSave is completely free for basic downloads. No software installation or account required. Premium plans unlock 4K quality, batch downloads, AI transcription and more."
            }
          },
          {
            "@type": "Question",
            "name": "Do I need to install anything?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. YTSave is a fully web-based tool. Just paste your video URL and click Analyze — no browser extensions or desktop software needed."
            }
          },
          {
            "@type": "Question",
            "name": "How do I download a YouTube video as MP3?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Paste the YouTube video URL into YTSave, click Analyze, then select an audio format (MP3 or M4A) and click Download."
            }
          }
        ]
      }
    ]
  });
  const [url, setUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<{ formatId: string; progress: number } | null>(null);

  const analyzeMutation = useAnalyzeVideo();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [, navigate] = useLocation();

  const userPlan = user?.plan ?? "free";
  const hasProAccess = user?.isAdmin || ["pro", "elite"].includes(userPlan);

  const isFormatLocked = (format: VideoFormat) => !!format.requiresPro && !hasProAccess;

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    try {
      const result = await analyzeMutation.mutateAsync({ data: { url } });
      setVideoInfo(result);
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      toast({
        title: "Analysis Failed",
        description: err.message || "Could not fetch video details. Check URL and try again.",
        variant: "destructive"
      });
    }
  };

  const handleDownload = async (format: VideoFormat) => {
    if (!videoInfo || downloadProgress) return;

    try {
      setDownloadProgress({ formatId: format.formatId, progress: 0 });

      const { token } = useAuthStore.getState();
      const response = await fetch(`${import.meta.env.BASE_URL}api/download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          url: videoInfo.url,
          formatId: format.formatId,
          title: videoInfo.title,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Download failed (${response.status})`);
      }

      const contentLength = response.headers.get("Content-Length");
      const total = contentLength ? parseInt(contentLength) : null;
      const reader = response.body!.getReader();
      const chunks: Uint8Array[] = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (total) {
          setDownloadProgress({
            formatId: format.formatId,
            progress: Math.min(99, Math.round((received / total) * 100)),
          });
        }
      }

      setDownloadProgress({ formatId: format.formatId, progress: 100 });

      const blob = new Blob(chunks);
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      const safeTitle = videoInfo.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      a.download = `${safeTitle}.${format.ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);

      toast({
        title: "Download Complete",
        description: `${format.label} saved successfully.`,
      });
    } catch (err: any) {
      toast({
        title: "Download Failed",
        description: err.message || "An error occurred while downloading.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => setDownloadProgress(null), 800);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* HERO SECTION */}
      <section className="hero-gradient w-full relative pt-28 pb-24 flex flex-col items-center text-center overflow-hidden">
        <HeroScene />

        {/* Light-mode decorative rings */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden dark:hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-200/60 to-purple-100/30 blur-3xl" style={{ animation: 'blob-drift 14s ease-in-out infinite' }} />
          <div className="absolute bottom-[5%] left-[-8%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-indigo-200/50 to-violet-100/30 blur-3xl" style={{ animation: 'blob-drift 18s ease-in-out infinite reverse' }} />
          <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-pink-100/40 to-violet-100/20 blur-2xl" style={{ animation: 'blob-drift 10s ease-in-out infinite' }} />
        </div>

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center relative z-10">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary dark:bg-white/10 dark:border-white/15 dark:text-white/90 text-sm font-semibold mb-8 backdrop-blur-sm shadow-sm"
          >
            <Sparkles className="w-4 h-4 animate-[float-orbit_6s_ease-in-out_infinite]" />
            <span>Lightning fast extraction</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-6xl md:text-8xl font-extrabold tracking-tight text-gray-900 dark:text-white max-w-5xl leading-[1.05]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Download{" "}
            <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent animate-gradient-x">
              Anything.
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-violet-600 dark:from-white dark:via-white/90 dark:to-white bg-clip-text text-transparent">
              Anywhere. Anytime.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-lg md:text-xl text-gray-600 dark:text-white/55 max-w-2xl leading-relaxed font-medium"
          >
            Paste a link from YouTube, Twitter, TikTok, or anywhere else. We'll extract
            the highest quality video and audio instantly.
          </motion.p>

          {/* URL INPUT FORM */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3, type: "spring", stiffness: 150, damping: 18 }}
            className="w-full max-w-3xl mt-12 relative z-20"
          >
            <form onSubmit={handleAnalyze} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-indigo-500 to-violet-600 rounded-2xl blur opacity-20 group-hover:opacity-40 group-focus-within:opacity-50 transition duration-700 animate-gradient-x" style={{backgroundSize: '200% auto'}} />
              <div className="relative flex items-center bg-white dark:bg-white/8 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/20 shadow-xl dark:shadow-2xl p-2 pl-6 overflow-hidden">
                <Link2 className="w-6 h-6 text-gray-400 dark:text-white/40 mr-3 flex-shrink-0" />
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste video URL here..."
                  className="flex-1 bg-transparent border-none text-gray-900 dark:text-white text-lg placeholder:text-gray-400 dark:placeholder:text-white/35 focus:outline-none focus:ring-0 py-4"
                />
                <button
                  type="submit"
                  disabled={analyzeMutation.isPending || !url}
                  className="ml-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-violet-600/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {analyzeMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Analyze <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Supported platforms */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 w-full max-w-3xl"
          >
            <p className="text-xs text-gray-400 dark:text-white/30 uppercase tracking-widest mb-4 font-semibold">Supports 1000+ sites including</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {PLATFORMS.map((p, pi) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + pi * 0.05, type: "spring", stiffness: 300, damping: 20 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-primary/40 dark:hover:border-white/25 hover:bg-white dark:hover:bg-white/10 hover:scale-105 hover:shadow-sm transition-all duration-200 cursor-default backdrop-blur-sm"
                  title={p.name}
                >
                  <span className="w-5 h-5 flex-shrink-0" style={{ color: p.color }} dangerouslySetInnerHTML={{ __html: p.svg }} />
                  <span className="text-sm font-semibold text-gray-700 dark:text-white/70">{p.name}</span>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.6 + PLATFORMS.length * 0.05, type: "spring", stiffness: 300, damping: 20 }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/40 backdrop-blur-sm"
              >
                <span className="text-sm font-semibold">& 1000+ more</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS STRIP */}
      <motion.div
        initial={{ opacity: 0, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full border-y border-border/60 bg-gradient-to-r from-secondary/50 via-background to-secondary/50 dark:bg-secondary/30 py-12"
      >
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 divide-x divide-border/50">
          {[
            { value: "10M+", label: "Videos Downloaded", color: "from-violet-500 to-indigo-400", icon: "🎬" },
            { value: "500K+", label: "Active Users", color: "from-indigo-500 to-purple-400", icon: "👥" },
            { value: "1,000+", label: "Sites Supported", color: "from-purple-500 to-violet-400", icon: "🌐" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="text-center px-4 sm:px-8"
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className={`text-3xl md:text-4xl font-display font-extrabold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground mt-1.5 font-semibold">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* AD BANNER */}
      <motion.div
        {...fadeUp(0.1)}
        className="w-full max-w-5xl mx-auto px-4 mb-16"
      >
        <AdPlaceholder type="banner" slot="topBanner" />
      </motion.div>

      {/* RESULTS SECTION */}
      <AnimatePresence mode="wait">
        {videoInfo && (
          <motion.section 
            id="results-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full bg-secondary/50 border-y border-border py-16 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Video Info Card */}
                <div className="lg:col-span-1">
                  <div className="glass-card rounded-2xl p-6 sticky top-28">
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-secondary mb-6 border border-border relative group">
                      {videoInfo.thumbnail ? (
                        <img src={videoInfo.thumbnail} alt={videoInfo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="w-12 h-12 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                        {videoInfo.duration && (
                          <span className="px-2 py-1 rounded bg-black/60 backdrop-blur text-white text-xs font-mono font-medium">
                            {Math.floor(videoInfo.duration / 60)}:{String(videoInfo.duration % 60).padStart(2, '0')}
                          </span>
                        )}
                      </div>
                    </div>
                    <h3 className="font-display font-bold text-xl text-foreground mb-2 line-clamp-3">
                      {videoInfo.title}
                    </h3>
                    <p className="text-sm text-muted-foreground break-all">
                      {videoInfo.url}
                    </p>
                  </div>
                </div>

                {/* Formats List */}
                <div className="lg:col-span-2 space-y-8">
                  
                  {/* Video Formats */}
                  {videoInfo.formats.some(f => f.type === 'video') && (
                    <div>
                      <h4 className="flex items-center gap-2 text-lg font-bold text-foreground mb-4">
                        <Video className="w-5 h-5 text-primary" /> Video Downloads
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {videoInfo.formats.filter(f => f.type === 'video').map((format, idx) => {
                          const locked = isFormatLocked(format);
                          const isPro = !!format.requiresPro;
                          return (
                            <div key={idx} className={`bg-card border rounded-xl p-4 transition-colors ${locked ? "border-amber-300/50 opacity-85" : "border-border hover:border-primary/40 hover:shadow-sm"}`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-semibold text-foreground flex items-center gap-2 flex-wrap">
                                    {format.label}
                                    <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-wider">
                                      {format.ext}
                                    </span>
                                    {isPro && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200 text-[10px] font-bold uppercase tracking-wider">
                                        <Crown className="w-2.5 h-2.5" /> Need Pro
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm text-muted-foreground mt-1">
                                    {format.filesize ? <span>~{formatBytes(format.filesize)}</span> : <span className="italic text-muted-foreground/50">Size not available</span>}
                                  </div>
                                </div>
                                {locked ? (
                                  <button
                                    onClick={() => navigate("/pricing")}
                                    className="w-10 h-10 rounded-lg bg-amber-50 text-amber-500 hover:bg-amber-100 flex items-center justify-center transition-colors border border-amber-200"
                                    title="Upgrade to Pro"
                                  >
                                    <Lock className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleDownload(format)}
                                    disabled={!!downloadProgress}
                                    className="w-10 h-10 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white flex items-center justify-center transition-colors disabled:opacity-50 flex-shrink-0"
                                    title="Download"
                                  >
                                    {downloadProgress?.formatId === format.formatId ? (
                                      <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                      <DownloadCloud className="w-5 h-5" />
                                    )}
                                  </button>
                                )}
                              </div>
                              {downloadProgress?.formatId === format.formatId && (
                                <div className="mt-3">
                                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                    <span>Downloading…</span>
                                    <span>{downloadProgress.progress}%</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-primary/10 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-primary rounded-full transition-all duration-200"
                                      style={{ width: `${downloadProgress.progress}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Audio Formats */}
                  {videoInfo.formats.some(f => f.type === 'audio') && (
                    <div>
                      <h4 className="flex items-center gap-2 text-lg font-bold text-foreground mb-4">
                        <Music className="w-5 h-5 text-accent" /> Audio Downloads
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {videoInfo.formats.filter(f => f.type === 'audio').map((format, idx) => (
                          <div key={idx} className="bg-card border border-border rounded-xl p-4 hover:border-accent/40 hover:shadow-sm transition-colors">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-semibold text-foreground flex items-center gap-2">
                                  {format.label}
                                  <span className="px-1.5 py-0.5 rounded bg-accent/10 text-accent text-[10px] uppercase font-bold tracking-wider">
                                    {format.ext}
                                  </span>
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {format.filesize ? <span>~{formatBytes(format.filesize)}</span> : <span className="italic text-muted-foreground/50">Size not available</span>}
                                </div>
                              </div>
                              <button
                                onClick={() => handleDownload(format)}
                                disabled={!!downloadProgress}
                                className="w-10 h-10 rounded-lg bg-accent/10 text-accent hover:bg-accent hover:text-white flex items-center justify-center transition-colors disabled:opacity-50 flex-shrink-0"
                                title="Download"
                              >
                                {downloadProgress?.formatId === format.formatId ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                  <DownloadCloud className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                            {downloadProgress?.formatId === format.formatId && (
                              <div className="mt-3">
                                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                  <span>Downloading…</span>
                                  <span>{downloadProgress.progress}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-accent/10 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-accent rounded-full transition-all duration-200"
                                    style={{ width: `${downloadProgress.progress}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-8">
                     <AdPlaceholder type="banner" slot="resultsBanner" className="h-32" />
                  </div>

                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* FEATURES HIGHLIGHTS */}
      {!videoInfo && (
        <motion.section
          {...fadeUp()}
          className="w-full py-16 bg-gradient-to-b from-background via-secondary/30 to-background"
        >
          <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "Blazing Fast",
                desc: "Analyze and download in seconds, not minutes.",
                gradient: "from-violet-500 to-indigo-600",
                bg: "bg-violet-50 dark:bg-violet-500/10",
                border: "border-violet-200/60 dark:border-violet-500/20",
              },
              {
                icon: Shield,
                title: "100% Free",
                desc: "No hidden fees. No sign-up required to get started.",
                gradient: "from-indigo-500 to-purple-600",
                bg: "bg-indigo-50 dark:bg-indigo-500/10",
                border: "border-indigo-200/60 dark:border-indigo-500/20",
              },
              {
                icon: Link,
                title: "1000+ Sites",
                desc: "YouTube, TikTok, Instagram, Twitter and beyond.",
                gradient: "from-purple-500 to-violet-600",
                bg: "bg-purple-50 dark:bg-purple-500/10",
                border: "border-purple-200/60 dark:border-purple-500/20",
              },
            ].map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className={`flex flex-col items-center text-center p-7 rounded-2xl border ${feat.bg} ${feat.border} group hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <feat.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* HOW IT WORKS */}
      {!videoInfo && (
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28"
        >
          <motion.div
            {...fadeUp()}
            className="text-center mb-20"
          >
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-5 shadow-sm">
              Simple process
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-extrabold text-foreground mb-4 tracking-tight">
              Three steps to your{" "}
              <span className="bg-gradient-to-r from-violet-500 to-indigo-400 bg-clip-text text-transparent">
                content
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto font-medium">
              No sign-up. No software. Just paste and download.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-14 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <div className="hidden md:block absolute top-14 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent blur-sm" />

            {[
              {
                num: "01",
                title: "Copy any link",
                desc: "Find the video you want and copy its URL from your browser or app.",
                icon: Link2,
                gradient: "from-violet-500 to-indigo-700",
                glow: "rgba(139,92,246,0.35)",
                dir: -60,
              },
              {
                num: "02",
                title: "Hit Analyze",
                desc: "Paste the link and click analyze — we'll fetch every available quality in seconds.",
                icon: CloudLightning,
                gradient: "from-indigo-500 to-purple-700",
                glow: "rgba(99,102,241,0.35)",
                dir: 0,
              },
              {
                num: "03",
                title: "Download",
                desc: "Pick MP4, MP3, or any format and it saves directly to your device. Done.",
                icon: CheckCircle2,
                gradient: "from-purple-500 to-violet-600",
                glow: "rgba(168,85,247,0.35)",
                dir: 60,
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: step.dir, y: 20 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.65, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 flex flex-col items-center text-center group"
              >
                <div className="relative mb-7 step-icon-float">
                  <div
                    className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-xl group-hover:-translate-y-2 group-hover:shadow-2xl transition-all duration-300`}
                    style={{ boxShadow: `0 8px 32px ${step.glow}` }}
                  >
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-background border-2 border-primary/40 flex items-center justify-center shadow-sm">
                    <span className="text-[10px] font-bold text-primary">{step.num}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed max-w-[240px] text-sm font-medium">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* REVIEWS SECTION */}
      {!videoInfo && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          <ToolReviews
            reviews={HOME_REVIEWS}
            title="Loved by 500,000+ users worldwide"
            subtitle="Join creators, students, and professionals who download content with YTSave every day."
            ratingCount="12,400+"
          />
        </motion.div>
      )}

    </div>
  );
}

const HOME_REVIEWS = [
  {
    name: "Alex Morrison",
    handle: "@alexm_creates",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5,
    text: "Honestly the fastest downloader I've ever used. Pasted a YouTube link and had the MP4 in seconds. No ads, no redirects — just works.",
    tag: "YouTube",
  },
  {
    name: "Sarah Kim",
    handle: "@sarahk_vid",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
    text: "I download TikToks for my offline playlist all the time. YTSave is the only site that gives me clean MP4s without watermarks.",
    tag: "TikTok",
  },
  {
    name: "James Rivera",
    handle: "@jamesrbeats",
    avatar: "https://randomuser.me/api/portraits/men/65.jpg",
    rating: 5,
    text: "As a music producer I need audio rips constantly. The 320kbps MP3 quality is unmatched compared to any other tool I've tried.",
    tag: "Audio",
  },
  {
    name: "Priya Nair",
    handle: "@priya.clips",
    avatar: "https://randomuser.me/api/portraits/women/17.jpg",
    rating: 5,
    text: "Tried downloading an Instagram reel that other sites couldn't handle — YTSave got it in 1080p no problem. Bookmarked forever.",
    tag: "Instagram",
  },
  {
    name: "Tom Watkins",
    handle: "@tomwatches",
    avatar: "https://randomuser.me/api/portraits/men/11.jpg",
    rating: 5,
    text: "The Pro plan is totally worth it. 4K downloads, batch links, faster speeds — I use this daily for archiving rare content.",
    tag: "Pro Plan",
  },
  {
    name: "Layla Dawson",
    handle: "@layladstudio",
    avatar: "https://randomuser.me/api/portraits/women/28.jpg",
    rating: 5,
    text: "Clean UI, zero bloat, and it actually supports Twitter videos which most tools skip. 10/10 would recommend to any content creator.",
    tag: "Twitter / X",
  },
];
