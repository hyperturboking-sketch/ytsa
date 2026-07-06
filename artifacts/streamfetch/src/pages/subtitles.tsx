import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Subtitles, Link2, Upload, ArrowRight, Loader2, Download,
  FileText, Music, X, Sparkles, Globe, Clock, Zap, Lock, Crown, Info, ChevronDown, ChevronUp
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useSEO } from "@/hooks/use-seo";
import { ToolReviews } from "@/components/ToolReviews";

type Mode = "url" | "file";

interface SubtitleResult {
  srt: string | null;
  vtt: string | null;
  title?: string;
  language?: string | null;
  source: "embedded" | "generated" | "none";
  segments: Array<{ start: string; end: string; text: string }>;
  message?: string;
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function safeName(title?: string) {
  if (!title) return "subtitles";
  return title.replace(/[^a-z0-9]/gi, "_").toLowerCase().slice(0, 60);
}

export default function SubtitlesPage() {
  useSEO({
    title: "Subtitle Downloader – Extract & Generate YouTube Subtitles | YTSave",
    description: "Download YouTube subtitles as SRT or VTT files. Upload your own video/audio file to auto-generate subtitles with AI. Supports 99+ languages.",
    keywords: "subtitle downloader, youtube subtitles, srt download, vtt download, generate subtitles, ai subtitles, caption generator, youtube captions download",
    canonical: "/tools/subtitles",
  });

  const { user, token } = useAuthStore();
  const { toast } = useToast();

  const [mode, setMode] = useState<Mode>("url");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<SubtitleResult | null>(null);
  const [showAllSegments, setShowAllSegments] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasProAccess = user?.isAdmin || ["pro", "elite"].includes(user?.plan ?? "free");

  const handleFileSelect = (selected: File) => {
    const maxSize = 50 * 1024 * 1024;
    if (selected.size > maxSize) {
      toast({ title: "File too large", description: "Maximum file size is 50MB.", variant: "destructive" });
      return;
    }
    setFile(selected);
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  };

  const handleFetchUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/subtitles/youtube`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to fetch subtitles");
      setResult(data);
      if (data.source === "none") {
        toast({
          title: "No embedded subtitles",
          description: "This video doesn't have subtitles. You can generate them with AI (Pro required).",
        });
      }
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFromUrl = async () => {
    if (!url || !token) return;
    setGenerating(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/subtitles/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Generation failed");
      setResult(data);
      toast({ title: "Subtitles generated!", description: "AI subtitles are ready to download." });
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !token) return;
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${import.meta.env.BASE_URL}api/subtitles/file`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Subtitle generation failed");
      setResult(data);
      toast({ title: "Subtitles ready!", description: "AI subtitles generated successfully." });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const visibleSegments = result?.segments
    ? showAllSegments ? result.segments : result.segments.slice(0, 4)
    : [];

  return (
    <>
      <div className="w-full min-h-screen">

        {/* Hero */}
        <section className="relative w-full pt-20 pb-16 text-center px-4 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[320px] bg-teal-500/12 rounded-full blur-[100px]" />
            <div className="absolute top-16 right-1/4 w-[300px] h-[200px] bg-cyan-500/8 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-1/4 w-[250px] h-[150px] bg-emerald-500/8 rounded-full blur-[70px]" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-3 mb-6"
            >
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-600 dark:text-teal-400 text-xs font-semibold uppercase tracking-widest">
                <Subtitles className="w-3.5 h-3.5" />
                Subtitle Tool
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary border border-border text-muted-foreground text-xs font-medium">
                <Sparkles className="w-3 h-3 text-amber-500" />
                AI-powered
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="text-4xl md:text-6xl font-display font-extrabold tracking-tight text-foreground mb-5"
            >
              Download & generate{" "}
              <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
                subtitles.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-muted-foreground text-lg max-w-xl mx-auto mb-10 font-medium"
            >
              Extract embedded YouTube captions or upload any video/audio file — get perfectly timed SRT &amp; VTT subtitle files instantly.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.22 }}
              className="flex flex-wrap items-center justify-center gap-3"
            >
              {[
                { icon: Globe, text: "99+ Languages" },
                { icon: Clock, text: "Timestamped SRT & VTT" },
                { icon: Zap, text: "YouTube captions free" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary border border-border text-sm">
                  <Icon className="w-4 h-4 text-teal-500 flex-shrink-0" />
                  <span className="text-foreground font-medium">{text}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Main tool */}
        <div className="w-full max-w-3xl mx-auto px-4 pb-24">

          {/* Mode tabs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-1 p-1 bg-secondary border border-border rounded-xl mb-6 w-fit"
          >
            {([
              { key: "url", icon: Link2, label: "YouTube URL" },
              { key: "file", icon: Upload, label: "Upload File" },
            ] as const).map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => { setMode(key); setResult(null); setFile(null); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  mode === key
                    ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </motion.div>

          {/* YouTube URL Mode */}
          <AnimatePresence mode="wait">
            {mode === "url" && (
              <motion.div
                key="url-mode"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <form onSubmit={handleFetchUrl} className="relative group mb-4">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl blur opacity-15 group-hover:opacity-30 group-focus-within:opacity-35 transition duration-500" />
                  <div className="relative flex items-center bg-card rounded-2xl border border-border shadow-md p-2 pl-5 overflow-hidden">
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
                      disabled={loading || generating || !url}
                      className="ml-2 px-7 py-4 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Fetch Subtitles</span><ArrowRight className="w-4 h-4" /></>}
                    </button>
                  </div>
                </form>

                <p className="text-xs text-muted-foreground mb-8 flex items-center gap-1.5 px-1">
                  <Info className="w-3.5 h-3.5 flex-shrink-0" />
                  Fetching YouTube's built-in captions is free. Generating AI subtitles when none exist requires a Pro plan.
                </p>

                {/* No subtitles found — offer AI generation */}
                {result?.source === "none" && !generating && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5 p-6 mb-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25 flex items-center justify-center flex-shrink-0">
                        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1">
                        {result.title && <p className="text-sm font-semibold text-foreground mb-1">"{result.title}"</p>}
                        <p className="text-sm text-muted-foreground mb-4">
                          This video doesn't have embedded subtitles. You can generate accurate AI subtitles using Whisper.
                        </p>
                        {!user ? (
                          <div className="flex gap-3">
                            <Link href="/signup">
                              <button className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl text-sm transition-all">
                                Create account
                              </button>
                            </Link>
                            <Link href="/pricing">
                              <button className="px-5 py-2.5 bg-secondary border border-border text-foreground font-semibold rounded-xl text-sm transition-all">
                                View plans
                              </button>
                            </Link>
                          </div>
                        ) : !hasProAccess ? (
                          <Link href="/pricing">
                            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold rounded-xl text-sm transition-all hover:-translate-y-0.5 shadow-lg shadow-violet-500/20">
                              <Crown className="w-4 h-4" />
                              Upgrade to Pro
                            </button>
                          </Link>
                        ) : (
                          <button
                            onClick={handleGenerateFromUrl}
                            disabled={generating}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50 shadow-lg shadow-teal-500/20"
                          >
                            <Sparkles className="w-4 h-4" />
                            Generate with AI
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* File Upload Mode */}
            {mode === "file" && (
              <motion.div
                key="file-mode"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                {/* Not logged in */}
                {!user && (
                  <div className="rounded-2xl border border-border bg-card p-8 text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-6 h-6 text-teal-500" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Sign in to use this tool</h3>
                    <p className="text-muted-foreground text-sm mb-5">File subtitle generation requires a Pro plan. Create an account to get started.</p>
                    <div className="flex gap-3 justify-center">
                      <Link href="/signup"><button className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl text-sm">Create account</button></Link>
                      <Link href="/login"><button className="px-6 py-2.5 bg-secondary border border-border text-foreground font-semibold rounded-xl text-sm">Log in</button></Link>
                    </div>
                  </div>
                )}

                {/* Logged in but not Pro */}
                {user && !hasProAccess && (
                  <div className="rounded-2xl border border-violet-200 dark:border-violet-500/20 bg-violet-50 dark:bg-violet-500/5 p-8 text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
                      <Crown className="w-6 h-6 text-violet-500" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Pro plan required</h3>
                    <p className="text-muted-foreground text-sm mb-5">Generating subtitles from uploaded files requires a Pro or Elite plan.</p>
                    <Link href="/pricing">
                      <button className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold rounded-xl text-sm hover:-translate-y-0.5 transition-all shadow-lg shadow-violet-500/20">
                        Upgrade to Pro
                      </button>
                    </Link>
                  </div>
                )}

                {user && hasProAccess && (
                  <form onSubmit={handleUploadFile}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*,video/*,.mp3,.mp4,.wav,.ogg,.flac,.webm,.m4a,.mov,.mkv,.avi"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
                    />

                    {!file ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                        className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-14 text-center group mb-6 ${
                          dragging
                            ? "border-teal-400 bg-teal-500/10"
                            : "border-border hover:border-teal-500/40 hover:bg-teal-500/5"
                        }`}
                      >
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border transition-all ${
                          dragging ? "bg-teal-500/20 border-teal-500/30" : "bg-secondary border-border group-hover:bg-teal-500/10 group-hover:border-teal-500/20"
                        }`}>
                          <Upload className={`w-7 h-7 transition-colors ${dragging ? "text-teal-500" : "text-muted-foreground group-hover:text-teal-500"}`} />
                        </div>
                        <p className="text-foreground font-semibold text-lg mb-1">Drop your file here</p>
                        <p className="text-muted-foreground text-sm mb-4">or click to browse</p>
                        <p className="text-muted-foreground/50 text-xs">MP3, MP4, WAV, OGG, FLAC, WebM, M4A, MKV, AVI &middot; Max 50MB</p>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center flex-shrink-0">
                          <Music className="w-6 h-6 text-teal-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground font-semibold truncate">{file.name}</p>
                          <p className="text-muted-foreground text-sm">{formatFileSize(file.size)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setFile(null); setResult(null); }}
                          className="w-8 h-8 rounded-lg bg-secondary hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {file && (
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading
                          ? <><Loader2 className="w-5 h-5 animate-spin" />Generating subtitles…</>
                          : <><Subtitles className="w-5 h-5" />Generate Subtitles</>
                        }
                      </button>
                    )}
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading / generating state */}
          {(loading || generating) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-14 px-8 bg-card border border-border rounded-2xl mt-4"
            >
              <div className="relative w-16 h-16 mx-auto mb-5">
                <div className="absolute inset-0 rounded-full border-2 border-teal-500/20" />
                <div className="absolute inset-0 rounded-full border-t-2 border-teal-500 animate-spin" />
                <div className="absolute inset-2 rounded-full bg-teal-500/10 flex items-center justify-center">
                  <Subtitles className="w-5 h-5 text-teal-500" />
                </div>
              </div>
              <p className="text-foreground font-semibold text-lg mb-1">
                {generating ? "Generating subtitles with AI…" : "Fetching subtitles…"}
              </p>
              <p className="text-muted-foreground text-sm">
                {generating ? "Downloading audio and running Whisper — this may take a minute." : "Looking for embedded captions on this video."}
              </p>
            </motion.div>
          )}

          {/* Results */}
          <AnimatePresence>
            {result && result.source !== "none" && result.srt && !loading && !generating && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 rounded-2xl border border-border bg-card overflow-hidden shadow-lg"
              >
                {/* Result header */}
                <div className="px-6 py-4 border-b border-border bg-secondary/40 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-teal-500" />
                    </div>
                    <div>
                      {result.title && (
                        <p className="text-sm font-bold text-foreground line-clamp-1">{result.title}</p>
                      )}
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          result.source === "embedded"
                            ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                            : "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20"
                        }`}>
                          {result.source === "embedded" ? "YouTube Captions" : "AI Generated"}
                        </span>
                        {result.language && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Globe className="w-3 h-3" />{result.language.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Download buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => downloadFile(result.srt!, `${safeName(result.title)}.srt`, "text/plain")}
                      className="flex items-center gap-1.5 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl text-sm transition-all hover:-translate-y-0.5 shadow-sm shadow-teal-500/20"
                    >
                      <Download className="w-4 h-4" />
                      .SRT
                    </button>
                    <button
                      onClick={() => downloadFile(result.vtt!, `${safeName(result.title)}.vtt`, "text/vtt")}
                      className="flex items-center gap-1.5 px-4 py-2 bg-secondary hover:bg-muted border border-border text-foreground font-semibold rounded-xl text-sm transition-all hover:-translate-y-0.5"
                    >
                      <Download className="w-4 h-4" />
                      .VTT
                    </button>
                  </div>
                </div>

                {/* Subtitle preview */}
                <div className="p-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Preview</p>
                  <div className="space-y-2">
                    {visibleSegments.map((seg, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <span className="text-[11px] font-mono text-teal-600 dark:text-teal-400 bg-teal-500/8 border border-teal-500/15 rounded px-1.5 py-0.5 whitespace-nowrap mt-0.5 flex-shrink-0">
                          {seg.start.split(",")[0]}
                        </span>
                        <p className="text-sm text-foreground leading-relaxed">{seg.text}</p>
                      </div>
                    ))}
                  </div>

                  {result.segments.length > 4 && (
                    <button
                      onClick={() => setShowAllSegments(!showAllSegments)}
                      className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
                    >
                      {showAllSegments ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      {showAllSegments ? "Show less" : `Show ${result.segments.length - 4} more lines`}
                    </button>
                  )}

                  <p className="mt-4 text-xs text-muted-foreground/60 italic">
                    Showing preview only. Download the file for the complete subtitles.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ToolReviews
        reviews={SUBTITLE_REVIEWS}
        title="Used by creators worldwide"
        subtitle="Trusted for extracting and generating subtitles for videos in any language."
        ratingCount="4,800+"
      />
    </>
  );
}

const SUBTITLE_REVIEWS = [
  {
    name: "Carlos Mendez",
    handle: "@carlosmvideo",
    avatar: "https://randomuser.me/api/portraits/men/41.jpg",
    rating: 5,
    text: "I needed SRT files for a Spanish YouTube series and this grabbed them perfectly. Downloaded in seconds, no fuss.",
    tag: "YouTube",
  },
  {
    name: "Sophie Williams",
    handle: "@sophiewcreates",
    avatar: "https://randomuser.me/api/portraits/women/61.jpg",
    rating: 5,
    text: "The AI generation blew me away — uploaded a raw video interview and got perfectly timed subtitles in under 2 minutes.",
    tag: "AI Generated",
  },
  {
    name: "Aarav Patel",
    handle: "@aaravpatel_ed",
    avatar: "https://randomuser.me/api/portraits/men/55.jpg",
    rating: 5,
    text: "I subtitle educational content in Hindi. The language detection is spot on — I don't need to configure anything.",
    tag: "Education",
  },
  {
    name: "Chloe Martin",
    handle: "@chloe.media",
    avatar: "https://randomuser.me/api/portraits/women/72.jpg",
    rating: 5,
    text: "Getting VTT files from YouTube was always a pain. Now it's one click and done. Huge time saver for my workflow.",
    tag: "VTT Files",
  },
  {
    name: "Jake Thompson",
    handle: "@jakethompson_yt",
    avatar: "https://randomuser.me/api/portraits/men/18.jpg",
    rating: 5,
    text: "Needed subtitles for accessibility on all my videos. The batch-friendly workflow and clean SRT output is exactly what I needed.",
    tag: "Accessibility",
  },
  {
    name: "Yuki Tanaka",
    handle: "@yukitanaka_jp",
    avatar: "https://randomuser.me/api/portraits/women/38.jpg",
    rating: 5,
    text: "I translate Japanese YouTube videos. Being able to grab the original captions in SRT format saves hours of manual work.",
    tag: "Translation",
  },
];
