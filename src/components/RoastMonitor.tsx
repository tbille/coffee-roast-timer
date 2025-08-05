import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { Play, Pause, Square, LogOut, RotateCcw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import SaveRoastDialog from "./SaveRoastDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

interface RoastMonitorProps {
  onBack?: () => void;
}

const RoastMonitor = ({
  onBack
}: RoastMonitorProps) => {
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isRoasting, setIsRoasting] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [targetTemp, setTargetTemp] = useState<string>("200");
  const [currentTemp, setCurrentTemp] = useState<string>("20");
  const [lastRecordedTemp, setLastRecordedTemp] = useState<string>("20");
  const [roastData, setRoastData] = useState<RoastData[]>([]);
  const [crackEvents, setCrackEvents] = useState<CrackEvent[]>([]);
  const [referenceProfile, setReferenceProfile] = useState<RoastData[] | null>(null);
  const [referenceProfileName, setReferenceProfileName] = useState<string>("");

  // Load reference profile if specified in URL
  useEffect(() => {
    const referenceId = searchParams.get('reference');
    if (referenceId) {
      loadReferenceProfile(referenceId);
    }
  }, [searchParams]);

  // Load persisted roast state on component mount
  useEffect(() => {
    const savedState = localStorage.getItem('roastTimerState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        setElapsedTime(state.elapsedTime || 0);
        setTargetTemp(state.targetTemp || "200");
        setCurrentTemp(state.currentTemp || "20");
        setLastRecordedTemp(state.lastRecordedTemp || "20");
        setRoastData(state.roastData || []);
        setCrackEvents(state.crackEvents || []);
        setIsRoasting(false); // Never auto-resume roasting for safety
      } catch (error) {
        console.error('Error loading saved roast state:', error);
      }
    }
  }, []);

  // Save roast state to localStorage whenever it changes
  useEffect(() => {
    const state = {
      elapsedTime,
      targetTemp,
      currentTemp,
      lastRecordedTemp,
      roastData,
      crackEvents,
      isRoasting: false // Don't persist running state for safety
    };
    localStorage.setItem('roastTimerState', JSON.stringify(state));
  }, [elapsedTime, targetTemp, currentTemp, lastRecordedTemp, roastData, crackEvents]);

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

  const loadReferenceProfile = async (profileId: string) => {
    try {
      const { data, error } = await supabase
        .from('roast_profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (error) throw error;

      if (data) {
        // Convert the stored JSON data back to RoastData format
        const tempData = Array.isArray(data.temperature_data) ? data.temperature_data as unknown as RoastData[] : [];
        setReferenceProfile(tempData);
        setReferenceProfileName(data.beans_name);
        toast({
          title: "Reference Profile Loaded",
          description: `Loaded "${data.beans_name}" as reference. Try to replicate this roast!`
        });
      }
    } catch (error) {
      console.error('Error loading reference profile:', error);
      toast({
        title: "Error",
        description: "Failed to load reference profile.",
        variant: "destructive"
      });
    }
  };

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

  const handleFirstCrack = () => {
    console.log('First crack clicked', { isRoasting, elapsedTime, targetTemp, currentTemp });
    if (isRoasting && elapsedTime > 0 && !crackEvents.some(e => e.type === 'first')) {
      const crackEvent: CrackEvent = {
        time: elapsedTime,
        targetTemp: parseFloat(targetTemp) || 0,
        currentTemp: parseFloat(currentTemp) || 0,
        type: 'first'
      };
      console.log('Adding first crack event:', crackEvent);
      setCrackEvents(prev => {
        const newEvents = [...prev, crackEvent];
        console.log('Updated crack events:', newEvents);
        return newEvents;
      });
    } else {
      console.log('Cannot add first crack - conditions not met');
    }
  };

  const handleSecondCrack = () => {
    console.log('Second crack clicked', { isRoasting, elapsedTime, targetTemp, currentTemp });
    if (isRoasting && elapsedTime > 0 && 
        crackEvents.some(e => e.type === 'first') && 
        !crackEvents.some(e => e.type === 'second')) {
      const crackEvent: CrackEvent = {
        time: elapsedTime,
        targetTemp: parseFloat(targetTemp) || 0,
        currentTemp: parseFloat(currentTemp) || 0,
        type: 'second'
      };
      console.log('Adding second crack event:', crackEvent);
      setCrackEvents(prev => {
        const newEvents = [...prev, crackEvent];
        console.log('Updated crack events:', newEvents);
        return newEvents;
      });
    } else {
      console.log('Cannot add second crack - conditions not met');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate development percentage
  const calculateDevelopment = (): number => {
    const firstCrackEvent = crackEvents.find(e => e.type === 'first');
    if (!firstCrackEvent || elapsedTime === 0) return 0;
    return 100 - (firstCrackEvent.time / elapsedTime) * 100;
  };
  const handleStart = () => {
    // Reset everything when starting a new roast (but keep reference profile)
    setElapsedTime(0);
    setRoastData([]);
    setCrackEvents([]);
    setIsRoasting(true);
    // Clear any persisted state when starting fresh
    localStorage.removeItem('roastTimerState');
  };
  
  const handlePause = () => setIsRoasting(false);
  
  const handleStop = () => {
    setIsRoasting(false);
    // State is automatically saved via useEffect
  };

  const handleReset = () => {
    setElapsedTime(0);
    setRoastData([]);
    setCrackEvents([]);
    setTargetTemp("200");
    setCurrentTemp("20");
    setLastRecordedTemp("20");
    setIsRoasting(false);
    localStorage.removeItem('roastTimerState');
  };
  return <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-6xl">
         {/* Header */}
         <div className="flex items-center justify-between mb-6">
           <h1 className="text-3xl font-bold text-foreground">Coffee Roast Monitor</h1>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = '/dashboard'}
                    className="flex items-center gap-2"
                  >
                    My Profiles
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Welcome, {user?.email}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={signOut}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = '/auth'}
                  className="flex items-center gap-2"
                >
                  Sign In
                </Button>
              )}
            </div>
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
                  {!isRoasting && elapsedTime > 0 ? (
                    <Button onClick={handleReset} variant="outline" className="flex items-center gap-2">
                      <RotateCcw className="h-4 w-4" />
                      Reset
                    </Button>
                  ) : (
                    <Button onClick={handleStop} variant="destructive" className="flex items-center gap-2">
                      <Square className="h-4 w-4" />
                      Stop
                    </Button>
                  )}
                </div>
                
                 {/* Save Profile Button - Only show when roast is stopped and has data */}
                 {!isRoasting && elapsedTime > 0 && (
                   <div className="mt-4">
                     <SaveRoastDialog 
                       elapsedTime={elapsedTime}
                       roastData={roastData}
                       crackEvents={crackEvents}
                       disabled={elapsedTime === 0 || roastData.length === 0}
                     />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Marketing content moved here */}
              <Card className="shadow-coffee border-accent/20">
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    <h3 className="font-semibold text-foreground">Why Track Your Roasts?</h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• Achieve consistent results every time</p>
                      <p>• Learn from your roasting patterns</p>
                      <p>• Perfect your favorite profiles</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bean Development Section - Only show after first crack */}
              {crackEvents.some(e => e.type === 'first') && (
                <Card className="shadow-coffee">
                  <CardHeader>
                    <CardTitle>Bean Development</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary mb-2">
                        {calculateDevelopment().toFixed(1)}%
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Development since first crack
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}


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
                  <Label>Crack Events</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={handleFirstCrack} 
                      disabled={!isRoasting || crackEvents.some(e => e.type === 'first')} 
                      variant={crackEvents.some(e => e.type === 'first') ? "secondary" : "outline"} 
                      className="w-full"
                    >
                      {crackEvents.some(e => e.type === 'first') ? "First Crack ✓" : "First Crack"}
                    </Button>
                    <Button 
                      onClick={handleSecondCrack} 
                      disabled={!isRoasting || !crackEvents.some(e => e.type === 'first') || crackEvents.some(e => e.type === 'second')} 
                      variant={crackEvents.some(e => e.type === 'second') ? "secondary" : "outline"} 
                      className="w-full"
                    >
                      {crackEvents.some(e => e.type === 'second') ? "Second Crack ✓" : "Second Crack"}
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
                <CardTitle className="flex items-center justify-between">
                  <span>Temperature Graph</span>
                  {referenceProfile && (
                    <span className="text-sm font-normal text-muted-foreground">
                      Reference: {referenceProfileName}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isRoasting || roastData.length > 0 ? (
                  <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={roastData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="time" 
                          stroke="hsl(var(--foreground))" 
                          label={{
                            value: 'Time (MM:SS)',
                            position: 'insideBottom',
                            offset: -10
                          }} 
                          tickFormatter={formatTime}
                        />
                        <YAxis stroke="hsl(var(--foreground))" label={{
                          value: 'Temperature (°C)',
                          angle: -90,
                          position: 'insideLeft'
                        }} />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "var(--radius)"
                          }} 
                          labelFormatter={(value) => `Time: ${formatTime(value as number)}`}
                        />
                        <Legend />
                        
                        {/* Reference profile lines (dotted) */}
                        {referenceProfile && (
                          <>
                            <Line 
                              type="monotone" 
                              dataKey="currentTemp" 
                              stroke="hsl(var(--muted-foreground))" 
                              strokeWidth={2} 
                              name={`Reference Actual: ${referenceProfileName}`}
                              strokeDasharray="8 4" 
                              data={referenceProfile}
                              connectNulls={false}
                              dot={false}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="targetTemp" 
                              stroke="hsl(var(--muted-foreground))" 
                              strokeWidth={1.5} 
                              name={`Reference Target: ${referenceProfileName}`}
                              strokeDasharray="12 6" 
                              data={referenceProfile}
                              connectNulls={false}
                              dot={false}
                              opacity={0.7}
                            />
                          </>
                        )}
                        
                        {/* Current roast lines */}
                        <Line type="monotone" dataKey="targetTemp" stroke="hsl(var(--temperature-hot))" strokeWidth={2} name="Target Temperature" strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="currentTemp" stroke="hsl(var(--primary))" strokeWidth={3} name="Current Temperature" />
                        
                        {/* Crack events */}
                        {crackEvents.map((crack, index) => (
                          <ReferenceLine 
                            key={`${crack.type}-${index}`}
                            x={crack.time} 
                            stroke={crack.type === 'first' ? "hsl(var(--destructive))" : "hsl(var(--warning))"} 
                            strokeDasharray="5 5"
                            strokeWidth={2}
                            label={{
                              value: crack.type === 'first' ? 'First Crack' : 'Second Crack',
                              position: 'insideTopRight',
                              style: { fontSize: '12px', fill: crack.type === 'first' ? "hsl(var(--destructive))" : "hsl(var(--warning))" }
                            }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-96 text-muted-foreground">
                    <div className="text-center">
                      <p className="text-lg mb-2">
                        {referenceProfile ? "Start roasting to see your progress against the reference" : "Start roasting to see the temperature graph"}
                      </p>
                      <p className="text-sm">
                        {referenceProfile ? `Reference profile: ${referenceProfileName}` : "Data points will appear as you monitor your roast"}
                      </p>
                      {referenceProfile && (
                        <div className="mt-4 p-4 bg-muted rounded-lg">
                          <div className="h-32 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={referenceProfile}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis 
                                  dataKey="time" 
                                  stroke="hsl(var(--foreground))" 
                                  tickFormatter={formatTime}
                                  fontSize={10}
                                />
                                <YAxis stroke="hsl(var(--foreground))" fontSize={10} />
                                <Line 
                                  type="monotone" 
                                  dataKey="currentTemp" 
                                  stroke="hsl(var(--muted-foreground))" 
                                  strokeWidth={2} 
                                  strokeDasharray="8 4" 
                                  dot={false}
                                  name="Actual"
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="targetTemp" 
                                  stroke="hsl(var(--muted-foreground))" 
                                  strokeWidth={1.5} 
                                  strokeDasharray="12 6" 
                                  dot={false}
                                  opacity={0.7}
                                  name="Target"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">Reference Profile Preview</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>;
};
export default RoastMonitor;