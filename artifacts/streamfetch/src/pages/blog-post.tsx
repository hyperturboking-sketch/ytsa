import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Tag, ArrowRight } from "lucide-react";
import { getBlogPost, BLOG_POSTS, formatDate } from "@/data/blog-posts";
import NotFound from "@/pages/not-found";
import { useSEO } from "@/hooks/use-seo";
import BlogCover from "@/components/BlogCover";

const categoryColors: Record<string, string> = {
  Tutorials: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700",
  Guides: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700",
  Explainers: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
};

function renderMarkdown(md: string): React.ReactNode[] {
  const lines = md.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    if (line.startsWith("## ")) {
      nodes.push(<h2 key={i} className="text-xl sm:text-2xl font-display font-bold text-foreground mt-8 mb-3">{line.slice(3)}</h2>);
      i++; continue;
    }
    if (line.startsWith("### ")) {
      nodes.push(<h3 key={i} className="text-base sm:text-lg font-display font-bold text-foreground mt-6 mb-2">{line.slice(4)}</h3>);
      i++; continue;
    }

    if (line.startsWith("> ")) {
      nodes.push(
        <blockquote key={i} className="my-4 pl-4 border-l-4 border-primary/50 bg-primary/5 dark:bg-primary/10 py-3 pr-4 rounded-r-xl text-sm text-foreground/80 italic">
          {inlineFormat(line.slice(2))}
        </blockquote>
      );
      i++; continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        items.push(lines[i].slice(2));
        i++;
      }
      nodes.push(
        <ul key={`ul-${i}`} className="my-3 space-y-1.5 pl-2">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2.5 text-sm sm:text-base text-foreground/85">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary/70 flex-shrink-0" />
              <span>{inlineFormat(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ""));
        i++;
      }
      nodes.push(
        <ol key={`ol-${i}`} className="my-3 space-y-1.5 pl-5 list-decimal">
          {items.map((item, j) => (
            <li key={j} className="text-sm sm:text-base text-foreground/85 pl-1">{inlineFormat(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        if (!lines[i].match(/^\|[-| ]+\|$/)) tableLines.push(lines[i]);
        i++;
      }
      const [headerRow, ...dataRows] = tableLines;
      const headers = headerRow.split("|").map(s => s.trim()).filter(Boolean);
      const rows = dataRows.map(r => r.split("|").map(s => s.trim()).filter(Boolean));
      nodes.push(
        <div key={`table-${i}`} className="my-5 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/70">
              <tr>{headers.map((h, j) => <th key={j} className="px-4 py-2.5 text-left font-semibold text-foreground">{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, j) => (
                <tr key={j} className="border-t border-border">
                  {row.map((cell, k) => <td key={k} className="px-4 py-2.5 text-foreground/80">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    nodes.push(<p key={i} className="text-sm sm:text-base text-foreground/80 leading-relaxed my-3">{inlineFormat(line)}</p>);
    i++;
  }

  return nodes;
}

function inlineFormat(text: string): React.ReactNode {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i}>{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={i} className="px-1.5 py-0.5 rounded bg-secondary border border-border text-xs font-mono text-primary">{part.slice(1, -1)}</code>;
    return part;
  });
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = getBlogPost(slug);

  useSEO({
    title: post ? `${post.title} | YTSave Blog` : "Post Not Found | YTSave",
    description: post?.excerpt ?? "",
    canonical: `/blog/${slug}`,
  });

  if (!post) return <NotFound />;

  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div className="w-full flex flex-col items-center">

      {/* HERO COVER — full width */}
      <motion.div
        initial={{ opacity: 0, scale: 1.03 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full relative"
      >
        <BlogCover
          emoji={post.coverEmoji}
          gradient={post.coverGradient}
          pattern={post.coverPattern}
          size="hero"
        />
        {/* Overlaid meta on hero */}
        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
          <div className="max-w-3xl mx-auto w-full">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border backdrop-blur-md ${categoryColors[post.category] ?? "bg-black/40 text-white border-white/20"} !bg-black/40 !text-white !border-white/25`}>
                <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {post.category}</span>
              </span>
              <span className="flex items-center gap-1 text-xs text-white/80 bg-black/40 backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-lg">
                <Clock className="w-3 h-3" /> {post.readTime} min read
              </span>
              <span className="text-xs text-white/70">{formatDate(post.publishedAt)}</span>
            </div>
            <h1 className="text-xl sm:text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight leading-tight drop-shadow-lg">
              {post.title}
            </h1>
          </div>
        </div>
      </motion.div>

      {/* ARTICLE CONTENT */}
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-16">

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </motion.div>

        {/* Excerpt pull-quote */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-base sm:text-lg text-muted-foreground leading-relaxed border-l-4 border-primary/50 pl-4 mb-8 italic"
        >
          {post.excerpt}
        </motion.p>

        {/* Article body */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          {renderMarkdown(post.content)}
        </motion.article>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="mt-12 rounded-3xl overflow-hidden border border-primary/30 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/20 p-6 sm:p-8 text-center"
        >
          <div className="text-3xl mb-3">⬇️</div>
          <h3 className="text-lg sm:text-xl font-display font-bold text-foreground mb-2">Ready to download?</h3>
          <p className="text-sm text-muted-foreground mb-5">Paste any video URL and get your file in seconds — free, no sign-up needed.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-violet-600/25 transition-all duration-200 hover:-translate-y-0.5">
            Try YTSave Free <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-14">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-5">More Articles</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((rp) => (
                <Link key={rp.slug} href={`/blog/${rp.slug}`}>
                  <div className="group h-full rounded-2xl overflow-hidden border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col">
                    <div className="relative overflow-hidden">
                      <BlogCover
                        emoji={rp.coverEmoji}
                        gradient={rp.coverGradient}
                        pattern={rp.coverPattern}
                        size="card"
                        className="h-24 group-hover:scale-[1.04] transition-transform duration-400"
                      />
                    </div>
                    <div className="p-3.5 flex flex-col flex-1">
                      <h4 className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug mb-2 line-clamp-2">
                        {rp.title}
                      </h4>
                      <span className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-1.5 transition-all">
                        Read <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
