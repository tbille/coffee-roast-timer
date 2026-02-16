import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Sitemap from "./pages/Sitemap";
import { AuthProvider } from "@/hooks/useAuth";
import { RoasterProvider } from "@/contexts/RoasterContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RoasterProvider>
          <TooltipProvider>
          <div className="min-h-screen flex flex-col">
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Header />
              <div className="flex-1">
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/discover" element={
                  <Suspense fallback={<PageLoader />}>
                    <Discover />
                  </Suspense>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <Dashboard />
                    </Suspense>
                  </ProtectedRoute>
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
                <Route path="/about" element={<About />} />
                <Route path="/sitemap.xml" element={<Sitemap />} />
                <Route path="/" element={<Index />} />
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
