import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee, Timer, TrendingUp } from "lucide-react";

interface HomePageProps {
  onStartRoast: () => void;
}

const HomePage = ({ onStartRoast }: HomePageProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary to-coffee-dark text-primary-foreground">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex justify-center mb-6">
              <Coffee className="h-16 w-16 text-accent" />
            </div>
            <h1 className="text-5xl font-bold mb-6">Coffee Roast Monitor</h1>
            <p className="text-xl mb-8 text-primary-foreground/90">
              Track your coffee bean roasting with precision. Monitor temperatures, 
              timing, and achieve the perfect roast every time.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={onStartRoast}
              className="text-lg px-8 py-6 shadow-warm hover:scale-105 transition-transform"
            >
              <Timer className="mr-2 h-5 w-5" />
              Start New Roast
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Professional Roast Monitoring
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to monitor and perfect your coffee roasting process
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="shadow-coffee border-border/50">
            <CardHeader className="text-center">
              <Timer className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-xl">Precise Timing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Track roasting time with accuracy to achieve consistent results every batch
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="shadow-coffee border-border/50">
            <CardHeader className="text-center">
              <TrendingUp className="h-12 w-12 text-temperature-hot mx-auto mb-4" />
              <CardTitle className="text-xl">Temperature Control</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Monitor both target and actual temperatures with real-time graphing
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="shadow-coffee border-border/50">
            <CardHeader className="text-center">
              <Coffee className="h-12 w-12 text-coffee-medium mx-auto mb-4" />
              <CardTitle className="text-xl">Roast Profiles</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Visualize your roasting curve and perfect your technique over time
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomePage;