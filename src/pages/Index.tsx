import { useState } from "react";
import HomePage from "@/components/HomePage";
import RoastMonitor from "@/components/RoastMonitor";

const Index = () => {
  const [currentView, setCurrentView] = useState<"home" | "roast">("home");

  const handleStartRoast = () => {
    setCurrentView("roast");
  };

  const handleBackToHome = () => {
    setCurrentView("home");
  };

  if (currentView === "roast") {
    return <RoastMonitor onBack={handleBackToHome} />;
  }

  return <HomePage onStartRoast={handleStartRoast} />;
};

export default Index;
