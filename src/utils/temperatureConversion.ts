export type TemperatureUnit = 'C' | 'F';

export const convertTemperature = (temp: number, from: TemperatureUnit, to: TemperatureUnit): number => {
  if (from === to) return temp;
  
  if (from === 'C' && to === 'F') {
    return (temp * 9/5) + 32;
  } else if (from === 'F' && to === 'C') {
    return (temp - 32) * 5/9;
  }
  
  return temp;
};

export const formatTemperature = (temp: number, unit: TemperatureUnit): string => {
  return `${Math.round(temp * 10) / 10}°${unit}`;
};