-- ResMind 2.0 Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/wasaiiyebcfubwssxumr/sql

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enums
create type user_role as enum ('user', 'admin');
create type generation_status as enum ('pending', 'processing', 'completed', 'failed');

-- 1. Profiles (Extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null unique,
  role user_role default 'user',
  full_name text,
  avatar_url text,
  credits int default 5,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Resumes (Original Uploads)
create table public.resumes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  file_path text not null,
  extracted_text text,
  file_name text,
  file_size int,
  created_at timestamptz default now()
);

-- 3. Job Descriptions
create table public.job_descriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text,
  company text,
  raw_text text not null,
  created_at timestamptz default now()
);

-- 4. Generations (The "Fixer" Output)
create table public.generations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  resume_id uuid references public.resumes(id) on delete set null,
  job_id uuid references public.job_descriptions(id) on delete set null,
  score int check (score >= 0 and score <= 100),
  feedback_json jsonb,
  structured_resume_data jsonb,
  pdf_url text,
  status generation_status default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes for performance
create index profiles_email_idx on public.profiles(email);
create index resumes_user_id_idx on public.resumes(user_id);
create index job_descriptions_user_id_idx on public.job_descriptions(user_id);
create index generations_user_id_idx on public.generations(user_id);
create index generations_status_idx on public.generations(status);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.resumes enable row level security;
alter table public.job_descriptions enable row level security;
alter table public.generations enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile during signup"
  on public.profiles for insert
  to authenticated, anon
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update all profiles"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Resumes policies
create policy "Users can view own resumes"
  on public.resumes for select
  using (auth.uid() = user_id);

create policy "Users can insert own resumes"
  on public.resumes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own resumes"
  on public.resumes for delete
  using (auth.uid() = user_id);

-- Job descriptions policies
create policy "Users can view own job descriptions"
  on public.job_descriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert own job descriptions"
  on public.job_descriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own job descriptions"
  on public.job_descriptions for delete
  using (auth.uid() = user_id);

-- Generations policies
create policy "Users can view own generations"
  on public.generations for select
  using (auth.uid() = user_id);

create policy "Users can insert own generations"
  on public.generations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own generations"
  on public.generations for update
  using (auth.uid() = user_id);

create policy "Admins can view all generations"
  on public.generations for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, credits, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    5,  -- Explicitly set credits to 5
    'user'::user_role  -- Explicitly set role to 'user'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_generations_updated_at
  before update on public.generations
  for each row execute procedure public.handle_updated_at();

-- Storage buckets (run these separately in Supabase Storage UI or via SQL)
insert into storage.buckets (id, name, public) 
values ('resumes', 'resumes', false);

insert into storage.buckets (id, name, public) 
values ('generated-pdfs', 'generated-pdfs', false);

-- Storage policies for resumes bucket
create policy "Users can upload own resume files"
  on storage.objects for insert
  with check (
    bucket_id = 'resumes' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view own resume files"
  on storage.objects for select
  using (
    bucket_id = 'resumes' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own resume files"
  on storage.objects for delete
  using (
    bucket_id = 'resumes' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for generated-pdfs bucket
create policy "Users can upload own generated PDFs"
  on storage.objects for insert
  with check (
    bucket_id = 'generated-pdfs' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view own generated PDFs"
  on storage.objects for select
  using (
    bucket_id = 'generated-pdfs' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own generated PDFs"
  on storage.objects for delete
  using (
    bucket_id = 'generated-pdfs' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
