import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee, Timer, TrendingUp, Globe, Users, Search } from "lucide-react";

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

      {/* Discovery Section */}
      <div className="bg-gradient-to-r from-coffee-light/10 to-accent/10 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <Globe className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Discover Roasts from Around the World
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto mb-8">
              Connect with coffee enthusiasts globally. Explore unique roast profiles, 
              learn new techniques, and get inspired by the creativity of fellow roasters 
              from different cultures and traditions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Community Profiles</h3>
                <p className="text-muted-foreground">
                  Browse roast profiles shared by passionate coffee roasters worldwide
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Search className="h-8 w-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Search & Filter</h3>
                <p className="text-muted-foreground">
                  Find profiles by bean origin, roaster type, or processing method
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button 
              asChild
              size="lg"
              className="text-lg px-8 py-6 shadow-warm hover:scale-105 transition-transform"
            >
              <Link to="/discover">
                <Globe className="mr-2 h-5 w-5" />
                Explore Global Roasts
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;