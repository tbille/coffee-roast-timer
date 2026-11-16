import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { lazy, Suspense, type ReactNode } from "react";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/hooks/useAuth";
import { RoasterProvider } from "@/contexts/RoasterContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";
import { DocsScrollTop } from "@/components/navigation/DocsScrollTop";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { RoastingProvider, useRoasting } from "@/contexts/RoastingContext";
import { ThemeProvider } from "next-themes";
import { cn } from "@/lib/utils";
import { DraftSync } from "@/components/review/DraftSync";

// Lazy-load non-critical routes to improve first load
const RoastTimer = lazy(() => import("./pages/RoastTimer"));
const Auth = lazy(() => import("./pages/Auth"));
const About = lazy(() => import("./pages/About"));
const MyRoasts = lazy(() => import("./pages/MyRoasts"));
const Discover = lazy(() => import("./pages/Discover"));
const RoastProfileDetails = lazy(() => import("./pages/RoastProfileDetails"));
const HowTo = lazy(() => import("./pages/how-to/HowTo"));
const GettingStarted = lazy(() => import("./pages/how-to/GettingStarted"));
const UsingProfiles = lazy(() => import("./pages/how-to/UsingProfiles"));
const CuppingNotes = lazy(() => import("./pages/how-to/CuppingNotes"));
const DevelopmentRatios = lazy(() => import("./pages/how-to/DevelopmentRatios"));
const FirstCrackTiming = lazy(() => import("./pages/how-to/FirstCrackTiming"));
const RoastDefects = lazy(() => import("./pages/how-to/RoastDefects"));
const BehmorTroubleshooting = lazy(() => import("./pages/how-to/BehmorTroubleshooting"));
const PopcornPopperSafety = lazy(() => import("./pages/how-to/PopcornPopperSafety"));
const RoastNumbers = lazy(() => import("./pages/how-to/RoastNumbers"));
const GeneCafeCBR101 = lazy(() => import("./pages/how-to/roasters/GeneCafeCBR101"));
const Behmor2000AB = lazy(() => import("./pages/how-to/roasters/Behmor2000AB"));
const FreshRoastSR800 = lazy(() => import("./pages/how-to/roasters/FreshRoastSR800"));
const KaldiWide = lazy(() => import("./pages/how-to/roasters/KaldiWide"));
const HottopKN8828 = lazy(() => import("./pages/how-to/roasters/HottopKN8828"));
const PopcornPopper = lazy(() => import("./pages/how-to/roasters/PopcornPopper"));
const ComparisonPage = lazy(() => import("./components/comparison/ComparisonPage").then(m => ({ default: m.ComparisonPage })));

// Simple loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-pulse text-muted-foreground">Loading...</div>
  </div>
);

const withPageLoader = (element: ReactNode) => (
  <Suspense fallback={<PageLoader />}>
    {element}
  </Suspense>
);

const queryClient = new QueryClient();

/** Main landmark; leaves room for the mobile tab bar unless a roast is running full-viewport. */
const Main = ({ children }: { children: ReactNode }) => {
  const { roasting } = useRoasting();
  return (
    <main
      id="main"
      tabIndex={-1}
      className={cn("flex-1 focus:outline-hidden", !roasting && "pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0")}
    >
      {children}
    </main>
  );
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
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
          <RoastingProvider>
          <div className="min-h-screen flex flex-col">
            <Toaster />
            <DraftSync />
            <BrowserRouter>
              <AnalyticsTracker />
              <DocsScrollTop />
              <Header />
              <Main>
              <Routes>
                {/* Landing Page */}
                <Route path="/" element={<LandingPage />} />
                
                {/* Roast Timer */}
                <Route path="/roast" element={withPageLoader(<RoastTimer />)} />
                
                {/* Auth & User Pages */}
                <Route path="/auth" element={withPageLoader(<Auth />)} />
                {/* My roasts works signed-out (local drafts), so it is not protected */}
                <Route path="/roasts" element={withPageLoader(<MyRoasts />)} />
                <Route path="/dashboard" element={<Navigate to="/roasts" replace />} />
                
                {/* Discovery & Profiles */}
                <Route path="/discover" element={withPageLoader(<Discover />)} />
                <Route path="/profile/:id" element={withPageLoader(<RoastProfileDetails />)} />
                {/* Compare works signed-out for public roasts */}
                <Route path="/compare" element={withPageLoader(<ComparisonPage />)} />
                
                {/* Info Pages */}
                <Route path="/about" element={withPageLoader(<About />)} />
                
                {/* How To pages */}
                <Route path="/how-to" element={withPageLoader(<HowTo />)} />
                <Route path="/how-to/getting-started" element={withPageLoader(<GettingStarted />)} />
                <Route path="/how-to/using-profiles" element={withPageLoader(<UsingProfiles />)} />
                <Route path="/how-to/cupping-notes" element={withPageLoader(<CuppingNotes />)} />
                <Route path="/how-to/development-ratios" element={withPageLoader(<DevelopmentRatios />)} />
                <Route path="/how-to/first-crack-timing" element={withPageLoader(<FirstCrackTiming />)} />
                <Route path="/how-to/roast-defects" element={withPageLoader(<RoastDefects />)} />
                <Route path="/how-to/behmor-2000ab-troubleshooting" element={withPageLoader(<BehmorTroubleshooting />)} />
                <Route path="/how-to/popcorn-popper-safety" element={withPageLoader(<PopcornPopperSafety />)} />
                <Route path="/how-to/roast-numbers" element={withPageLoader(<RoastNumbers />)} />
                <Route path="/how-to/roasters/gene-cafe-cbr-101" element={withPageLoader(<GeneCafeCBR101 />)} />
                <Route path="/how-to/roasters/behmor-2000ab" element={withPageLoader(<Behmor2000AB />)} />
                <Route path="/how-to/roasters/freshroast-sr800" element={withPageLoader(<FreshRoastSR800 />)} />
                <Route path="/how-to/roasters/kaldi-wide" element={withPageLoader(<KaldiWide />)} />
                <Route path="/how-to/roasters/hottop-kn-8828" element={withPageLoader(<HottopKN8828 />)} />
                <Route path="/how-to/roasters/popcorn-popper" element={withPageLoader(<PopcornPopper />)} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Main>
              <Footer />
              <BottomTabBar />
            </BrowserRouter>
          </div>
          </RoastingProvider>
        </TooltipProvider>
        </RoasterProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
  </ThemeProvider>
);

export default App;
