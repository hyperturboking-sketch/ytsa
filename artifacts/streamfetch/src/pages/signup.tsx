import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, User, ArrowRight } from "lucide-react";
import { useSignup } from "@/hooks/use-api";
import { useAuthStore } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/use-seo";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function Signup() {
  useSEO({
    title: "Create Free Account – YTSave",
    description: "Sign up for YTSave to track your download history and unlock premium features like 4K downloads, AI transcription and batch downloading.",
    canonical: "/signup",
    noindex: true,
  });
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();

  const signupMutation = useSignup();
  const { setAuth } = useAuthStore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await signupMutation.mutateAsync({
        data: { username, email, password }
      });
      setAuth(res.token, res.user);
      toast({ title: "Account created!", description: "Welcome to YTSave." });
      setLocation("/");
    } catch (err: any) {
      toast({
        title: "Signup Failed",
        description: err.message || "Could not create account.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex flex-col items-center justify-center p-4 bg-gradient-to-b from-secondary to-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30, filter: "blur(8px)" }}
        animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border shadow-xl p-8 sm:p-10 rounded-3xl relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-accent/5 rounded-full blur-[60px] pointer-events-none" />
          
          <div className="relative z-10">
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">Create Account</h1>
            <p className="text-muted-foreground mb-8">Join the fastest media downloader.</p>

            {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
              <>
                <div className="mb-6">
                  <GoogleSignInButton label="Sign up with Google" />
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-muted-foreground text-sm">or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground ml-1">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input 
                    type="text" 
                    required
                    minLength={3}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                    placeholder="cooluser99"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input 
                    type="password" 
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={signupMutation.isPending}
                className="w-full mt-4 py-3.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 group"
              >
                {signupMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <>
                    Sign Up <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                Log in
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
