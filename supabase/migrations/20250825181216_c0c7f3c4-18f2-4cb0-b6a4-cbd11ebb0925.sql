-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  category TEXT NOT NULL DEFAULT 'Work' CHECK (category IN ('Work', 'DSA', 'Personal')),
  xp_reward INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create user_stats table
CREATE TABLE public.user_stats (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  streak INTEGER NOT NULL DEFAULT 0,
  last_completed DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Tasks RLS policies
CREATE POLICY "Allow users to read their own tasks" 
ON public.tasks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own tasks" 
ON public.tasks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own tasks" 
ON public.tasks 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own tasks" 
ON public.tasks 
FOR DELETE 
USING (auth.uid() = user_id);

-- User stats RLS policies
CREATE POLICY "Allow users to read their own stats" 
ON public.user_stats 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own stats" 
ON public.user_stats 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own stats" 
ON public.user_stats 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Function to automatically create user stats when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update XP and level when task is completed
CREATE OR REPLACE FUNCTION public.update_user_xp()
RETURNS TRIGGER AS $$
DECLARE
  new_xp INTEGER;
  new_level INTEGER;
  current_date DATE := CURRENT_DATE;
  last_completed_date DATE;
  current_streak INTEGER;
BEGIN
  -- Only proceed if task status changed to completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Set completed_at timestamp
    NEW.completed_at = now();
    
    -- Get current user stats
    SELECT xp, level, streak, last_completed 
    INTO new_xp, new_level, current_streak, last_completed_date
    FROM public.user_stats 
    WHERE user_id = NEW.user_id;
    
    -- Add XP reward
    new_xp := new_xp + NEW.xp_reward;
    
    -- Calculate new level (every 100 XP = 1 level)
    new_level := (new_xp / 100) + 1;
    
    -- Calculate streak
    IF last_completed_date IS NULL THEN
      current_streak := 1;
    ELSIF last_completed_date = current_date THEN
      -- Same day, keep streak
      current_streak := current_streak;
    ELSIF last_completed_date = current_date - INTERVAL '1 day' THEN
      -- Consecutive day, increase streak
      current_streak := current_streak + 1;
    ELSE
      -- Streak broken, reset to 1
      current_streak := 1;
    END IF;
    
    -- Update user stats
    UPDATE public.user_stats 
    SET 
      xp = new_xp,
      level = new_level,
      streak = current_streak,
      last_completed = current_date,
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update XP when task is completed
CREATE TRIGGER on_task_completed
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_user_xp();

-- Create indexes for better performance
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_category ON public.tasks(category);
CREATE INDEX idx_tasks_created_at ON public.tasks(created_at);
CREATE INDEX idx_user_stats_user_id ON public.user_stats(user_id);