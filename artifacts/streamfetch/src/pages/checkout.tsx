import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, Link } from "wouter";
import {
  Shield, Lock, Check, Tag, Loader2, ChevronRight,
  CheckCircle2, XCircle, ExternalLink, ArrowLeft,
  Zap, Star, Crown, BadgePercent, AlertCircle
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import AppLogo from "@/components/AppLogo";

// ---------- plan data ----------
const PLANS: Record<string, {
  name: string; icon: typeof Zap; color: string; gradient: string;
  monthlyPrice: number; annualPrice: number; features: string[];
}> = {
  basic: {
    name: "Basic", icon: Zap, color: "text-cyan-500",
    gradient: "from-cyan-500 to-teal-500",
    monthlyPrice: 1.99, annualPrice: 1.59,
    features: ["Ad-free experience", "Unlimited downloads", "Resume downloads", "720p & 1080p quality", "Email support"],
  },
  pro: {
    name: "Pro", icon: Star, color: "text-violet-500",
    gradient: "from-violet-500 to-indigo-500",
    monthlyPrice: 5.99, annualPrice: 4.79,
    features: ["All Basic features", "Batch downloads", "1440p & 4K quality", "Subtitles download", "Cloud sync", "Priority queue"],
  },
  elite: {
    name: "Elite", icon: Crown, color: "text-indigo-500",
    gradient: "from-indigo-500 to-purple-500",
    monthlyPrice: 8.99, annualPrice: 7.19,
    features: ["All Pro features", "8K ultra-HD quality", "Multi-threaded turbo", "AI transcription", "Metadata editing", "Dedicated support"],
  },
};

// Promo codes
const PROMO_CODES: Record<string, { discount: number; label: string }> = {
  SAVE10:   { discount: 0.10, label: "10% off" },
  SAVE20:   { discount: 0.20, label: "20% off" },
  WELCOME:  { discount: 0.15, label: "15% off — Welcome!" },
  YTSAVE50: { discount: 0.50, label: "50% off — Special!" },
  LAUNCH:   { discount: 0.25, label: "25% off — Launch deal" },
};

type Step = "review" | "loading" | "pay" | "success" | "error";

export default function Checkout() {
  const [, navigate] = useLocation();
  const { user, token } = useAuthStore();
  const { toast } = useToast();

  // Parse query params
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
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-violet-950/20 to-slate-950 flex flex-col">
      {/* Top bar */}
      <div className="border-b border-white/8 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
          <AppLogo size={24} />
          <span className="font-display font-bold text-base">YTSave</span>
        </Link>
        <div className="flex items-center gap-2 text-xs text-white/40">
          <Lock className="w-3.5 h-3.5" />
          Secure checkout
        </div>
      </div>

      {/* Back link */}
      <div className="max-w-5xl mx-auto w-full px-4 pt-6">
        <Link href="/pricing" className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to pricing
        </Link>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-5xl">

          <AnimatePresence mode="wait">
            {step === "review" && (
              <motion.div
                key="review"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6"
              >
                {/* ── LEFT: Order summary ── */}
                <div className="space-y-5">
                  <div>
                    <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">Complete your order</h1>
                    <p className="text-white/50 text-sm mt-1">Review your plan and apply any promo codes below.</p>
                  </div>

                  {/* Plan card */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
                    <div className={`h-1.5 w-full bg-gradient-to-r ${plan.gradient}`} />
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-2xl bg-white/8 border border-white/10 flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${plan.color}`} />
                          </div>
                          <div>
                            <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">Selected plan</p>
                            <p className="text-lg font-bold text-white">{plan.name}</p>
                          </div>
                        </div>
                        <Link href="/pricing" className="text-xs text-violet-400 hover:text-violet-300 transition-colors underline underline-offset-2">
                          Change plan
                        </Link>
                      </div>

                      {/* Billing toggle */}
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/8 mb-5">
                        <button
                          onClick={() => setBilling("monthly")}
                          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${billing === "monthly" ? "bg-white text-slate-900 shadow" : "text-white/50 hover:text-white"}`}
                        >
                          Monthly
                        </button>
                        <button
                          onClick={() => setBilling("annual")}
                          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${billing === "annual" ? "bg-white text-slate-900 shadow" : "text-white/50 hover:text-white"}`}
                        >
                          Annual
                          {billing !== "annual" && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">-20%</span>
                          )}
                        </button>
                      </div>

                      {/* Features */}
                      <ul className="space-y-2.5">
                        {plan.features.map(f => (
                          <li key={f} className="flex items-center gap-2.5 text-sm text-white/75">
                            <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center flex-shrink-0`}>
                              <Check className="w-3 h-3 text-white" />
                            </div>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Promo code */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                      <Tag className="w-4 h-4 text-violet-400" /> Promo code
                    </h3>
                    {promoState === "valid" && promoData ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-between p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl"
                      >
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-bold text-white">{promoInput.trim().toUpperCase()}</p>
                            <p className="text-xs text-emerald-400">{promoData.label} applied</p>
                          </div>
                        </div>
                        <button onClick={clearPromo} className="text-xs text-white/40 hover:text-white transition-colors underline underline-offset-2">
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
                            className={`w-full bg-white/8 border rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 transition-all font-mono tracking-wider ${
                              promoState === "invalid"
                                ? "border-red-500/50 focus:ring-red-500/30"
                                : "border-white/10 focus:ring-violet-500/40"
                            }`}
                          />
                          {promoState === "invalid" && (
                            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                          )}
                        </div>
                        <button
                          onClick={applyPromo}
                          disabled={!promoInput.trim()}
                          className="px-5 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                    {promoState === "invalid" && (
                      <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Invalid promo code. Please check and try again.
                      </p>
                    )}
                  </div>

                  {/* Trust strip */}
                  <div className="flex flex-wrap gap-4">
                    {[
                      { icon: Shield, label: "7-day money back" },
                      { icon: Lock, label: "Encrypted checkout" },
                      { icon: BadgePercent, label: "No hidden fees" },
                    ].map(({ icon: I, label }) => (
                      <div key={label} className="flex items-center gap-1.5 text-xs text-white/40">
                        <I className="w-3.5 h-3.5 text-violet-400/70" />
                        {label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── RIGHT: Payment panel ── */}
                <div className="space-y-5">
                  {/* Account */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                    <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Account</h3>
                    {user ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center font-bold text-violet-300 text-sm">
                          {user.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{user.username}</p>
                          <p className="text-xs text-white/40">{user.email}</p>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto" />
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <p className="text-sm text-white/60 mb-3">Sign in to continue</p>
                        <div className="flex gap-2">
                          <Link href={`/login?redirect=/checkout?plan=${planKey}&billing=${billing}`} className="flex-1">
                            <button className="w-full py-2.5 rounded-xl border border-white/15 text-sm font-semibold text-white/70 hover:bg-white/8 transition-all">Log in</button>
                          </Link>
                          <Link href="/signup" className="flex-1">
                            <button className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-bold text-white transition-all">Sign up</button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Price breakdown */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                    <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Order summary</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between text-white/70">
                        <span>{plan.name} Plan ({billing})</span>
                        <span>${subtotal.toFixed(2)}{billingLabel}</span>
                      </div>
                      {billing === "annual" && (
                        <div className="flex justify-between text-emerald-400">
                          <span>Annual discount (20%)</span>
                          <span>-${(plan.monthlyPrice * 12 * 0.2).toFixed(2)}</span>
                        </div>
                      )}
                      <AnimatePresence>
                        {promoData && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex justify-between text-emerald-400"
                          >
                            <span>Promo ({promoData.label})</span>
                            <span>-${discountAmt.toFixed(2)}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div className="h-px bg-white/10 my-1" />
                      <div className="flex justify-between text-white font-bold text-base">
                        <span>Total today</span>
                        <motion.span
                          key={total.toFixed(2)}
                          initial={{ scale: 1.1, color: "#a78bfa" }}
                          animate={{ scale: 1, color: "#ffffff" }}
                          transition={{ duration: 0.3 }}
                        >
                          ${total.toFixed(2)}{billingLabel}
                        </motion.span>
                      </div>
                      {billing === "monthly" && (
                        <p className="text-xs text-white/30">Renews monthly. Cancel anytime.</p>
                      )}
                    </div>
                  </div>

                  {/* Payment method */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                    <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Payment method</h3>
                    <div className="flex items-center gap-3 p-3.5 bg-indigo-500/10 border border-indigo-500/25 rounded-xl mb-4">
                      <div className="w-9 h-9 rounded-lg bg-indigo-500 flex items-center justify-center font-black text-white text-sm flex-shrink-0">N</div>
                      <div>
                        <p className="text-sm font-semibold text-white">Crypto via NOWPayments</p>
                        <p className="text-xs text-white/40">BTC, ETH, USDT, LTC & 100+ coins</p>
                      </div>
                      <Check className="w-4 h-4 text-indigo-400 ml-auto flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-2 mb-5">
                      {["₿", "Ξ", "₮", "Ł"].map((sym, i) => (
                        <div key={i} className="w-8 h-8 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center text-sm font-bold text-white/60">
                          {sym}
                        </div>
                      ))}
                      <span className="text-xs text-white/30 ml-1">& more</span>
                    </div>

                    <button
                      onClick={handlePay}
                      disabled={!user}
                      className={`w-full py-4 rounded-2xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 ${
                        user
                          ? `bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white shadow-lg hover:-translate-y-0.5 active:translate-y-0`
                          : "bg-white/10 text-white/30 cursor-not-allowed"
                      }`}
                    >
                      {user ? (
                        <>Pay ${total.toFixed(2)}{billingLabel} <ChevronRight className="w-5 h-5" /></>
                      ) : (
                        "Sign in to pay"
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-2 mt-4 text-xs text-white/25">
                      <Lock className="w-3 h-3" />
                      256-bit SSL encrypted · Powered by NOWPayments
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* LOADING */}
            {step === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-32 gap-5"
              >
                <div className="w-20 h-20 rounded-full bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
                  <Loader2 className="w-9 h-9 text-violet-400 animate-spin" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-white">Creating your order…</p>
                  <p className="text-white/40 text-sm mt-1">This only takes a moment.</p>
                </div>
              </motion.div>
            )}

            {/* PAY */}
            {step === "pay" && orderData && (
              <motion.div
                key="pay"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto"
              >
                <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
                  <div className={`h-1.5 bg-gradient-to-r ${plan.gradient}`} />
                  <div className="p-8">
                    <h2 className="text-2xl font-display font-bold text-white mb-1">Complete payment</h2>
                    <p className="text-white/50 text-sm mb-6">Open the secure NOWPayments page to pay in your chosen crypto.</p>

                    <div className="bg-white/8 border border-white/10 rounded-2xl p-5 text-center mb-6">
                      <p className="text-xs text-white/40 mb-1 uppercase tracking-wider">Amount due</p>
                      <p className="text-4xl font-display font-extrabold text-white">${orderData.amount.toFixed(2)}</p>
                      <p className="text-xs text-white/30 mt-1">USD equivalent in your chosen crypto</p>
                    </div>

                    <a href={orderData.invoiceUrl} target="_blank" rel="noopener noreferrer">
                      <button className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-2xl transition-all mb-4">
                        Open Payment Page <ExternalLink className="w-4 h-4" />
                      </button>
                    </a>

                    <div className="flex items-center justify-center gap-2 text-sm text-white/40">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Waiting for payment confirmation…
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SUCCESS */}
            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 150, damping: 20 }}
                className="max-w-md mx-auto text-center py-20"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center"
                >
                  <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                </motion.div>
                <h2 className="text-3xl font-display font-extrabold text-white mb-2">You're all set!</h2>
                <p className="text-white/50 mb-2">Your <span className="text-white font-semibold">{plan.name}</span> plan is now active.</p>
                <p className="text-white/30 text-sm mb-8">Check your email for the receipt.</p>
                <Link href="/">
                  <button className={`px-8 py-4 rounded-2xl font-bold text-white bg-gradient-to-r ${plan.gradient} hover:opacity-90 transition-all shadow-lg`}>
                    Start downloading
                  </button>
                </Link>
              </motion.div>
            )}

            {/* ERROR */}
            {step === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto text-center py-20"
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <XCircle className="w-12 h-12 text-red-400" />
                </div>
                <h2 className="text-3xl font-display font-extrabold text-white mb-2">Payment failed</h2>
                <p className="text-white/50 mb-8">The order expired or something went wrong. Please try again.</p>
                <button
                  onClick={() => setStep("review")}
                  className={`px-8 py-4 rounded-2xl font-bold text-white bg-gradient-to-r ${plan.gradient} hover:opacity-90 transition-all shadow-lg`}
                >
                  Try again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
