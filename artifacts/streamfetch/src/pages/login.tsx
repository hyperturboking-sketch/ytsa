import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import { useLogin } from "@/hooks/use-api";
import { useAuthStore } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/use-seo";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function Login() {
  useSEO({
    title: "Log In – StreamFetch",
    description: "Log in to your StreamFetch account to access your download history, manage your plan and use premium tools.",
    canonical: "/login",
    noindex: true,
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();

  const loginMutation = useLogin();
  const { setAuth } = useAuthStore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await loginMutation.mutateAsync({
        data: { email, password }
      });
      setAuth(res.token, res.user);
      toast({ title: "Welcome back!", description: "Successfully logged in." });
      setLocation("/");
    } catch (err: any) {
      toast({
        title: "Login Failed",
        description: err.message || "Invalid credentials.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex flex-col items-center justify-center p-4 bg-gradient-to-b from-secondary to-background">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border shadow-xl p-8 sm:p-10 rounded-3xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-[60px] pointer-events-none" />
          
          <div className="relative z-10">
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">Welcome Back</h1>
            <p className="text-muted-foreground mb-8">Sign in to access your download history.</p>

            {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
              <>
                <div className="mb-6">
                  <GoogleSignInButton label="Continue with Google" />
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-muted-foreground text-sm">or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground ml-1">Password</label>
                  <Link href="/forgot-password" className="text-xs text-primary hover:text-primary/80 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full mt-2 py-3.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 group"
              >
                {loginMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/signup" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                Create one
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
