import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  Download, LogOut, User, LayoutDashboard, Settings,
  Sun, Moon, Menu, X, ChevronRight, Wrench, Tag, BookOpen
} from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { useLogout } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import AppLogo from "@/components/AppLogo";

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const { user, clearAuth } = useAuthStore();
  const logoutMutation = useLogout();
  const { toast } = useToast();
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const handleLogout = async () => {
    try { await logoutMutation.mutateAsync({}); } catch (_) {}
    finally {
      clearAuth();
      toast({ title: "Logged out successfully" });
      setLocation("/");
    }
  };

  const isActive = (href: string, exact = false) =>
    exact ? location === href : location.startsWith(href);

  const linkClass = (href: string, exact = false) =>
    `text-sm font-semibold font-display tracking-wide transition-colors duration-200 ${
      isActive(href, exact)
        ? "text-white"
        : "text-white/70 hover:text-white"
    }`;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 pointer-events-none">
      <nav
        ref={menuRef}
        className={`pointer-events-auto w-full max-w-5xl rounded-[28px] transition-all duration-300 ${
          scrolled
            ? "bg-gradient-to-r from-violet-950/40 via-indigo-950/35 to-violet-950/40 backdrop-blur-2xl border-2 border-violet-500/20 shadow-2xl shadow-violet-900/20"
            : "bg-gradient-to-r from-violet-950/25 via-indigo-950/20 to-violet-950/25 backdrop-blur-xl border-2 border-violet-500/12 shadow-lg shadow-violet-900/10"
        }`}
      >
        <div className="px-5 sm:px-6">
          <div className="flex items-center h-[60px] gap-6">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <AppLogo size={28} className="group-hover:opacity-90 transition-opacity duration-200" />
              <span className="font-display font-bold text-xl tracking-tight text-white group-hover:text-white/90 transition-colors">
                YTSave
              </span>
            </Link>

            {/* Desktop center nav */}
            <div className="hidden sm:flex items-center gap-6 flex-1">
              <Link href="/tools" className={linkClass("/tools")}>Tools</Link>
              <Link href="/pricing" className={linkClass("/pricing", true)}>Pricing</Link>
              <Link href="/blog" className={linkClass("/blog")}>Blog</Link>
              {user && (
                <Link href="/dashboard" className={linkClass("/dashboard", true)}>Dashboard</Link>
              )}
              {user?.isAdmin && (
                <Link href="/admin" className={linkClass("/admin")}>Admin</Link>
              )}
            </div>

            {/* Desktop right side */}
            <div className="hidden sm:flex items-center gap-2.5 flex-shrink-0 ml-auto">
              <button
                onClick={toggle}
                title={theme === "light" ? "Switch to dark" : "Switch to light"}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-white/45 hover:text-white/85 hover:bg-white/8 transition-all"
              >
                {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>

              {user ? (
                <div className="flex items-center gap-2.5 pl-2.5 border-l border-white/10">
                  <div className="w-7 h-7 rounded-full bg-[#ab76d1]/20 border border-[#ab76d1]/30 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-[#ab76d1]" />
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-xs font-semibold text-white">{user.username}</span>
                    <span className="text-[10px] text-white/40 capitalize">{user.isAdmin ? "Admin" : (user.plan ?? "Free")}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all"
                    title="Logout"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="text-sm font-semibold font-display tracking-wide text-white/70 hover:text-white transition-colors px-2 py-1.5"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-1.5 text-sm font-semibold font-display tracking-wide rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white transition-all duration-200 shadow-lg shadow-violet-600/25"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile right */}
            <div className="flex sm:hidden items-center gap-1 ml-auto">
              <button
                onClick={toggle}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-white/50 hover:text-white hover:bg-white/8 transition-all"
              >
                {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-white/50 hover:text-white hover:bg-white/8 transition-all"
                aria-label="Menu"
              >
                {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="sm:hidden border-t border-white/8 rounded-b-[28px] overflow-hidden">
            <div className="px-4 py-4 space-y-1">

              {user && (
                <div className="flex items-center gap-3 px-3 py-3 mb-3 rounded-xl bg-white/5 border border-white/8">
                  <div className="w-9 h-9 rounded-full bg-[#ab76d1]/20 border border-[#ab76d1]/30 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-[#ab76d1]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{user.username}</p>
                    <p className="text-xs text-white/40 capitalize">{user.isAdmin ? "Administrator" : (user.plan ?? "Free Plan")}</p>
                  </div>
                </div>
              )}

              <MobileLink href="/" label="Home" icon={<Download className="w-4 h-4" />} active={location === "/"} />
              <MobileLink href="/tools" label="Tools" icon={<Wrench className="w-4 h-4" />} active={location.startsWith("/tools")} />
              <MobileLink href="/pricing" label="Pricing" icon={<Tag className="w-4 h-4" />} active={location === "/pricing"} />
              <MobileLink href="/blog" label="Blog" icon={<BookOpen className="w-4 h-4" />} active={location.startsWith("/blog")} />
              {user && <MobileLink href="/dashboard" label="Dashboard" icon={<LayoutDashboard className="w-4 h-4" />} active={location === "/dashboard"} />}
              {user?.isAdmin && <MobileLink href="/admin" label="Admin Panel" icon={<Settings className="w-4 h-4" />} active={location.startsWith("/admin")} />}

              <div className="border-t border-white/8 my-2" />

              <button
                onClick={toggle}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all"
              >
                {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                <span>{theme === "light" ? "Switch to Dark" : "Switch to Light"}</span>
              </button>

              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  <Link href="/login" className="flex items-center justify-center w-full py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-white/70 hover:bg-white/5 transition-all">
                    Log in
                  </Link>
                  <Link href="/signup" className="flex items-center justify-center w-full py-2.5 rounded-xl bg-white text-gray-900 text-sm font-semibold hover:bg-white/90 transition-all">
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}

function MobileLink({ href, label, icon, active }: { href: string; label: string; icon: React.ReactNode; active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active ? "bg-[#ab76d1]/15 text-[#ab76d1]" : "text-white/50 hover:text-white hover:bg-white/5"
      }`}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {active && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
    </Link>
  );
}
