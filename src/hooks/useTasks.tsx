import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'completed';
  category: 'Work' | 'DSA' | 'Personal';
  xp_reward: number;
  created_at: string;
  completed_at: string | null;
}

export function useTasks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });

  const createTask = useMutation({
    mutationFn: async (task: { title: string; description?: string; category: string; xp_reward: number }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...task,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Quest Created!",
        description: "Your new quest has been added to your journey.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create quest. Please try again.",
        variant: "destructive",
      });
    },
  });

  const completeTask = useMutation({
    mutationFn: async (taskId: string) => {
      if (!user) throw new Error('User not authenticated');

      // Update task status to completed
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single();

      if (taskError) throw taskError;

      // Get or create user stats
      let { data: stats, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (statsError) throw statsError;

      // Create stats if doesn't exist
      if (!stats) {
        const { data: newStats, error: createError } = await supabase
          .from('user_stats')
          .insert({
            user_id: user.id,
            xp: 0,
            level: 1,
            streak: 0,
            last_completed: null,
          })
          .select()
          .single();

        if (createError) throw createError;
        stats = newStats;
      }

      // Calculate new XP and level
      let newXp = (stats.xp || 0) + taskData.xp_reward;
      let newLevel = stats.level || 1;
      
      while (newXp >= 100) {
        newLevel += 1;
        newXp -= 100;
      }

      // Calculate streak
      const today = new Date().toDateString();
      const lastCompleted = stats.last_completed ? new Date(stats.last_completed).toDateString() : null;
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      
      let newStreak = stats.streak || 0;
      
      if (!lastCompleted || lastCompleted === yesterday) {
        // First task ever or completed task yesterday - increment streak
        newStreak += 1;
      } else if (lastCompleted !== today) {
        // Missed a day - reset streak
        newStreak = 1;
      }
      // If lastCompleted === today, keep current streak (already completed today)

      // Update user stats
      const { error: updateError } = await supabase
        .from('user_stats')
        .update({
          xp: newXp,
          level: newLevel,
          streak: newStreak,
          last_completed: today,
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      return taskData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      toast({
        title: "Quest Completed! ⚡",
        description: `You earned ${data.xp_reward} XP!`,
        className: "glow-success",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to complete quest. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Quest Deleted",
        description: "Your quest has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete quest. Please try again.",
        variant: "destructive",
      });
    },
  });

  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const completedTasks = tasks.filter(task => task.status === 'completed');
  const todayTasks = tasks.filter(task => {
    const today = new Date().toDateString();
    const taskDate = new Date(task.completed_at || task.created_at).toDateString();
    return task.status === 'completed' && taskDate === today;
  });

  return {
    tasks,
    pendingTasks,
    completedTasks,
    todayTasks,
    isLoading,
    createTask: createTask.mutate,
    completeTask: completeTask.mutate,
    deleteTask: deleteTask.mutate,
  };
}