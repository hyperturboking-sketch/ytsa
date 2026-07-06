import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CheckCircle2, XCircle, ExternalLink, QrCode } from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface Props {
  plan: { name: string; price: string; cta: string; billing: "monthly" | "annual" } | null;
  planKey: string | null;
  onClose: () => void;
}

type Step = "confirm" | "loading" | "pay" | "success" | "error" | "login";

export default function PaymentModal({ plan, planKey, onClose }: Props) {
  const { user, token } = useAuthStore();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("confirm");
  const [orderData, setOrderData] = useState<{
    invoiceUrl: string;
    orderId: string;
    amount: number;
  } | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!plan) {
      setStep("confirm");
      setOrderData(null);
    } else if (!user) {
      setStep("login");
    } else {
      setStep("confirm");
    }
  }, [plan, user]);

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

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
      } catch {
        // keep polling
      }
    }, 4000);
  };

  const handlePay = async () => {
    if (!planKey || !token) return;
    setStep("loading");
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: planKey, billing: plan?.billing }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create order");
      setOrderData({
        invoiceUrl: data.invoiceUrl,
        orderId: data.orderId,
        amount: data.amount,
      });
      setStep("pay");
      startPolling(data.orderId);
    } catch (err: any) {
      toast({ title: "Payment Error", description: err.message, variant: "destructive" });
      setStep("error");
    }
  };

  if (!plan) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-md bg-card border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-xl text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8">
            {/* LOGIN PROMPT */}
            {step === "login" && (
              <div className="text-center py-4">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <QrCode className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-2xl font-display font-bold text-white mb-2">Sign in to continue</h2>
                <p className="text-muted-foreground mb-8 text-sm">You need an account to purchase a plan.</p>
                <div className="flex flex-col gap-3">
                  <Link href="/signup" onClick={onClose}>
                    <button className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all">
                      Create account
                    </button>
                  </Link>
                  <Link href="/login" onClick={onClose}>
                    <button className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all">
                      Log in
                    </button>
                  </Link>
                </div>
              </div>
            )}

            {/* CONFIRM */}
            {step === "confirm" && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-widest text-primary">Pay with Crypto</span>
                </div>
                <h2 className="text-2xl font-display font-bold text-white mb-1">Confirm your plan</h2>
                <p className="text-muted-foreground text-sm mb-6">You'll pay securely using NOWPayments.</p>

                <div className="bg-secondary/40 border border-white/8 rounded-2xl p-5 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-semibold text-lg">{plan.name} Plan</span>
                    <span className="text-2xl font-display font-extrabold text-white">{plan.price}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Billed in crypto (USD value)</span>
                    <span className="flex items-center gap-1.5">
                      <img src="https://cryptologos.cc/logos/tether-usdt-logo.png" alt="USDT" className="w-4 h-4 rounded-full" />
                      100+ coins supported
                    </span>
                  </div>
                </div>

                {/* NOWPayments branding */}
                <div className="flex items-center gap-3 mb-6 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-black text-white text-xs">N</div>
                  <div>
                    <div className="text-sm font-semibold text-white">NOWPayments</div>
                    <div className="text-xs text-muted-foreground">Secure crypto checkout — BTC, ETH, USDT & more</div>
                  </div>
                </div>

                <button
                  onClick={handlePay}
                  className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-indigo-500/20"
                >
                  Continue to Payment
                </button>
                <p className="text-center text-xs text-muted-foreground mt-3">
                  Subscription renews {plan.billing === "annual" ? "annually" : "monthly"}. Cancel anytime.
                </p>
              </div>
            )}

            {/* LOADING */}
            {step === "loading" && (
              <div className="text-center py-8">
                <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                <p className="text-white font-semibold">Creating your payment order…</p>
                <p className="text-muted-foreground text-sm mt-1">This only takes a moment.</p>
              </div>
            )}

            {/* PAY STEP */}
            {step === "pay" && orderData && (
              <div>
                <h2 className="text-xl font-display font-bold text-white mb-1">Complete your payment</h2>
                <p className="text-muted-foreground text-sm mb-6">Click the button below to open the secure NOWPayments checkout page. Choose your preferred cryptocurrency and complete payment there.</p>

                <div className="bg-secondary/40 border border-white/8 rounded-2xl p-4 mb-6 text-center">
                  <div className="text-muted-foreground text-xs mb-1">Amount due</div>
                  <div className="text-3xl font-display font-extrabold text-white">${orderData.amount.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground mt-1">USD equivalent in your chosen crypto</div>
                </div>

                <a href={orderData.invoiceUrl} target="_blank" rel="noopener noreferrer">
                  <button className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all mb-4">
                    Open Payment Page <ExternalLink className="w-4 h-4" />
                  </button>
                </a>

                <div className="flex items-center gap-2 justify-center">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Waiting for payment confirmation…</span>
                </div>
              </div>
            )}

            {/* SUCCESS */}
            {step === "success" && (
              <div className="text-center py-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
                  <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                </motion.div>
                <h2 className="text-2xl font-display font-bold text-white mb-2">Payment confirmed!</h2>
                <p className="text-muted-foreground mb-6 text-sm">Your <span className="text-white font-semibold">{plan.name}</span> plan is now active. Enjoy all the features!</p>
                <button onClick={onClose} className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all">
                  Start downloading
                </button>
              </div>
            )}

            {/* ERROR */}
            {step === "error" && (
              <div className="text-center py-4">
                <XCircle className="w-14 h-14 text-destructive mx-auto mb-4" />
                <h2 className="text-2xl font-display font-bold text-white mb-2">Payment failed</h2>
                <p className="text-muted-foreground mb-6 text-sm">The order expired or something went wrong. Please try again.</p>
                <button onClick={() => setStep("confirm")} className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all">
                  Try again
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
