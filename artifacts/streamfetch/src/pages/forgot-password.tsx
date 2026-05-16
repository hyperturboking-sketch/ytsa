import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mail, KeyRound, Lock, ArrowRight, CheckCircle2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/use-seo";

type Step = "email" | "code" | "done";

async function apiFetch(path: string, body: object) {
  const base = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";
  const res = await fetch(`${base}/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
}

export default function ForgotPassword() {
  useSEO({
    title: "Forgot Password – YTSave",
    description: "Reset your YTSave password.",
    canonical: "/forgot-password",
    noindex: true,
  });

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/auth/forgot-password", { email });
      setStep("code");
      toast({ title: "Code sent!", description: "Check your email for the 6-digit reset code." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", description: "Please make sure both passwords are the same.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await apiFetch("/auth/reset-password", { email, code, newPassword });
      setStep("done");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8 sm:p-10 rounded-3xl relative overflow-hidden">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/30 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10">
            <AnimatePresence mode="wait">

              {step === "email" && (
                <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-3xl font-display font-bold text-white mb-2">Forgot Password?</h1>
                  <p className="text-muted-foreground mb-8">Enter your email and we'll send you a 6-digit code to reset your password.</p>

                  <form onSubmit={handleSendCode} className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-white ml-1">Email address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-background border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 group"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send Reset Code <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors">
                      <ArrowLeft className="w-4 h-4" /> Back to login
                    </Link>
                  </div>
                </motion.div>
              )}

              {step === "code" && (
                <motion.div key="code" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                    <KeyRound className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-3xl font-display font-bold text-white mb-2">Enter Code</h1>
                  <p className="text-muted-foreground mb-2">
                    We sent a 6-digit code to <span className="text-white font-medium">{email}</span>.
                  </p>
                  <p className="text-sm text-muted-foreground mb-8">It expires in 15 minutes.</p>

                  <form onSubmit={handleResetPassword} className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-white ml-1">Reset Code</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="w-full bg-background border border-white/10 rounded-xl py-3 px-4 text-white text-center text-2xl font-mono tracking-[0.4em] placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        placeholder="000000"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-white ml-1">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-background border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                          placeholder="At least 6 characters"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-white ml-1">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-background border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                          placeholder="Re-enter your new password"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || code.length < 6}
                      className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 group"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Reset Password <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <button
                      onClick={() => setStep("email")}
                      className="text-sm text-muted-foreground hover:text-white transition-colors"
                    >
                      Didn't receive a code? Try again
                    </button>
                  </div>
                </motion.div>
              )}

              {step === "done" && (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h1 className="text-3xl font-display font-bold text-white mb-2">Password Reset!</h1>
                  <p className="text-muted-foreground mb-8">Your password has been updated. You can now sign in with your new password.</p>
                  <button
                    onClick={() => setLocation("/login")}
                    className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all duration-200 flex items-center justify-center gap-2 group"
                  >
                    Go to Login <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
