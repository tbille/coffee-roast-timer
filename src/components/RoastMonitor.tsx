import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { Play, Pause, Square, ArrowLeft } from "lucide-react";
interface RoastData {
  time: number;
  targetTemp: number;
  currentTemp: number;
}
interface RoastMonitorProps {
  onBack: () => void;
}
const RoastMonitor = ({
  onBack
}: RoastMonitorProps) => {
  const [isRoasting, setIsRoasting] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [targetTemp, setTargetTemp] = useState<string>("200");
  const [currentTemp, setCurrentTemp] = useState<string>("20");
  const [lastRecordedTemp, setLastRecordedTemp] = useState<string>("20");
  const [roastData, setRoastData] = useState<RoastData[]>([]);
  const [firstCrackTime, setFirstCrackTime] = useState<number | null>(null);
  const [secondCrackTime, setSecondCrackTime] = useState<number | null>(null);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRoasting) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRoasting]);

  // Submit temperature function
  const handleSubmitTemperature = () => {
    if (isRoasting && elapsedTime > 0) {
      const newDataPoint: RoastData = {
        time: elapsedTime,
        targetTemp: parseFloat(targetTemp) || 0,
        currentTemp: parseFloat(currentTemp) || 0
      };
      setRoastData(prev => [...prev, newDataPoint]);
      setLastRecordedTemp(currentTemp);
    }
  };
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  const handleStart = () => setIsRoasting(true);
  const handlePause = () => setIsRoasting(false);
  const handleStop = () => {
    setIsRoasting(false);
    setElapsedTime(0);
    setRoastData([]);
    setFirstCrackTime(null);
    setSecondCrackTime(null);
  };
  
  
  const handleFirstCrack = () => {
    if (isRoasting && !firstCrackTime) {
      setFirstCrackTime(elapsedTime);
      // Add data point to graph
      const newDataPoint: RoastData = {
        time: elapsedTime,
        targetTemp: parseFloat(targetTemp) || 0,
        currentTemp: parseFloat(currentTemp) || 0
      };
      setRoastData(prev => [...prev, newDataPoint]);
      setLastRecordedTemp(currentTemp);
    }
  };
  
  const handleSecondCrack = () => {
    if (isRoasting && !secondCrackTime) {
      setSecondCrackTime(elapsedTime);
      // Add data point to graph
      const newDataPoint: RoastData = {
        time: elapsedTime,
        targetTemp: parseFloat(targetTemp) || 0,
        currentTemp: parseFloat(currentTemp) || 0
      };
      setRoastData(prev => [...prev, newDataPoint]);
      setLastRecordedTemp(currentTemp);
    }
  };
  return <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Roast Monitor</h1>
          <div></div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="space-y-6">
            {/* Timer Card */}
            <Card className="shadow-coffee">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Roast Timer</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-6xl font-mono font-bold text-primary mb-4">
                  {formatTime(elapsedTime)}
                </div>
                <div className="flex gap-2 justify-center">
                  {!isRoasting ? <Button onClick={handleStart} className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      Start
                    </Button> : <Button onClick={handlePause} variant="secondary" className="flex items-center gap-2">
                      <Pause className="h-4 w-4" />
                      Pause
                    </Button>}
                  <Button onClick={handleStop} variant="destructive" className="flex items-center gap-2">
                    <Square className="h-4 w-4" />
                    Stop
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Temperature Controls */}
            <Card className="shadow-coffee">
              <CardHeader>
                <CardTitle>Temperature Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="target-temp">Target Temperature (°C)</Label>
                  <Input id="target-temp" type="number" value={targetTemp} onChange={e => setTargetTemp(e.target.value)} placeholder="200" />
                </div>
                <div>
                  <Label htmlFor="current-temp">Current Temperature (°C)</Label>
                  <Input id="current-temp" type="number" value={currentTemp} onChange={e => setCurrentTemp(e.target.value)} placeholder="20" />
                  <Button onClick={handleSubmitTemperature} disabled={!isRoasting} className="w-full mt-2">
                    Record Temperature
                  </Button>
                </div>
                
                {/* Crack Events */}
                <div className="space-y-2">
                  <Label>Roast Events</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={handleFirstCrack} 
                      disabled={!isRoasting || firstCrackTime !== null}
                      variant="outline"
                      size="sm"
                    >
                      {firstCrackTime !== null ? `First Crack (${formatTime(firstCrackTime)})` : 'First Crack'}
                    </Button>
                    <Button 
                      onClick={handleSecondCrack} 
                      disabled={!isRoasting || secondCrackTime !== null}
                      variant="outline"
                      size="sm"
                    >
                      {secondCrackTime !== null ? `Second Crack (${formatTime(secondCrackTime)})` : 'Second Crack'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Graph Panel */}
          <div className="lg:col-span-2">
            <Card className="shadow-coffee h-full">
              <CardHeader>
                <CardTitle>Temperature Graph</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={roastData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="time" 
                        stroke="hsl(var(--foreground))" 
                        tickFormatter={formatTime}
                        label={{
                          value: 'Time (MM:SS)',
                          position: 'insideBottom',
                          offset: -10
                        }} 
                      />
                      <YAxis stroke="hsl(var(--foreground))" label={{
                      value: 'Temperature (°C)',
                      angle: -90,
                      position: 'insideLeft'
                    }} />
                      <Tooltip contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)"
                    }} />
                       <Legend />
                       <Line type="monotone" dataKey="targetTemp" stroke="hsl(var(--temperature-hot))" strokeWidth={2} name="Target Temperature" strokeDasharray="5 5" />
                       <Line type="monotone" dataKey="currentTemp" stroke="hsl(var(--primary))" strokeWidth={3} name="Current Temperature" />
                       {firstCrackTime && (
                          <ReferenceLine 
                            x={firstCrackTime} 
                            stroke="hsl(var(--destructive))" 
                            strokeWidth={2}
                            strokeDasharray="3 3"
                            label={{ value: "First crack", position: "top" }}
                          />
                        )}
                        {secondCrackTime && (
                          <ReferenceLine 
                            x={secondCrackTime} 
                            stroke="hsl(var(--chart-2))" 
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            label={{ value: "Second crack", position: "bottom" }}
                          />
                        )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {roastData.length === 0 && <div className="flex items-center justify-center h-96 text-muted-foreground">
                    <div className="text-center">
                      <p className="text-lg mb-2">Start roasting to see the temperature graph</p>
                      <p className="text-sm">Data points will appear as you monitor your roast</p>
                    </div>
                  </div>}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>;
};
export default RoastMonitor;