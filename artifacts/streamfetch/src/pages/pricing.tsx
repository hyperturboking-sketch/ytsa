import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Check, Zap, Star, Crown, Shield, Clock, Sparkles, ArrowRight, BadgePercent } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { useToast } from "@/hooks/use-toast";

const plans = [
  {
    name: "Basic",
    monthlyPrice: 1.99,
    fakeMonthlyPrice: 3.99,
    tagline: "Everything you need to get started.",
    icon: Zap,
    iconBg: "bg-cyan-50 border-cyan-200",
    iconColor: "text-cyan-600",
    accentColor: "cyan",
    borderClass: "border-slate-200 dark:border-slate-700",
    glowColor: "rgba(8,145,178,0.07)",
    badgeClass: "bg-cyan-50 text-cyan-700 border-cyan-200",
    ctaClass: "bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white",
    cta: "Get Basic",
    features: [
      "Ad-free experience",
      "Unlimited downloads",
      "Resume downloads",
      "720p & 1080p quality",
      "Email support",
    ],
    popular: false,
  },
  {
    name: "Pro",
    monthlyPrice: 5.99,
    fakeMonthlyPrice: 9.99,
    tagline: "For power users who want it all.",
    icon: Star,
    iconBg: "bg-violet-50 border-violet-200 dark:bg-violet-950/30 dark:border-violet-800/40",
    iconColor: "text-violet-500",
    accentColor: "violet",
    borderClass: "border-violet-400/60",
    glowColor: "rgba(139,92,246,0.15)",
    badgeClass: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800/40",
    ctaClass: "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/30",
    cta: "Upgrade to Pro",
    features: [
      "All Basic features",
      "Batch downloads",
      "1440p & 4K quality",
      "Subtitles download",
      "Cloud sync",
      "Priority queue",
    ],
    popular: true,
  },
  {
    name: "Elite",
    monthlyPrice: 8.99,
    fakeMonthlyPrice: 14.99,
    tagline: "The ultimate download experience.",
    icon: Crown,
    iconBg: "bg-indigo-50 border-indigo-200",
    iconColor: "text-indigo-500",
    accentColor: "indigo",
    borderClass: "border-indigo-300/60",
    glowColor: "rgba(99,102,241,0.09)",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    ctaClass: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/25",
    cta: "Go Elite",
    features: [
      "All Pro features",
      "8K ultra-HD quality",
      "Multi-threaded turbo downloads",
      "AI transcription & summaries",
      "Metadata editing",
      "Dedicated priority support",
    ],
    popular: false,
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], type: "spring", stiffness: 120, damping: 18 } },
};

const trustBadges = [
  { icon: Shield, label: "7-day free trial" },
  { icon: Clock, label: "Cancel anytime" },
  { icon: BadgePercent, label: "No hidden fees" },
];

