import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Settings, User, Palette, LogOut } from 'lucide-react';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { user, profile, signOut, updateProfile } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(profile.display_name || user?.email?.split('@')[0] || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      const { error } = await updateProfile({ display_name: displayName });

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your display name has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDarkModeToggle = async (checked: boolean) => {
    try {
      const { error } = await updateProfile({ darkMode: checked });
      
      if (error) throw error;

      toast({
        title: "Theme Updated",
        description: `Switched to ${checked ? 'dark' : 'light'} mode.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update theme. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onOpenChange(false);
    toast({
      title: "Signed Out",
      description: "You have been signed out successfully.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-primary" />
            <span>Profile Settings</span>
          </DialogTitle>
          <DialogDescription>
            Manage your account settings and preferences
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Profile</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="bg-secondary/50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                className="bg-secondary/50"
              />
            </div>
            
            <Button 
              onClick={handleUpdateProfile}
              disabled={isUpdating || !displayName.trim()}
              className="w-full"
            >
              {isUpdating ? 'Updating...' : 'Update Profile'}
            </Button>
          </div>

          {/* Theme Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Appearance</h3>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="theme-toggle">Dark Mode</Label>
                <p className="text-xs text-muted-foreground">
                  Toggle between light and dark themes
                </p>
              </div>
              <Switch
                id="theme-toggle"
                checked={profile.darkMode ?? false}
                onCheckedChange={handleDarkModeToggle}
              />
            </div>
          </div>

          {/* Sign Out Section */}
          <div className="pt-4 border-t border-border/50">
            <Button 
              onClick={handleSignOut}
              variant="destructive"
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}