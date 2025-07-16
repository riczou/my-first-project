-- Copy and paste these SQL commands into your Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create connections table
CREATE TABLE public.connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT,
  title TEXT,
  location TEXT,
  relationship_strength INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for connections table
CREATE POLICY "Users can view own connections" ON public.connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connections" ON public.connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connections" ON public.connections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own connections" ON public.connections
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_connections_user_id ON public.connections(user_id);
CREATE INDEX idx_connections_company ON public.connections(company);
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_email ON public.users(email);