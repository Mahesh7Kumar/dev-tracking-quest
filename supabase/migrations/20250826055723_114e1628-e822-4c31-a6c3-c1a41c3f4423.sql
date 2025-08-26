-- Add completed_at column to tasks table
ALTER TABLE public.tasks 
ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;

-- Add index for better performance when querying completed tasks
CREATE INDEX idx_tasks_completed_at ON public.tasks(completed_at) WHERE completed_at IS NOT NULL;