import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, Coffee, MapPin, Scale, Trash2, Settings, GitCompare } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import UserSettingsDialog from "@/components/UserSettingsDialog";
import { RoasterFilter } from "@/components/dashboard/RoasterFilter";
import { ROASTER_SPECS } from "@/utils/roasterRegistry";
import { getRoasterBadgeClasses } from "@/utils/roasterColors";
import type { RoasterType } from "@/types/roaster.types";

interface RoastProfile {
  id: string;
  beans_name: string;
  origin?: string;
  farm_name?: string;
  roast_process?: string;
  initial_weight?: number;
  final_weight?: number;
  duration_seconds: number;
  temperature_data: any;
  crack_events: any;
  created_at: string;
  roaster_type?: RoasterType;
}
const Dashboard = () => {
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [profiles, setProfiles] = useState<RoastProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<RoastProfile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [selectedRoaster, setSelectedRoaster] = useState<RoasterType | "all">("all");
  const [profileCounts, setProfileCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      fetchProfiles();
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    filterProfiles();
    calculateProfileCounts();
  }, [profiles, selectedRoaster]);

  const calculateProfileCounts = () => {
    const counts: Record<string, number> = { total: profiles.length, unknown: 0 };
    
    profiles.forEach((profile) => {
      if (!profile.roaster_type) {
        counts.unknown = (counts.unknown || 0) + 1;
      } else {
        counts[profile.roaster_type] = (counts[profile.roaster_type] || 0) + 1;
      }
    });
    
    setProfileCounts(counts);
  };

  const filterProfiles = () => {
    if (selectedRoaster === "all") {
      setFilteredProfiles(profiles);
    } else if (selectedRoaster === "unknown") {
      setFilteredProfiles(profiles.filter(p => !p.roaster_type));
    } else {
      setFilteredProfiles(profiles.filter(p => p.roaster_type === selectedRoaster));
    }
  };
  const fetchProfiles = async () => {
    if (!user) return;
    
    try {
      const {
        data,
        error
      } = await supabase
        .from('roast_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', {
          ascending: false
        });
      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "Error",
        description: "Failed to load your roast profiles.",
        variant: "destructive"
      });
    } finally {
      setLoadingProfiles(false);
    }
  };
  const handleDeleteProfile = async (profileId: string) => {
    try {
      const {
        error
      } = await supabase.from('roast_profiles').delete().eq('id', profileId);
      if (error) throw error;
      setProfiles(prev => prev.filter(p => p.id !== profileId));
      toast({
        title: "Profile Deleted",
        description: "Your roast profile has been deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete the roast profile. Please try again.",
        variant: "destructive"
      });
    }
  };
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const getWeightLoss = (initial?: number, final?: number): string => {
    if (!initial || !final) return "N/A";
    const loss = initial - final;
    const percentage = loss / initial * 100;
    return `${loss.toFixed(1)}g (${percentage.toFixed(1)}%)`;
  };

  const getRoasterDisplayName = (roasterType?: RoasterType): string => {
    if (!roasterType) return "Unknown";
    const roaster = ROASTER_SPECS[roasterType];
    return roaster ? `${roaster.manufacturer} ${roaster.name}` : roasterType;
  };
  if (loading || loadingProfiles) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-foreground">Loading dashboard...</div>
        </div>
      </div>;
  }
  return <div className="bg-background p-2 sm:p-4 overflow-x-hidden">
      <div className="container mx-auto max-w-6xl w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground text-center">My Roast Profiles</h1>
          <div className="flex justify-center items-center gap-4 mt-2">
            <Badge variant="secondary" className="text-xs">
              {filteredProfiles.length} of {profiles.length} profile{profiles.length !== 1 ? 's' : ''}
            </Badge>
            {profiles.length >= 2 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/compare')}
                className="flex items-center gap-2"
              >
                <GitCompare className="h-4 w-4" />
                Compare Profiles
              </Button>
            )}
          </div>
        </div>

        {/* Filter Section */}
        <Card className="shadow-coffee mb-6">
          <CardContent className="p-4">
            <RoasterFilter 
              value={selectedRoaster} 
              onChange={setSelectedRoaster}
              profileCounts={profileCounts}
              className="max-w-md mx-auto"
            />
          </CardContent>
        </Card>

        {/* Profiles Grid */}
        {filteredProfiles.length === 0 ? <Card className="shadow-coffee">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Coffee className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {profiles.length === 0 ? "No roast profiles yet" : "No profiles match this filter"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {profiles.length === 0 
                    ? "Start roasting and save your first profile to see it here!" 
                    : "Try selecting a different roaster or view all profiles."}
                </p>
                {profiles.length === 0 ? (
                  <Button onClick={() => navigate('/')}>
                    Start Roasting
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => setSelectedRoaster("all")}>
                    Show All Profiles
                  </Button>
                )}
              </div>
            </CardContent>
          </Card> : <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map(profile => <Card key={profile.id} className="shadow-coffee cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/profile/${profile.id}`)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <CardTitle className="text-lg font-bold text-primary">
                          {profile.beans_name}
                        </CardTitle>
                        {profile.roaster_type && (
                          <Badge className={`text-xs ${getRoasterBadgeClasses(profile.roaster_type)}`}>
                            {getRoasterDisplayName(profile.roaster_type)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(profile.created_at)}
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={e => e.stopPropagation()}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Roast Profile</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this roast profile? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteProfile(profile.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatTime(profile.duration_seconds)}</span>
                  </div>
                  
                  {profile.origin && <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.origin}</span>
                    </div>}
                  
                  {profile.farm_name && <div className="text-sm text-muted-foreground">
                      Farm: {profile.farm_name}
                    </div>}
                  
                  {profile.roast_process && <div className="text-sm">
                      <span className="font-medium">Process:</span> {profile.roast_process}
                    </div>}
                  
                  {(profile.initial_weight || profile.final_weight) && <div className="flex items-center gap-2 text-sm">
                      <Scale className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-col">
                        {profile.initial_weight && <span>Initial: {profile.initial_weight}g</span>}
                        {profile.final_weight && <span>Final: {profile.final_weight}g</span>}
                        {profile.initial_weight && profile.final_weight && <span className="text-muted-foreground text-xs">
                            Loss: {getWeightLoss(profile.initial_weight, profile.final_weight)}
                          </span>}
                      </div>
                    </div>}
                  
                  
                </CardContent>
              </Card>)}
          </div>}

        {/* Settings Section */}
        <div className="mt-12 pt-8 border-t">
          <Card className="shadow-coffee">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">Account Management</p>
                    <p className="text-sm text-muted-foreground">
                      Manage your account settings and data
                    </p>
                  </div>
                  <UserSettingsDialog
                    trigger={
                      <Button variant="outline" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Button>
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
};
export default Dashboard;