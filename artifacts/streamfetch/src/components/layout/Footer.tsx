import { Link } from "wouter";
import { Github, X, Youtube } from "lucide-react";
import AppLogo from "@/components/AppLogo";

export default function Footer() {
  return (
    <footer className="w-full mt-auto border-t border-border bg-card/60 backdrop-blur-sm relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10">

          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 group mb-4">
              <AppLogo size={30} className="group-hover:opacity-90 transition-opacity duration-200" />
              <span className="font-display font-bold text-xl tracking-tight text-foreground">
                YTSave
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              The fastest, cleanest way to download videos and audio from across the web. Premium quality, zero compromises.
            </p>
            <div className="flex gap-2.5 mt-4 sm:mt-6">
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

        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
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
