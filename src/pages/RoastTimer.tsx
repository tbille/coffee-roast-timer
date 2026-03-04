import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import RoastMonitor from "@/components/RoastMonitor";
import { useRoaster } from "@/contexts/RoasterContext";
import type { RoasterType } from "@/types/roaster.types";

const RoastTimer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { switchRoaster } = useRoaster();
  
  // Handle roaster selection from landing page
  useEffect(() => {
    const roasterType = location.state?.roasterType as RoasterType;
    if (roasterType) {
      switchRoaster(roasterType);
      navigate(location.pathname, { replace: true });
    }
  }, [location.pathname, location.state, navigate, switchRoaster]);

  return (
    <>
      <Helmet>
        <title>Roast Timer - Track Your Coffee Roast in Real Time</title>
        <meta name="description" content="Use our real-time coffee roast timer to track temperature, mark crack events, and monitor your roast progress. Save and share your roast profiles." />
        <meta name="keywords" content="coffee roast timer, real-time roast tracking, coffee roasting monitor, roast temperature tracker" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://roast-timer.com/roast" />
      </Helmet>
      <RoastMonitor />
    </>
  );
};

export default RoastTimer;
