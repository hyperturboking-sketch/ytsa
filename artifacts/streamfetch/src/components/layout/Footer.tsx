import { Link } from "wouter";
import { Github, X, Youtube, Download } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full mt-auto border-t border-border bg-card/60 backdrop-blur-sm relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 group mb-5">
              <div className="relative">
                <div className="absolute -inset-3 bg-violet-500/30 rounded-3xl blur-2xl group-hover:bg-violet-400/50 transition-all duration-500 animate-[glow-pulse_3s_ease-in-out_infinite]" />
                <img
                  src={`${import.meta.env.BASE_URL}logo.png`}
                  alt="YTSave"
                  className="relative w-16 h-16 object-contain drop-shadow-[0_0_20px_rgba(139,92,246,0.5)] group-hover:drop-shadow-[0_0_32px_rgba(139,92,246,0.8)] group-hover:scale-110 transition-all duration-300"
                />
              </div>
              <span className="font-display font-bold text-3xl tracking-tight text-foreground">
                YTSave
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              The fastest, cleanest way to download videos and audio from across the web. Premium quality, zero compromises.
            </p>
            <div className="flex gap-3 mt-6">
              <a
                href="https://x.com/harmonyg1d"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/hyperturboking-sketch"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all duration-200"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://www.youtube.com/@Xeotiz"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all duration-200"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-5 text-sm uppercase tracking-wider">Product</h4>
            <ul className="space-y-3.5 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">Downloader</Link></li>
              <li><Link href="/tools" className="hover:text-primary transition-colors">Tools</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/tools/transcribe" className="hover:text-primary transition-colors">AI Transcribe</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-5 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-3.5 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">DMCA</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} YTSave. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/50">
            Supports 1000+ sites · Powered by yt-dlp
          </p>
        </div>
      </div>
    </footer>
  );
}
