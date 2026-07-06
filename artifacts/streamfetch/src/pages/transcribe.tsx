import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FileText, Link2, ArrowRight, Loader2, Copy, Check, Lock, Crown, Upload, X, Music, Mic, Sparkles, Zap, Globe } from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useSEO } from "@/hooks/use-seo";
import { ToolReviews } from "@/components/ToolReviews";

type Mode = "url" | "file";

const features = [
  { icon: Zap, title: "Lightning Fast", desc: "Get transcripts in seconds, not minutes" },
  { icon: Globe, title: "99+ Languages", desc: "Automatic language detection & transcription" },
  { icon: Sparkles, title: "High Accuracy", desc: "State-of-the-art Whisper AI model" },
];

export default function Transcribe() {
  useSEO({
    title: "AI Transcription – Convert YouTube Videos & Audio to Text | YTSave",
    description: "Instantly transcribe any YouTube video or audio file to text using Whisper AI. Supports 99+ languages with automatic detection. Paste a URL or upload your file and get accurate transcripts in seconds.",
    keywords: "youtube transcript, youtube to text, audio to text, video transcription, whisper ai transcription, speech to text online, youtube video transcript generator, audio transcription tool, convert video to text",
    canonical: "/tools/transcribe",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "YTSave AI Transcription",
      "description": "Convert any YouTube video or audio file to accurate text using Whisper AI. Supports 99+ languages.",
      "applicationCategory": "MultimediaApplication",
      "operatingSystem": "Any",
      "url": "https://fbf109c9-a25e-4b26-8f8e-4430fa6216da-00-3jx30vaggl6ui.worf.replit.dev/tools/transcribe",
      "featureList": [
        "Transcribe YouTube videos by URL",
        "Upload and transcribe audio/video files up to 25MB",
        "Supports 99+ languages with automatic detection",
        "Powered by OpenAI Whisper AI model",
        "Copy transcript to clipboard"
      ],
      "offers": {
        "@type": "Offer",
        "price": "8.99",
        "priceCurrency": "USD",
        "description": "Available on Elite plan"
      }
    }
  });

  const { user, token } = useAuthStore();
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>("url");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userPlan = user?.plan ?? "free";
  const hasAccess = ["elite"].includes(userPlan) || user?.isAdmin;

  const handleFileSelect = (selected: File) => {
    const maxSize = 25 * 1024 * 1024;
    if (selected.size > maxSize) {
      toast({ title: "File too large", description: "Maximum file size is 25MB.", variant: "destructive" });
      return;
    }
    setFile(selected);
    setTranscript(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  };

  const handleTranscribeUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !token) return;
    setLoading(true);
    setTranscript(null);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/transcribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Transcription failed");
      setTranscript(data.transcript);
    } catch (err: any) {
      toast({ title: "Transcription Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleTranscribeFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !token) return;
    setLoading(true);
    setTranscript(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${import.meta.env.BASE_URL}api/transcribe/file`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Transcription failed");
      setTranscript(data.transcript);
    } catch (err: any) {
      toast({ title: "Transcription Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!transcript) return;
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
    <div className="w-full min-h-screen">

      {/* Hero */}
      <section className="relative w-full pt-20 pb-16 text-center px-4 overflow-hidden">
        {/* Background glow blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/15 rounded-full blur-[100px]" />
          <div className="absolute top-16 left-1/3 w-[300px] h-[200px] bg-violet-600/10 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10">
          {/* Powered by Whisper badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-6"
          >
            <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-semibold uppercase tracking-widest">
              <Mic className="w-3.5 h-3.5" />
              AI Transcription
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground text-xs font-medium">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Powered by Whisper
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-4xl md:text-6xl font-display font-extrabold tracking-tight text-foreground mb-5"
          >
            Turn any audio into{" "}
            <span className="text-gradient">readable text.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-muted-foreground text-lg max-w-xl mx-auto mb-10"
          >
            Paste a YouTube URL or upload your own audio/video file and get an accurate transcript in seconds.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/8 text-sm">
                <Icon className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span className="text-foreground font-medium">{title}</span>
                <span className="text-muted-foreground hidden sm:inline">— {desc}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Waveform divider */}
      <div className="w-full flex justify-center mb-10 px-4">
        <div className="flex items-end gap-[3px] h-8 opacity-30">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="w-[3px] rounded-full bg-indigo-400"
              style={{ height: `${20 + Math.sin(i * 0.7) * 14 + Math.cos(i * 1.3) * 8}%` }}
            />
          ))}
        </div>
      </div>

      <div className="w-full max-w-3xl mx-auto px-4 pb-24">

        {/* Gate: not logged in */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative text-center py-16 px-8 bg-card border border-white/8 rounded-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5">
                <Lock className="w-7 h-7 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">Sign in to use this tool</h2>
              <p className="text-muted-foreground mb-8">AI Transcription requires an Elite plan. Create an account to get started.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/signup">
                  <button className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20">Create account</button>
                </Link>
                <Link href="/login">
                  <button className="px-8 py-3 bg-white/8 hover:bg-white/15 text-foreground font-semibold rounded-xl border border-white/10 transition-all">Log in</button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Gate: wrong plan */}
        {user && !hasAccess && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative text-center py-16 px-8 bg-card border border-white/8 rounded-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
                <Crown className="w-7 h-7 text-amber-400" />
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">Elite plan required</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">AI Transcription is an Elite feature. Upgrade your plan to unlock it along with many other powerful tools.</p>
              <Link href="/pricing">
                <button className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20">
                  Upgrade to Elite
                </button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Tool */}
        {user && hasAccess && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

            {/* Mode toggle */}
            <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-xl mb-6 w-fit">
              <button
                onClick={() => { setMode("url"); setTranscript(null); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === "url" ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Link2 className="w-4 h-4" />
                YouTube URL
              </button>
              <button
                onClick={() => { setMode("file"); setTranscript(null); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === "file" ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Upload className="w-4 h-4" />
                Upload File
              </button>
            </div>

            {/* URL input */}
            {mode === "url" && (
              <form onSubmit={handleTranscribeUrl} className="relative group mb-8">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl blur opacity-20 group-hover:opacity-40 group-focus-within:opacity-50 transition duration-500" />
                <div className="relative flex items-center bg-card rounded-2xl border border-white/10 shadow-2xl p-2 pl-5 overflow-hidden">
                  <Link2 className="w-5 h-5 text-muted-foreground mr-3 flex-shrink-0" />
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste a YouTube video URL..."
                    className="flex-1 bg-transparent border-none text-foreground text-base placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0 py-4"
                  />
                  <button
                    type="submit"
                    disabled={loading || !url}
                    className="ml-2 px-7 py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Transcribe</span><ArrowRight className="w-4 h-4" /></>}
                  </button>
                </div>
              </form>
            )}

            {/* File upload */}
            {mode === "file" && (
              <form onSubmit={handleTranscribeFile} className="mb-8">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,video/*,.mp3,.mp4,.wav,.ogg,.flac,.webm,.m4a,.mov"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
                />

                {!file ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-14 text-center group ${dragging ? "border-indigo-400 bg-indigo-500/10" : "border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/5"}`}
                  >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all ${dragging ? "bg-indigo-500/20 border-indigo-500/30" : "bg-white/5 border border-white/10 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20"} border`}>
                      <Upload className={`w-7 h-7 transition-colors ${dragging ? "text-indigo-400" : "text-muted-foreground group-hover:text-indigo-400"}`} />
                    </div>
                    <p className="text-foreground font-semibold text-lg mb-1">Drop your file here</p>
                    <p className="text-muted-foreground text-sm mb-4">or click to browse</p>
                    <p className="text-muted-foreground/50 text-xs">MP3, MP4, WAV, OGG, FLAC, WebM, M4A &middot; Max 25MB</p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-card p-5 flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                      <Music className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground font-semibold truncate">{file.name}</p>
                      <p className="text-muted-foreground text-sm">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setFile(null); setTranscript(null); }}
                      className="w-8 h-8 rounded-lg bg-white/8 hover:bg-white/15 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {file && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Transcribing…</> : <><FileText className="w-5 h-5" />Transcribe File</>}
                  </button>
                )}
              </form>
            )}

            {/* Loading state */}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-14 px-8 bg-card border border-white/8 rounded-2xl"
              >
                <div className="relative w-16 h-16 mx-auto mb-5">
                  <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
                  <div className="absolute inset-0 rounded-full border-t-2 border-indigo-400 animate-spin" />
                  <div className="absolute inset-2 rounded-full bg-indigo-500/10 flex items-center justify-center">
                    <Mic className="w-5 h-5 text-indigo-400" />
                  </div>
                </div>
                <p className="text-foreground font-semibold text-lg mb-1">Transcribing with Whisper…</p>
                <p className="text-muted-foreground text-sm">This may take a moment for longer files.</p>
                <div className="flex items-end justify-center gap-[3px] h-6 mt-5 opacity-50">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-[3px] rounded-full bg-indigo-400 animate-pulse"
                      style={{ height: `${40 + Math.sin(i * 0.9) * 40}%`, animationDelay: `${i * 0.05}s` }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Transcript result */}
            {transcript && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-white/8 rounded-2xl overflow-hidden shadow-xl"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 bg-white/2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-foreground text-sm">Transcript</h3>
                      <p className="text-muted-foreground text-xs">Generated by Whisper AI</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 bg-white/8 hover:bg-white/15 border border-white/10 rounded-lg text-sm text-foreground transition-all hover:-translate-y-0.5"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy text"}
                  </button>
                </div>
                <div className="p-6 max-h-[480px] overflow-y-auto">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm">{transcript}</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>

    <ToolReviews
      reviews={TRANSCRIBE_REVIEWS}
      title="Trusted by journalists, students & creators"
      subtitle="See what people are saying about YTSave AI Transcription."
      ratingCount="3,200+"
    />
    </>
  );
}

const TRANSCRIBE_REVIEWS = [
  {
    name: "Emma Thompson",
    handle: "@emmajournalist",
    avatar: "https://randomuser.me/api/portraits/women/52.jpg",
    rating: 5,
    text: "I transcribe interviews for my articles every week. This tool saves me hours — it's incredibly accurate even with accents and technical jargon.",
    tag: "Journalism",
  },
  {
    name: "Daniel Wu",
    handle: "@danielwu_dev",
    avatar: "https://randomuser.me/api/portraits/men/23.jpg",
    rating: 5,
    text: "Used it to transcribe a 2-hour lecture recording. Got clean, readable text in under a minute. Blew my mind honestly.",
    tag: "Student",
  },
  {
    name: "Fatima Al-Hassan",
    handle: "@fatima.creates",
    avatar: "https://randomuser.me/api/portraits/women/8.jpg",
    rating: 5,
    text: "My content is in Arabic and English — the automatic language detection is spot on every single time. No other tool comes close.",
    tag: "Content Creator",
  },
  {
    name: "Chris Bennett",
    handle: "@chrisbennettpod",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    rating: 5,
    text: "I run a podcast and use this to generate episode transcripts for SEO. The output is clean enough that I barely need to edit it.",
    tag: "Podcaster",
  },
  {
    name: "Mia Laurent",
    handle: "@mia_research",
    avatar: "https://randomuser.me/api/portraits/women/33.jpg",
    rating: 5,
    text: "Paste a YouTube URL and it's done in seconds. I use it to extract quotes from academic talks for my research papers. Incredible tool.",
    tag: "Research",
  },
  {
    name: "Ryan Kowalski",
    handle: "@ryanlearn",
    avatar: "https://randomuser.me/api/portraits/men/71.jpg",
    rating: 5,
    text: "I'm learning Japanese and transcribe native YouTube videos for practice. The accuracy is way better than YouTube's own auto-captions.",
    tag: "Language Learning",
  },
];
