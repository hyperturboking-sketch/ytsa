import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

export interface Review {
  name: string;
  handle: string;
  avatar: string;
  rating: number;
  text: string;
  tag: string;
}

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

export function ToolReviews({
  reviews,
  title = "Trusted by thousands of users",
  subtitle,
  ratingCount = "10,000+",
}: {
  reviews: Review[];
  title?: string;
  subtitle?: string;
  ratingCount?: string;
}) {
  return (
    <section className="w-full bg-secondary/40 border-t border-border py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-medium mb-5">
            <Star className="w-4 h-4 fill-amber-500" />
            <span>{title}</span>
          </div>
          {subtitle && (
            <p className="text-muted-foreground max-w-xl mx-auto">{subtitle}</p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: "easeOut" }}
              className="relative bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 hover:border-primary/30 hover:shadow-md transition-all duration-300"
            >
              <Quote className="absolute top-4 right-4 w-6 h-6 text-primary/10" />

              <div className="flex items-center justify-between">
                <StarRating count={review.rating} />
                <span className="text-[11px] text-muted-foreground/60 font-medium bg-secondary px-2 py-0.5 rounded-full">
                  {review.tag}
                </span>
              </div>

              <p className="text-foreground/80 leading-relaxed text-sm flex-1">
                "{review.text}"
              </p>

              <div className="flex items-center gap-3 pt-3 border-t border-border">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-border"
                  loading="lazy"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">{review.name}</p>
                  <p className="text-xs text-muted-foreground">{review.handle}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 text-center"
        >
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {reviews.slice(0, 4).map((r, i) => (
                <img
                  key={i}
                  src={r.avatar}
                  alt={r.name}
                  className="w-8 h-8 rounded-full border-2 border-background object-cover"
                  loading="lazy"
                />
              ))}
            </div>
            <div className="flex flex-col items-start gap-0.5">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-sm font-bold text-foreground ml-1">4.9</span>
              </div>
              <span className="text-xs text-muted-foreground">
                from <span className="font-semibold text-foreground">{ratingCount}</span> reviews
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
