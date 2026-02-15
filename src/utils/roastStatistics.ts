// Utility functions for calculating roast statistics

interface RoastData {
  time: number;
  targetTemp: number;
  currentTemp: number;
}

interface CrackEvent {
  time: number;
  targetTemp: number;
  currentTemp: number;
  type: 'first' | 'second';
}

export interface RoastStatistics {
  duration: number;
  firstCrackTime?: number;
  firstCrackTemp?: number;
  secondCrackTime?: number;
  secondCrackTemp?: number;
  finalTemp: number;
  weightLossPercent?: number;
  developmentTime?: number;
  developmentRatio?: number;
}

export const calculateRoastStatistics = (
  durationSeconds: number,
  temperatureData: RoastData[],
  crackEvents: CrackEvent[],
  initialWeight?: number,
  finalWeight?: number
): RoastStatistics => {
  const firstCrack = crackEvents.find((c) => c.type === 'first');
  const secondCrack = crackEvents.find((c) => c.type === 'second');
  const finalTemp = temperatureData[temperatureData.length - 1]?.currentTemp || 0;

  const developmentTime = firstCrack
    ? durationSeconds - firstCrack.time
    : undefined;

  const developmentRatio = developmentTime
    ? (developmentTime / durationSeconds) * 100
    : undefined;

  const weightLossPercent =
    initialWeight && finalWeight
      ? ((initialWeight - finalWeight) / initialWeight) * 100
      : undefined;

  return {
    duration: durationSeconds,
    firstCrackTime: firstCrack?.time,
    firstCrackTemp: firstCrack?.currentTemp,
    secondCrackTime: secondCrack?.time,
    secondCrackTemp: secondCrack?.currentTemp,
    finalTemp,
    weightLossPercent,
    developmentTime,
    developmentRatio,
  };
};

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatPercentage = (value?: number): string => {
  return value !== undefined ? `${value.toFixed(1)}%` : 'N/A';
};

export const formatTemperature = (temp: number, decimals: number = 1): string => {
  return `${temp.toFixed(decimals)}°`;
};

// Calculate Rate of Rise (RoR) - temperature change per minute
export const calculateRoR = (temperatureData: RoastData[]): number[] => {
  const rorData: number[] = [];
  
  for (let i = 0; i < temperatureData.length; i++) {
    if (i === 0) {
      rorData.push(0); // First point has no RoR
      continue;
    }
    
    const currentPoint = temperatureData[i];
    const previousPoint = temperatureData[i - 1];
    
    const timeDiff = (currentPoint.time - previousPoint.time) / 60; // Convert to minutes
    const tempDiff = currentPoint.currentTemp - previousPoint.currentTemp;
    
    const ror = timeDiff > 0 ? tempDiff / timeDiff : 0;
    rorData.push(ror);
  }
  
  return rorData;
};

// Get development percentage (common industry metric)
export const getDevelopmentPercentage = (
  durationSeconds: number,
  firstCrackTime?: number
): number | undefined => {
  if (!firstCrackTime) return undefined;
  const developmentTime = durationSeconds - firstCrackTime;
  return (developmentTime / durationSeconds) * 100;
};

// Classify roast level based on development ratio
export const classifyRoastLevel = (developmentRatio?: number): string => {
  if (!developmentRatio) return 'Unknown';
  
  if (developmentRatio < 15) return 'Very Light';
  if (developmentRatio < 20) return 'Light';
  if (developmentRatio < 25) return 'Medium-Light';
  if (developmentRatio < 30) return 'Medium';
  if (developmentRatio < 35) return 'Medium-Dark';
  return 'Dark';
};

// Calculate statistics from a RoastProfile object
// Convenience wrapper around calculateRoastStatistics for comparison feature
export const calculateProfileStatistics = (profile: {
  duration_seconds: number;
  temperature_data: RoastData[];
  crack_events: CrackEvent[];
  initial_weight?: number;
  final_weight?: number;
}): RoastStatistics => {
  return calculateRoastStatistics(
    profile.duration_seconds,
    profile.temperature_data,
    profile.crack_events,
    profile.initial_weight,
    profile.final_weight
  );
};
