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
      const { data, error } = await supabase
        .from('tasks')
        .update({ status: 'completed' })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
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
    onError: () => {
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