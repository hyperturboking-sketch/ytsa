import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Loader2 } from "lucide-react";

import AppLayout from "@/components/layout/AppLayout";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Dashboard from "@/pages/dashboard";
import Pricing from "@/pages/pricing";
import Tools from "@/pages/tools";
import Transcribe from "@/pages/transcribe";
import Subtitles from "@/pages/subtitles";
import ForgotPassword from "@/pages/forgot-password";
import NotFound from "@/pages/not-found";

const Admin = lazy(() => import("@/pages/admin"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

const PageFallback = () => (
  <div className="w-full min-h-[50vh] flex items-center justify-center">
    <Loader2 className="w-8 h-8 text-primary animate-spin" />
  </div>
);

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/admin">
          <Suspense fallback={<PageFallback />}>
            <Admin />
          </Suspense>
        </Route>
        <Route path="/pricing" component={Pricing} />
        <Route path="/tools" component={Tools} />
        <Route path="/tools/transcribe" component={Transcribe} />
        <Route path="/tools/subtitles" component={Subtitles} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

function App() {
  const inner = (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );

  return googleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId}>{inner}</GoogleOAuthProvider>
  ) : inner;
}

export default App;
