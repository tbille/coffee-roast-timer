import { useLocation } from "react-router-dom";
import RoastMonitor from "@/components/RoastMonitor";

interface ReferenceProfile {
  beans_name?: string;
  origin?: string;
  farm_name?: string;
  roast_process?: string;
  initial_weight?: number;
  temperature_data?: any[];
}

const Index = () => {
  const location = useLocation();
  const referenceProfile = location.state?.referenceProfile as ReferenceProfile;

  return <RoastMonitor referenceProfile={referenceProfile} />;
};

export default Index;