export default function Pricing() {
  useSEO({
    title: "Pricing Plans – Free, Basic $1.99, Pro $5.99, Elite $8.99 | YTSave",
    description: "YTSave is free to start. Upgrade to Basic ($1.99/mo) for ad-free downloads, Pro ($5.99/mo) for 4K quality and batch downloads, or Elite ($8.99/mo) for AI transcription and priority support.",
    keywords: "ytsave pricing, video downloader subscription, premium video downloader, ad-free downloader, 4k video downloader, batch downloader plan, youtube downloader pro",
    canonical: "/pricing",
  });

  const [isAnnual, setIsAnnual] = useState(false);
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      toast({ title: "Payment successful!", description: "Your plan has been activated." });
    } else if (params.get("payment") === "cancelled") {
      toast({ title: "Payment cancelled", description: "Your order was not completed.", variant: "destructive" });
    }
  }, [location]);

  const openCheckout = (plan: typeof plans[0]) => {
    navigate(`/checkout?plan=${plan.name.toLowerCase()}&billing=${isAnnual ? "annual" : "monthly"}`);
  };

  const getMonthlyOriginal = (plan: typeof plans[0]) => plan.fakeMonthlyPrice.toFixed(2);
  const getMonthlyPrice = (plan: typeof plans[0]) => plan.monthlyPrice.toFixed(2);
  const getAnnualOriginal = (plan: typeof plans[0]) => (plan.monthlyPrice * 12).toFixed(2);
  const getAnnualDiscounted = (plan: typeof plans[0]) => (plan.monthlyPrice * 12 * 0.8).toFixed(2);
  const getAnnualPerMonth = (plan: typeof plans[0]) => (plan.monthlyPrice * 0.8).toFixed(2);

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col items-center px-4 py-16 overflow-hidden relative">

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-violet-50/60 via-background to-background dark:from-violet-950/20 dark:via-background" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] -z-10 rounded-full bg-gradient-radial from-violet-200/30 via-transparent to-transparent dark:from-violet-900/20 blur-3xl pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30, filter: "blur(8px)", scale: 0.97 }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-10 max-w-2xl"
      >
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/40 border border-violet-200 dark:border-violet-700 text-violet-700 dark:text-violet-300 text-xs font-semibold uppercase tracking-wider mb-5">
          <Sparkles className="w-3.5 h-3.5" /> Limited-time offer
        </span>
        <h1 className="text-4xl md:text-6xl font-display font-extrabold text-foreground tracking-tight mb-4 leading-tight">
          Simple pricing,<br />
          <span className="text-gradient">extraordinary value</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Start free, upgrade when you're ready. Join 500,000+ users who switched to YTSave.
        </p>
      </motion.div>

      {/* Monthly / Annual Toggle */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="flex items-center gap-4 mb-12"
      >
        <span className={`text-sm font-semibold transition-colors ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
          Monthly
        </span>
        <button
          onClick={() => setIsAnnual(!isAnnual)}
          className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isAnnual ? "bg-violet-600" : "bg-slate-300 dark:bg-slate-600"}`}
          aria-label="Toggle billing period"
        >
          <span
            className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${isAnnual ? "translate-x-7" : "translate-x-0"}`}
          />
        </button>
        <span className={`text-sm font-semibold transition-colors ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
          Annual
        </span>
        <AnimatePresence>
          {isAnnual && (
            <motion.span
              key="save-badge"
              initial={{ opacity: 0, x: -8, scale: 0.85 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -8, scale: 0.85 }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-bold"
            >
              <BadgePercent className="w-3 h-3" /> Save 20%
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch"
      >
        {plans.map((plan) => {
          const Icon = plan.icon;

          return (
            <motion.div
              key={plan.name}
              variants={cardVariants}
              className={`relative flex flex-col rounded-3xl overflow-hidden transition-all duration-300 ${
                plan.popular
                  ? "p-[2px] gradient-border-pro shadow-2xl shadow-violet-600/20 hover:-translate-y-2 hover:shadow-violet-600/30"
                  : `border bg-card ${plan.borderClass} shadow-md hover:shadow-xl hover:-translate-y-1`
              }`}
            >
              {plan.popular && (
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-600/5 via-transparent to-indigo-500/5 pointer-events-none" />
              )}
              <div className={plan.popular ? "flex flex-col flex-1 rounded-[22px] bg-card overflow-hidden" : "flex flex-col flex-1"}>

              {/* Glow */}
              <div
                className="absolute inset-0 pointer-events-none rounded-3xl"
                style={{ background: plan.popular
                  ? `radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.2), transparent 60%)`
                  : `radial-gradient(ellipse at 50% 0%, ${plan.glowColor}, transparent 70%)` }}
              />

              {/* Popular badge */}
              {plan.popular && (
                <div className="relative z-10 flex justify-center pt-0">
                  <div className="px-5 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[11px] font-bold uppercase tracking-widest rounded-b-xl shadow-lg shadow-violet-600/30">
                    ✦ Most Popular
                  </div>
                </div>
              )}

              <div className="relative z-10 flex flex-col flex-1 p-7">
                {/* Icon + plan name */}
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${plan.iconBg}`}>
                    <Icon className={`w-5 h-5 ${plan.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold">Plan</p>
                    <p className="text-base font-bold text-foreground leading-tight">{plan.name}</p>
                  </div>
                </div>

                {/* Price block */}
                <AnimatePresence mode="wait">
                  {isAnnual ? (
                    <motion.div
                      key="annual-price"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.22 }}
                      className="mb-1"
                    >
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-muted-foreground line-through">
                          ${getAnnualOriginal(plan)}/yr
                        </span>
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${plan.badgeClass} border`}>
                          20% OFF
                        </span>
                      </div>
                      <div className="flex items-end gap-1">
                        <span className="text-5xl font-display font-extrabold text-foreground leading-none">${getAnnualDiscounted(plan)}</span>
                        <span className="text-muted-foreground text-sm mb-1">/yr</span>
                      </div>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                        ≈ ${getAnnualPerMonth(plan)}/mo · billed once a year
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="monthly-price"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.22 }}
                      className="mb-1"
                    >
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-muted-foreground line-through">
                          ${getMonthlyOriginal(plan)}/mo
                        </span>
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${plan.badgeClass} border`}>
                          LIMITED
                        </span>
                      </div>
                      <div className="flex items-end gap-1">
                        <span className="text-5xl font-display font-extrabold text-foreground leading-none">${getMonthlyPrice(plan)}</span>
                        <span className="text-muted-foreground text-sm mb-1">/mo</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Billed monthly</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="text-sm text-muted-foreground mb-6 mt-2">{plan.tagline}</p>

                {/* Divider */}
                <div className="h-px bg-border mb-5" />

                {/* Features */}
                <ul className="flex-1 space-y-3 mb-7">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/85">
                      <span className={`mt-0.5 flex-shrink-0 w-4.5 h-4.5 w-[18px] h-[18px] rounded-full flex items-center justify-center ${plan.badgeClass} border`}>
                        <Check className="w-2.5 h-2.5" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => openCheckout(plan)}
                  className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 ${plan.ctaClass}`}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Trust badges */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-12 flex flex-wrap items-center justify-center gap-6"
      >
        {trustBadges.map(({ icon: BadgeIcon, label }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <BadgeIcon className="w-4 h-4 text-primary/70" />
            <span>{label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Social proof */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-8 text-center"
      >
        <p className="text-xs text-muted-foreground/60">
          Trusted by 500,000+ users worldwide &nbsp;·&nbsp; Prices in USD &nbsp;·&nbsp; Secure checkout
        </p>
      </motion.div>

    </div>
  );
}
