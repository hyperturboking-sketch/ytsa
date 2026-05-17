import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { BLOG_POSTS, formatDate } from "@/data/blog-posts";
import { useSEO } from "@/hooks/use-seo";
import BlogCover from "@/components/BlogCover";

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

      {/* PAGE HEADER */}
      <section className="w-full py-10 sm:py-16 border-b border-border bg-gradient-to-b from-violet-50/70 via-background to-background dark:from-violet-950/20 dark:via-background relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-violet-200/40 to-indigo-100/20 dark:from-violet-900/20 dark:to-transparent blur-3xl pointer-events-none" />
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

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

        {/* FEATURED POST */}
        <motion.div {...fadeUp(0)} className="mb-10 sm:mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Featured</p>
          <Link href={`/blog/${featured.slug}`}>
            <div className="group rounded-3xl overflow-hidden border border-border bg-card hover:border-primary/40 hover:shadow-2xl transition-all duration-300 cursor-pointer">
              {/* Cover image */}
              <div className="relative overflow-hidden">
                <BlogCover
                  emoji={featured.coverEmoji}
                  gradient={featured.coverGradient}
                  pattern={featured.coverPattern}
                  size="card"
                  className="h-48 sm:h-72 group-hover:scale-[1.02] transition-transform duration-500"
                />
                {/* Category badge overlaid on cover */}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-lg">
                    {featured.category}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs font-medium shadow-lg">
                    <Clock className="w-3 h-3" /> {featured.readTime} min read
                  </span>
                </div>
              </div>

              {/* Card body */}
              <div className="p-5 sm:p-8">
                <p className="text-xs text-muted-foreground mb-2">{formatDate(featured.publishedAt)}</p>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors leading-snug">
                  {featured.title}
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-4">{featured.excerpt}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all duration-200">
                  Read article <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* ALL OTHER POSTS */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-5">All Articles</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map((post, i) => (
              <motion.div key={post.slug} {...fadeUp(i * 0.06)} className="h-full">
                <Link href={`/blog/${post.slug}`}>
                  <div className="group h-full rounded-2xl overflow-hidden border border-border bg-card hover:border-primary/40 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col">

                    {/* Cover */}
                    <div className="relative overflow-hidden flex-shrink-0">
                      <BlogCover
                        emoji={post.coverEmoji}
                        gradient={post.coverGradient}
                        pattern={post.coverPattern}
                        size="card"
                        className="h-36 sm:h-44 group-hover:scale-[1.03] transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border backdrop-blur-sm ${categoryColors[post.category] ?? "bg-secondary text-foreground border-border"}`}>
                          {post.category}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-4 sm:p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span>{post.readTime} min read</span>
                        <span className="ml-auto">{formatDate(post.publishedAt)}</span>
                      </div>
                      <h3 className="font-display font-bold text-sm sm:text-base text-foreground mb-2 group-hover:text-primary transition-colors leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-3 mb-3">
                        {post.excerpt}
                      </p>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-1.5 transition-all mt-auto">
                        Read article <ArrowRight className="w-3 h-3" />
                      </span>
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
