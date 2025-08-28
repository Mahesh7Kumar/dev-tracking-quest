-- Add dark_mode column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN dark_mode BOOLEAN DEFAULT false;