import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Settings, User, Palette, LogOut, Camera, X } from 'lucide-react';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { user, profile, signOut, updateProfile, uploadAvatar } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(profile.display_name || user?.email?.split('@')[0] || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const { error } = await uploadAvatar(file);
      
      if (error) throw error;

      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    setIsUploadingAvatar(true);
    try {
      const { error } = await updateProfile({ avatar_url: null });
      
      if (error) throw error;

      toast({
        title: "Avatar Removed",
        description: "Your profile picture has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
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
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Profile Picture</Label>
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    {profile.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} alt="Profile" />
                    ) : null}
                    <AvatarFallback className="bg-primary/20 text-primary text-lg">
                      {(profile.display_name || user?.email)?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="w-fit"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {isUploadingAvatar ? 'Uploading...' : 'Upload Photo'}
                    </Button>
                    {profile.avatar_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveAvatar}
                        disabled={isUploadingAvatar}
                        className="w-fit text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
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