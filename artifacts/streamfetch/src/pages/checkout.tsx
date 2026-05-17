import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, Link } from "wouter";
import {
  Shield, Lock, Check, Tag, Loader2,
  CheckCircle2, XCircle, ExternalLink, ArrowLeft,
  Zap, Star, Crown, AlertCircle, CreditCard,
  ChevronRight, RefreshCw, BadgeCheck
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import AppLogo from "@/components/AppLogo";

const PLANS: Record<string, {
  name: string; icon: typeof Zap; color: string; gradient: string; ringColor: string;
  monthlyPrice: number; annualPrice: number; features: string[];
}> = {
  basic: {
    name: "Basic", icon: Zap, color: "text-cyan-400",
    gradient: "from-cyan-500 to-teal-500", ringColor: "ring-cyan-500/30",
    monthlyPrice: 1.99, annualPrice: 1.59,
    features: ["Ad-free experience", "Unlimited downloads", "Resume downloads", "720p & 1080p quality", "Email support"],
  },
  pro: {
    name: "Pro", icon: Star, color: "text-violet-400",
    gradient: "from-violet-500 to-indigo-500", ringColor: "ring-violet-500/30",
    monthlyPrice: 5.99, annualPrice: 4.79,
    features: ["All Basic features", "Batch downloads", "1440p & 4K quality", "Subtitles download", "Cloud sync", "Priority queue"],
  },
  elite: {
    name: "Elite", icon: Crown, color: "text-amber-400",
    gradient: "from-amber-500 to-orange-500", ringColor: "ring-amber-500/30",
    monthlyPrice: 8.99, annualPrice: 7.19,
    features: ["All Pro features", "8K ultra-HD quality", "Multi-threaded turbo", "AI transcription", "Metadata editing", "Dedicated support"],
  },
};

const PROMO_CODES: Record<string, { discount: number; label: string }> = {
  SAVE10:   { discount: 0.10, label: "10% off" },
  SAVE20:   { discount: 0.20, label: "20% off" },
  WELCOME:  { discount: 0.15, label: "15% off — Welcome!" },
  YTSAVE50: { discount: 0.50, label: "50% off — Special!" },
  LAUNCH:   { discount: 0.25, label: "25% off — Launch deal" },
};

type Step = "review" | "loading" | "pay" | "success" | "error";

const CRYPTO_COINS = [
  { sym: "₿", name: "BTC", bg: "bg-amber-500/15 border-amber-500/25", text: "text-amber-400" },
  { sym: "Ξ", name: "ETH", bg: "bg-indigo-500/15 border-indigo-500/25", text: "text-indigo-400" },
  { sym: "₮", name: "USDT", bg: "bg-emerald-500/15 border-emerald-500/25", text: "text-emerald-400" },
  { sym: "Ł", name: "LTC", bg: "bg-slate-500/15 border-slate-500/25", text: "text-slate-300" },
];

export default function Checkout() {
  const [, navigate] = useLocation();
  const { user, token } = useAuthStore();
  const { toast } = useToast();

  const params = new URLSearchParams(window.location.search);
  const planKey = (params.get("plan") || "pro").toLowerCase();
  const billingParam = params.get("billing") === "annual" ? "annual" : "monthly";

  const plan = PLANS[planKey] || PLANS.pro;
  const Icon = plan.icon;

  const [billing, setBilling] = useState<"monthly" | "annual">(billingParam);
  const [promoInput, setPromoInput] = useState("");
  const [promoState, setPromoState] = useState<"idle" | "valid" | "invalid">("idle");
  const [promoData, setPromoData] = useState<{ discount: number; label: string } | null>(null);
  const [step, setStep] = useState<Step>("review");
  const [orderData, setOrderData] = useState<{ invoiceUrl: string; orderId: string; amount: number } | null>(null);
  const pollRef = { current: null as ReturnType<typeof setInterval> | null };

  const unitPrice = billing === "annual" ? plan.annualPrice : plan.monthlyPrice;
  const subtotal = billing === "annual" ? unitPrice * 12 : unitPrice;
  const annualSavings = billing === "annual" ? plan.monthlyPrice * 12 * 0.2 : 0;
  const discountAmt = promoData ? subtotal * promoData.discount : 0;
  const total = subtotal - discountAmt;
  const billingLabel = billing === "annual" ? "/yr" : "/mo";

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      setPromoState("valid");
      setPromoData(PROMO_CODES[code]);
    } else {
      setPromoState("invalid");
      setPromoData(null);
    }
  };

  const clearPromo = () => {
    setPromoInput("");
    setPromoState("idle");
    setPromoData(null);
  };

  const startPolling = (orderId: string) => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}api/payments/order-status/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.status === "paid") {
          clearInterval(pollRef.current!);
          setStep("success");
        } else if (data.status === "expired" || data.status === "failed") {
          clearInterval(pollRef.current!);
          setStep("error");
        }
      } catch {}
    }, 4000);
  };

  const handlePay = async () => {
    if (!token) {
      navigate("/login?redirect=/checkout?plan=" + planKey + "&billing=" + billing);
      return;
    }
    setStep("loading");
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          plan: planKey,
          billing,
          promoCode: promoState === "valid" ? promoInput.trim().toUpperCase() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create order");
      setOrderData({ invoiceUrl: data.invoiceUrl, orderId: data.orderId, amount: data.amount });
      setStep("pay");
      startPolling(data.orderId);
    } catch (err: any) {
      toast({ title: "Payment Error", description: err.message, variant: "destructive" });
      setStep("error");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#080810] flex flex-col">
      {/* Subtle background texture */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-violet-600/8 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <AppLogo size={26} />
            <span className="font-bold text-[15px] text-white/80 group-hover:text-white transition-colors tracking-tight">YTSave</span>
          </Link>

          {/* Steps indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium">
            {["Plan", "Review", "Pay"].map((s, i) => {
              const active = i === 1;
              const done = i === 0;
              return (
                <div key={s} className="flex items-center gap-1.5">
                  {i > 0 && <div className="w-8 h-px bg-white/10" />}
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                    done ? "text-white/30" : active ? "bg-white/8 text-white border border-white/10" : "text-white/20"
                  }`}>
                    {done ? <Check className="w-3 h-3" /> : (
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${active ? "bg-violet-500 text-white" : "bg-white/8 text-white/30"}`}>{i + 1}</span>
                    )}
                    {s}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-white/30 font-medium">
            <Lock className="w-3.5 h-3.5 text-emerald-500/70" />
            Secure checkout
          </div>
        </div>
      </header>

      {/* Back link */}
      <div className="relative z-10 max-w-6xl mx-auto w-full px-6 pt-7 pb-1">
        <Link href="/pricing" className="inline-flex items-center gap-1.5 text-sm text-white/30 hover:text-white/70 transition-colors group">
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to pricing
        </Link>
      </div>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-start justify-center px-4 sm:px-6 py-6 pb-16">
        <div className="w-full max-w-6xl">
          <AnimatePresence mode="wait">

            {/* ─────────── REVIEW STEP ─────────── */}
            {step === "review" && (
              <motion.div
                key="review"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6"
              >
                {/* ── LEFT COLUMN ── */}
                <div className="space-y-4">
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white tracking-tight">Review your order</h1>
                    <p className="text-white/40 text-sm mt-1">Confirm your plan details before completing payment.</p>
                  </div>

                  {/* Plan card */}
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${plan.gradient} shadow-lg`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-[11px] uppercase tracking-widest text-white/30 font-semibold mb-0.5">Selected plan</p>
                            <p className="text-xl font-bold text-white">{plan.name}</p>
                          </div>
                        </div>
                        <Link href="/pricing" className="text-xs text-violet-400/80 hover:text-violet-300 transition-colors font-medium border border-violet-500/20 hover:border-violet-500/40 px-3 py-1.5 rounded-lg">
                          Change
                        </Link>
                      </div>

                      {/* Billing toggle */}
                      <div className="flex items-center gap-1.5 p-1.5 bg-white/[0.04] rounded-xl border border-white/[0.06] mb-6 w-fit">
                        {(["monthly", "annual"] as const).map((b) => (
                          <button
                            key={b}
                            onClick={() => setBilling(b)}
                            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                              billing === b
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-white/40 hover:text-white/70"
                            }`}
                          >
                            {b === "monthly" ? "Monthly" : "Annual"}
                            {b === "annual" && billing !== "annual" && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400">
                                −20%
                              </span>
                            )}
                            {b === "annual" && billing === "annual" && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400">
                                −20%
                              </span>
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Features grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {plan.features.map((f) => (
                          <div key={f} className="flex items-center gap-2.5 text-sm text-white/65">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${plan.gradient}`}>
                              <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            </div>
                            {f}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Promo code card */}
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Tag className="w-4 h-4 text-violet-400" />
                      <h3 className="text-sm font-semibold text-white">Promo code</h3>
                    </div>

                    {promoState === "valid" && promoData ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-between px-4 py-3.5 bg-emerald-500/[0.08] border border-emerald-500/20 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <BadgeCheck className="w-4 h-4 text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white font-mono tracking-wider">{promoInput.trim().toUpperCase()}</p>
                            <p className="text-xs text-emerald-400 font-medium">{promoData.label} applied</p>
                          </div>
                        </div>
                        <button onClick={clearPromo} className="text-xs text-white/30 hover:text-white/70 transition-colors font-medium">
                          Remove
                        </button>
                      </motion.div>
                    ) : (
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="Enter promo code"
                            value={promoInput}
                            onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoState("idle"); }}
                            onKeyDown={e => e.key === "Enter" && applyPromo()}
                            className={`w-full bg-white/[0.05] border rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 transition-all font-mono tracking-widest uppercase ${
                              promoState === "invalid"
                                ? "border-red-500/40 focus:ring-red-500/20 bg-red-500/5"
                                : "border-white/[0.08] focus:ring-violet-500/30 focus:border-violet-500/40"
                            }`}
                          />
                          {promoState === "invalid" && (
                            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400/80" />
                          )}
                        </div>
                        <button
                          onClick={applyPromo}
                          disabled={!promoInput.trim()}
                          className="px-5 py-3 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all"
                        >
                          Apply
                        </button>
                      </div>
                    )}

                    {promoState === "invalid" && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-400/80 mt-2.5 flex items-center gap-1.5"
                      >
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        This promo code is invalid or has expired.
                      </motion.p>
                    )}
                  </div>

                  {/* Trust badges */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1 px-1">
                    {[
                      { icon: Shield, label: "7-day money-back guarantee" },
                      { icon: Lock, label: "256-bit SSL encryption" },
                      { icon: RefreshCw, label: "Cancel anytime" },
                    ].map(({ icon: I, label }) => (
                      <div key={label} className="flex items-center gap-2 text-xs text-white/30">
                        <I className="w-3.5 h-3.5 text-white/20" />
                        {label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── RIGHT COLUMN ── */}
                <div className="space-y-4">

                  {/* Account section */}
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
                    <p className="text-[11px] uppercase tracking-widest text-white/30 font-semibold mb-4">Account</p>
                    {user ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow">
                          {user.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{user.username}</p>
                          <p className="text-xs text-white/35 truncate">{user.email}</p>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3.5 h-3.5 text-emerald-400" strokeWidth={3} />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-white/45 mb-4">You need an account to complete your purchase.</p>
                        <div className="grid grid-cols-2 gap-2">
                          <Link href={`/login?redirect=/checkout?plan=${planKey}&billing=${billing}`}>
                            <button className="w-full py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-white/60 hover:bg-white/5 hover:text-white/90 transition-all">
                              Log in
                            </button>
                          </Link>
                          <Link href="/signup">
                            <button className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-bold text-white transition-all">
                              Sign up free
                            </button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Order summary */}
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
                    <p className="text-[11px] uppercase tracking-widest text-white/30 font-semibold mb-5">Order summary</p>

                    <div className="space-y-3.5 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-white/55">{plan.name} Plan · {billing}</span>
                        <span className="text-white font-medium tabular-nums">${billing === "annual" ? (plan.monthlyPrice * 12).toFixed(2) : plan.monthlyPrice.toFixed(2)}{billingLabel}</span>
                      </div>

                      {billing === "annual" && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex justify-between items-center"
                        >
                          <span className="text-emerald-400/80">Annual discount (20%)</span>
                          <span className="text-emerald-400 font-medium tabular-nums">−${annualSavings.toFixed(2)}</span>
                        </motion.div>
                      )}

                      <AnimatePresence>
                        {promoData && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex justify-between items-center"
                          >
                            <span className="text-emerald-400/80">Promo · {promoData.label}</span>
                            <span className="text-emerald-400 font-medium tabular-nums">−${discountAmt.toFixed(2)}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="h-px bg-white/[0.07] my-1" />

                      <div className="flex justify-between items-center">
                        <span className="text-white font-semibold">Total due today</span>
                        <motion.span
                          key={total.toFixed(2)}
                          initial={{ scale: 1.08, color: "#a78bfa" }}
                          animate={{ scale: 1, color: "#ffffff" }}
                          transition={{ duration: 0.25 }}
                          className="text-xl font-bold tabular-nums"
                        >
                          ${total.toFixed(2)}{billingLabel}
                        </motion.span>
                      </div>

                      <p className="text-[11px] text-white/25 leading-relaxed">
                        {billing === "monthly" ? "Billed monthly. Cancel any time before your next renewal." : "Billed once per year. Cancel before renewal for a full refund."}
                      </p>
                    </div>
                  </div>

                  {/* Payment method */}
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
                    <p className="text-[11px] uppercase tracking-widest text-white/30 font-semibold mb-4">Payment method</p>

                    <div className="flex items-center gap-3 p-3.5 bg-indigo-500/[0.07] border border-indigo-500/20 rounded-xl mb-4">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center font-black text-white text-sm flex-shrink-0 shadow">
                        N
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">NOWPayments</p>
                        <p className="text-[11px] text-white/35">Cryptocurrency · 100+ coins accepted</p>
                      </div>
                      <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center">
                        <Check className="w-3 h-3 text-emerald-400" strokeWidth={3} />
                      </div>
                    </div>

                    {/* Coin icons */}
                    <div className="flex items-center gap-2 mb-5">
                      {CRYPTO_COINS.map(({ sym, name, bg, text }) => (
                        <div key={name} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${bg} text-[11px] font-bold ${text}`}>
                          <span>{sym}</span>
                          <span className="text-white/40 font-medium">{name}</span>
                        </div>
                      ))}
                      <span className="text-[11px] text-white/20 font-medium">+96</span>
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={handlePay}
                      disabled={!user}
                      className={`w-full relative overflow-hidden py-4 rounded-xl font-bold text-[15px] transition-all duration-200 flex items-center justify-center gap-2.5 group ${
                        user
                          ? `bg-gradient-to-r ${plan.gradient} text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md`
                          : "bg-white/[0.05] text-white/20 cursor-not-allowed border border-white/[0.06]"
                      }`}
                    >
                      {user ? (
                        <>
                          <CreditCard className="w-4.5 h-4.5" />
                          Pay ${total.toFixed(2)}{billingLabel}
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </>
                      ) : (
                        "Sign in to continue"
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-white/20">
                      <Lock className="w-3 h-3" />
                      256-bit SSL · Secured by NOWPayments
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─────────── LOADING ─────────── */}
            {step === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-40 gap-6"
              >
                <div className="relative">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${plan.gradient} opacity-15 blur-xl absolute inset-0 scale-150`} />
                  <div className="relative w-20 h-20 rounded-full border border-white/10 bg-white/[0.04] flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-white mb-1">Creating your order</p>
                  <p className="text-white/35 text-sm">Connecting to payment gateway…</p>
                </div>
              </motion.div>
            )}

            {/* ─────────── PAY STEP ─────────── */}
            {step === "pay" && orderData && (
              <motion.div
                key="pay"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-md mx-auto"
              >
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
                  <div className={`h-1 bg-gradient-to-r ${plan.gradient}`} />
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-widest text-white/30 font-semibold">Order created</p>
                        <p className="text-base font-bold text-white">{plan.name} Plan · {billing}</p>
                      </div>
                    </div>

                    <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-6 text-center mb-6">
                      <p className="text-xs text-white/35 uppercase tracking-wider mb-2">Amount due</p>
                      <p className="text-4xl font-bold text-white tabular-nums">${orderData.amount.toFixed(2)}</p>
                      <p className="text-xs text-white/25 mt-2">Payable in your chosen cryptocurrency</p>
                    </div>

                    <a href={orderData.invoiceUrl} target="_blank" rel="noopener noreferrer" className="block mb-3">
                      <button className="w-full flex items-center justify-center gap-2.5 py-4 bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-600 text-white font-bold rounded-xl transition-all text-[15px]">
                        Open Payment Page
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </a>

                    <div className="flex items-center justify-center gap-2 py-3 text-sm text-white/30">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Waiting for payment confirmation…
                    </div>

                    <div className="mt-3 pt-4 border-t border-white/[0.06] flex items-center justify-center gap-2 text-[11px] text-white/20">
                      <Lock className="w-3 h-3" />
                      Your payment is processed securely by NOWPayments
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─────────── SUCCESS ─────────── */}
            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 22 }}
                className="max-w-sm mx-auto text-center py-24"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 250, damping: 20, delay: 0.1 }}
                  className="w-20 h-20 mx-auto mb-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"
                >
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <h2 className="text-2xl font-bold text-white mb-2">Payment confirmed</h2>
                  <p className="text-white/45 text-sm mb-1">
                    Your <span className="text-white font-semibold">{plan.name}</span> plan is now active.
                  </p>
                  <p className="text-white/25 text-xs mb-8">A receipt has been sent to your email.</p>

                  <Link href="/">
                    <button className={`px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r ${plan.gradient} hover:opacity-90 active:opacity-80 transition-all shadow-lg text-sm`}>
                      Start downloading
                    </button>
                  </Link>
                </motion.div>
              </motion.div>
            )}

            {/* ─────────── ERROR ─────────── */}
            {step === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-sm mx-auto text-center py-24"
              >
                <div className="w-20 h-20 mx-auto mb-7 rounded-full bg-red-500/[0.08] border border-red-500/15 flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Payment failed</h2>
                <p className="text-white/40 text-sm mb-8">The order expired or an error occurred. No charge was made.</p>
                <button
                  onClick={() => setStep("review")}
                  className={`px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r ${plan.gradient} hover:opacity-90 transition-all shadow-lg text-sm`}
                >
                  Try again
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
