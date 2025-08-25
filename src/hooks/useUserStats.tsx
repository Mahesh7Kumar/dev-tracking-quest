import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserStats {
  user_id: string;
  xp: number;
  level: number;
  streak: number;
  last_completed: string | null;
  created_at: string;
  updated_at: string;
}

export function useUserStats() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as UserStats | null;
    },
    enabled: !!user,
  });

  const createStats = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('user_stats')
        .insert({
          user_id: user.id,
          xp: 0,
          level: 1,
          streak: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    },
  });

  return {
    stats,
    isLoading,
    createStats: createStats.mutate,
  };
}