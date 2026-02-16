import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import RoastMonitor from "@/components/RoastMonitor";
import { useRoaster } from "@/contexts/RoasterContext";
import type { RoasterType } from "@/types/roaster.types";

const RoastTimer = () => {
  const location = useLocation();
  const { switchRoaster } = useRoaster();
  
  // Handle roaster selection from landing page
  useEffect(() => {
    const roasterType = location.state?.roasterType as RoasterType;
    if (roasterType) {
      switchRoaster(roasterType);
    }
  }, [location.state, switchRoaster]);

  return <RoastMonitor />;
};

export default RoastTimer;
