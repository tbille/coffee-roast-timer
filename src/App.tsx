import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import LandingPage from "./pages/LandingPage";
import RoastTimer from "./pages/RoastTimer";
import Auth from "./pages/Auth";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/hooks/useAuth";
import { RoasterProvider } from "@/contexts/RoasterContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";

// How To pages
import HowTo from "./pages/how-to/HowTo";
import GettingStarted from "./pages/how-to/GettingStarted";
import UsingProfiles from "./pages/how-to/UsingProfiles";
import CuppingNotes from "./pages/how-to/CuppingNotes";
import DevelopmentRatios from "./pages/how-to/DevelopmentRatios";
import GeneCafeCBR101 from "./pages/how-to/roasters/GeneCafeCBR101";
import Behmor2000AB from "./pages/how-to/roasters/Behmor2000AB";
import FreshRoastSR800 from "./pages/how-to/roasters/FreshRoastSR800";
import KaldiWide from "./pages/how-to/roasters/KaldiWide";
import HottopKN8828 from "./pages/how-to/roasters/HottopKN8828";
import PopcornPopper from "./pages/how-to/roasters/PopcornPopper";

// Lazy load heavy routes to reduce initial bundle size
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Discover = lazy(() => import("./pages/Discover"));
const RoastProfileDetails = lazy(() => import("./pages/RoastProfileDetails"));
const ComparisonPage = lazy(() => import("./components/comparison/ComparisonPage").then(m => ({ default: m.ComparisonPage })));

// Simple loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-pulse text-muted-foreground">Loading...</div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    {import.meta.env.VITE_GSC_SITE_VERIFICATION ? (
      <Helmet>
        <meta
          name="google-site-verification"
          content={import.meta.env.VITE_GSC_SITE_VERIFICATION}
        />
      </Helmet>
    ) : null}
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RoasterProvider>
          <TooltipProvider>
          <div className="min-h-screen flex flex-col">
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AnalyticsTracker />
              <Header />
              <div className="flex-1">
              <Routes>
                {/* Landing Page */}
                <Route path="/" element={<LandingPage />} />
                
                {/* Roast Timer */}
                <Route path="/roast" element={<RoastTimer />} />
                
                {/* Auth & User Pages */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <Dashboard />
                    </Suspense>
                  </ProtectedRoute>
                } />
                
                {/* Discovery & Profiles */}
                <Route path="/discover" element={
                  <Suspense fallback={<PageLoader />}>
                    <Discover />
                  </Suspense>
                } />
                <Route path="/profile/:id" element={
                  <Suspense fallback={<PageLoader />}>
                    <RoastProfileDetails />
                  </Suspense>
                } />
                <Route path="/compare" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <ComparisonPage />
                    </Suspense>
                  </ProtectedRoute>
                } />
                
                {/* Info Pages */}
                <Route path="/about" element={<About />} />
                
                {/* How To pages */}
                <Route path="/how-to" element={<HowTo />} />
                <Route path="/how-to/getting-started" element={<GettingStarted />} />
                <Route path="/how-to/using-profiles" element={<UsingProfiles />} />
                <Route path="/how-to/cupping-notes" element={<CuppingNotes />} />
                <Route path="/how-to/development-ratios" element={<DevelopmentRatios />} />
                <Route path="/how-to/roasters/gene-cafe-cbr-101" element={<GeneCafeCBR101 />} />
                <Route path="/how-to/roasters/behmor-2000ab" element={<Behmor2000AB />} />
                <Route path="/how-to/roasters/freshroast-sr800" element={<FreshRoastSR800 />} />
                <Route path="/how-to/roasters/kaldi-wide" element={<KaldiWide />} />
                <Route path="/how-to/roasters/hottop-kn-8828" element={<HottopKN8828 />} />
                <Route path="/how-to/roasters/popcorn-popper" element={<PopcornPopper />} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Footer />
          </BrowserRouter>
        </div>
        </TooltipProvider>
        </RoasterProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
