-- Fix RLS policies for user registration
-- Run this in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Create more permissive policies for user creation
CREATE POLICY "Enable read access for authenticated users" ON public.users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.users
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Also fix connections policies
DROP POLICY IF EXISTS "Users can view own connections" ON public.connections;
DROP POLICY IF EXISTS "Users can insert own connections" ON public.connections;

CREATE POLICY "Users can view own connections" ON public.connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connections" ON public.connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Alternative: Temporarily disable RLS for testing (ONLY for development)
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.connections DISABLE ROW LEVEL SECURITY;