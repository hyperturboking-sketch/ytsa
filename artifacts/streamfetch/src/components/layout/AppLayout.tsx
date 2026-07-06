import { useEffect } from "react";
import { useLocation } from "wouter";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useGetMe } from "@/hooks/use-api";
import { useAuthStore } from "@/lib/auth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: user, isError } = useGetMe();
  const { setUser, clearAuth } = useAuthStore();
  const [location] = useLocation();

  useEffect(() => {
    if (user) {
      setUser(user);
    }
    if (isError) {
      clearAuth();
    }
  }, [user, isError, setUser, clearAuth]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <>
      {/* Global Background Image */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-glow.png`}
          alt=""
          className="w-full h-full object-cover opacity-20 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[100px]" />
      </div>

      <Navbar />
      <main className="flex-1 w-full relative z-10 pt-20">
        {children}
      </main>
      <Footer />
    </>
  );
}
