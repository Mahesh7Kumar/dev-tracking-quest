import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id?: string;
  display_name?: string;
  avatar_url?: string;
  dark_mode?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInWithProvider: (provider: 'google' | 'github') => Promise<{ error: any }>;
  updateProfile: (updates: UserProfile) => Promise<{ error: any }>;
  updateDarkMode: (darkMode: boolean) => Promise<{ error: any }>;
  uploadAvatar: (file: File) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile>({});
  const [loading, setLoading] = useState(true);

  // Fetch profile from database
  const fetchProfile = async (userData: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userData.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        const newProfile = {
          id: data.id,
          display_name: data.display_name,
          avatar_url: data.avatar_url,
          dark_mode: data.dark_mode ?? false,
        };
        setProfile(newProfile);
        
        // Apply dark mode to document
        if (newProfile.dark_mode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Sync profile data and apply dark mode
  const syncProfile = (userData: User | null) => {
    if (userData) {
      fetchProfile(userData);
    } else {
      setProfile({});
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        syncProfile(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      syncProfile(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const signInWithProvider = async (provider: 'google' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });
    return { error };
  };

  const updateProfile = async (updates: UserProfile) => {
    if (!user) return { error: new Error('User not authenticated') };
    
    try {
      // Update profile in database
      const { error: dbError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: updates.display_name,
          avatar_url: updates.avatar_url,
          dark_mode: updates.dark_mode,
        }, {
          onConflict: 'user_id'
        });

      if (dbError) return { error: dbError };

      // Update local state immediately
      const newProfile = { ...profile, ...updates };
      setProfile(newProfile);
      
      // Apply dark mode to document
      if (updates.dark_mode !== undefined) {
        if (updates.dark_mode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const updateDarkMode = async (darkMode: boolean) => {
    if (!user) return { error: new Error('User not authenticated') };
    
    try {
      // Update database
      const { error: dbError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          dark_mode: darkMode,
        }, {
          onConflict: 'user_id'
        });

      if (dbError) return { error: dbError };

      // Update local state
      const newProfile = { ...profile, dark_mode: darkMode };
      setProfile(newProfile);
      
      // Apply dark mode to document
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Delete existing avatar if it exists
      if (profile.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) return { error: uploadError };

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      return await updateProfile({ avatar_url: publicUrl });
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithProvider,
    updateProfile,
    updateDarkMode,
    uploadAvatar,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}