import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { BLOG_POSTS, formatDate } from "@/data/blog-posts";
import { useSEO } from "@/hooks/use-seo";

const categoryColors: Record<string, string> = {
  Tutorials: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700",
  Guides: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700",
  Explainers: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32, filter: "blur(4px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function Blog() {
  useSEO({
    title: "Blog – Video Downloading Tips, Guides & Tutorials | YTSave",
    description: "Learn how to download YouTube videos, TikToks, Instagram Reels and more. Guides on formats, quality settings, and getting the most out of YTSave.",
    keywords: "youtube download guide, tiktok download tutorial, instagram reels download, video formats explained, mp4 vs mp3, youtube to mp3",
    canonical: "/blog",
  });

  const [featured, ...rest] = BLOG_POSTS;

  return (
    <div className="w-full flex flex-col items-center">

      {/* HERO */}
      <section className="w-full py-12 sm:py-20 border-b border-border bg-gradient-to-b from-violet-50/70 via-background to-background dark:from-violet-950/20 dark:via-background relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-violet-200/40 to-indigo-100/20 dark:from-violet-900/20 dark:to-transparent blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/40 border border-violet-200 dark:border-violet-700 text-violet-700 dark:text-violet-300 text-xs font-bold uppercase tracking-wider mb-4">
              <Tag className="w-3 h-3" /> YTSave Blog
            </span>
            <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-foreground tracking-tight mb-3 leading-tight">
              Tips, Guides &{" "}
              <span className="bg-gradient-to-r from-violet-500 to-indigo-400 bg-clip-text text-transparent">
                Tutorials
              </span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl">
              Everything you need to know about downloading videos, picking the right format, and getting the most out of YTSave.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">

        {/* FEATURED POST */}
        <motion.div {...fadeUp(0)} className="mb-10 sm:mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Featured</p>
          <Link href={`/blog/${featured.slug}`}>
            <div className="group relative rounded-3xl overflow-hidden border border-border bg-card hover:border-primary/40 hover:shadow-xl transition-all duration-300 cursor-pointer">
              <div className={`h-2 w-full bg-gradient-to-r ${featured.coverGradient}`} />
              <div className="p-6 sm:p-10 flex flex-col sm:flex-row gap-6 sm:gap-10 items-start">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-2xl bg-gradient-to-br ${featured.coverGradient} flex items-center justify-center text-3xl sm:text-4xl shadow-lg`}>
                  {featured.coverEmoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${categoryColors[featured.category] ?? "bg-secondary text-foreground border-border"}`}>
                      {featured.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" /> {featured.readTime} min read
                    </span>
                    <span className="text-xs text-muted-foreground">{formatDate(featured.publishedAt)}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors leading-snug">
                    {featured.title}
                  </h2>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-4">{featured.excerpt}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all duration-200">
                    Read article <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* REST OF POSTS */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">All Articles</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {rest.map((post, i) => (
              <motion.div key={post.slug} {...fadeUp(i * 0.07)}>
                <Link href={`/blog/${post.slug}`}>
                  <div className="group h-full rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden flex flex-col">
                    <div className={`h-1.5 w-full bg-gradient-to-r ${post.coverGradient}`} />
                    <div className="p-5 sm:p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${post.coverGradient} flex items-center justify-center text-xl shadow-sm flex-shrink-0`}>
                          {post.coverEmoji}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${categoryColors[post.category] ?? "bg-secondary text-foreground border-border"}`}>
                            {post.category}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Clock className="w-3 h-3" /> {post.readTime} min
                          </span>
                        </div>
                      </div>
                      <h3 className="font-display font-bold text-base sm:text-lg text-foreground mb-2 group-hover:text-primary transition-colors leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-xs text-muted-foreground/70">{formatDate(post.publishedAt)}</span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all duration-200">
                          Read <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
