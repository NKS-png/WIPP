-- 1. Create Profiles Table (Public info)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  username text,
  bio text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Create Projects Table
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  image_url text,
  user_id uuid references public.profiles(id) not null
);

-- 3. Create Comments Table
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  content text not null,
  project_id uuid references public.projects(id) not null,
  user_id uuid references public.profiles(id) not null
);

-- 4. Enable RLS
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.comments enable row level security;

-- 5. Policies (Simple MVP)
-- Public can view everything
create policy "Public profiles" on public.profiles for select using (true);
create policy "Public projects" on public.projects for select using (true);
create policy "Public comments" on public.comments for select using (true);

-- Auth users can insert
create policy "Users insert projects" on public.projects for insert with check (auth.uid() = user_id);
create policy "Users insert comments" on public.comments for insert with check (auth.uid() = user_id);

-- 6. Trigger to create profile on Signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. Emergency Sync: Backfill profiles for existing users
insert into public.profiles (id, email, full_name)
select id, email, raw_user_meta_data->>'full_name'
from auth.users
where id not in (select id from public.profiles);

-- 8. Storage Bucket
insert into storage.buckets (id, name, public) values ('projects', 'projects', true);

-- Allow public access to images
create policy "Public Images" on storage.objects for select using ( bucket_id = 'projects' );
-- Allow authenticated uploads
create policy "Auth Uploads" on storage.objects for insert with check ( bucket_id = 'projects' and auth.role() = 'authenticated' );
-- 9. Create Services Table
create table public.services (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  price decimal(10,2),
  delivery_days int default 7,
  user_id uuid references public.profiles(id) not null
);

-- 10. Create Discussions Table
create table public.discussions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  content text not null,
  user_id uuid references public.profiles(id) not null,
  profile_id uuid references public.profiles(id) not null
);

-- 11. Enable RLS for new tables
alter table public.services enable row level security;
alter table public.discussions enable row level security;

-- 12. Policies for services
create policy "Public services" on public.services for select using (true);
create policy "Users insert services" on public.services for insert with check (auth.uid() = user_id);
create policy "Users update services" on public.services for update using (auth.uid() = user_id);
create policy "Users delete services" on public.services for delete using (auth.uid() = user_id);

-- 13. Policies for discussions
create policy "Public discussions" on public.discussions for select using (true);
create policy "Users insert discussions" on public.discussions for insert with check (auth.uid() = user_id);

-- 14. Storage Bucket for Avatars
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

-- Allow public access to avatars
create policy "Public Avatars" on storage.objects for select using ( bucket_id = 'avatars' );
-- Allow authenticated uploads
create policy "Auth Avatar Uploads" on storage.objects for insert with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );
-- Allow users to update their own avatars
create policy "Auth Avatar Updates" on storage.objects for update using ( bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1] );
-- Allow users to delete their own avatars
create policy "Auth Avatar Deletes" on storage.objects for delete using ( bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1] );

-- 23.5. Storage Bucket for Community Banners
insert into storage.buckets (id, name, public) values ('banners', 'banners', true);

-- Allow public access to banners
create policy "Public Banners" on storage.objects for select using ( bucket_id = 'banners' );
-- Allow authenticated uploads
create policy "Auth Banner Uploads" on storage.objects for insert with check ( bucket_id = 'banners' and auth.role() = 'authenticated' );
-- Dummy data
INSERT INTO services (title, description, price, delivery_days, user_id) VALUES ('Web Development', 'Build modern web applications', 100.00, 7, '66e79b59-d55d-4541-8e51-6aaee5b8720a');
INSERT INTO discussions (content, user_id, profile_id) VALUES ('Great profile! Looking forward to your projects.', '66e79b59-d55d-4541-8e51-6aaee5b8720a', '66e79b59-d55d-4541-8e51-6aaee5b8720a');

-- 15. Create Communities Table
create table public.communities (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  creator_id uuid references public.profiles(id) not null,
  image_url text
);

-- 16. Create Community Members Table
create table public.community_members (
  id uuid default gen_random_uuid() primary key,
  community_id uuid references public.communities(id) not null,
  user_id uuid references public.profiles(id) not null,
  role text default 'member',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(community_id, user_id)
);

-- 17. Enable RLS for communities
alter table public.communities enable row level security;
alter table public.community_members enable row level security;

-- 18. Policies for communities
create policy "Public communities" on public.communities for select using (true);
create policy "Users insert communities" on public.communities for insert with check (auth.uid() = creator_id);
create policy "Creators update communities" on public.communities for update using (auth.uid() = creator_id);
create policy "Creators delete communities" on public.communities for delete using (auth.uid() = creator_id);

-- 19. Policies for community_members
create policy "Public community_members" on public.community_members for select using (true);
create policy "Users insert community_members" on public.community_members for insert with check (auth.uid() = user_id);
create policy "Users delete community_members" on public.community_members for delete using (auth.uid() = user_id);
-- Admins can update roles, but for simplicity, allow users to update their own
create policy "Users update community_members" on public.community_members for update using (auth.uid() = user_id);

-- 20. Create Community Posts Table
create table public.community_posts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  community_id uuid references public.communities(id) not null,
  user_id uuid references public.profiles(id) not null,
  content text not null,
  image_url text
);

-- 21. Enable RLS for community_posts
alter table public.community_posts enable row level security;

-- 22. Policies for community_posts
create policy "Public community_posts" on public.community_posts for select using (true);
create policy "Users insert community_posts" on public.community_posts for insert with check (auth.uid() = user_id);
create policy "Users update community_posts" on public.community_posts for update using (auth.uid() = user_id);
create policy "Users delete community_posts" on public.community_posts for delete using (auth.uid() = user_id);

-- 23. Fix for Community Feature: Ensure admin_id and correct RLS policies

-- Rename creator_id to admin_id if exists
-- Assuming you ran: ALTER TABLE communities RENAME COLUMN creator_id TO admin_id;

-- If not, add admin_id
ALTER TABLE communities ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES auth.users(id);

-- Create posts table if not exists (assuming it's separate from community_posts)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  community_id UUID REFERENCES public.communities(id) NOT NULL,
  user_id UUID REFERENCES public.profiles(id) NOT NULL
);

-- Enable RLS on posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies on communities, community_members, posts
DROP POLICY IF EXISTS "Public communities" ON communities;
DROP POLICY IF EXISTS "Users insert communities" ON communities;
DROP POLICY IF EXISTS "Creators update communities" ON communities;
DROP POLICY IF EXISTS "Creators delete communities" ON communities;
DROP POLICY IF EXISTS "Public community_members" ON community_members;
DROP POLICY IF EXISTS "Users insert community_members" ON community_members;
DROP POLICY IF EXISTS "Users delete community_members" ON community_members;
DROP POLICY IF EXISTS "Users update community_members" ON community_members;
DROP POLICY IF EXISTS "Public posts" ON posts;
DROP POLICY IF EXISTS "Users insert posts" ON posts;
DROP POLICY IF EXISTS "Users update posts" ON posts;
DROP POLICY IF EXISTS "Users delete posts" ON posts;

-- New policies for communities
CREATE POLICY "communities_select" ON communities FOR SELECT USING (true);
CREATE POLICY "communities_update" ON communities FOR UPDATE USING (auth.uid() = admin_id);

-- New policies for community_members
CREATE POLICY "community_members_select" ON community_members FOR SELECT USING (true);
CREATE POLICY "community_members_insert" ON community_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "community_members_delete" ON community_members FOR DELETE USING (auth.uid() = user_id);

-- New policies for posts
CREATE POLICY "posts_select" ON posts FOR SELECT USING (true);
CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM community_members
    WHERE community_id = posts.community_id AND user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM communities
    WHERE id = posts.community_id AND admin_id = auth.uid()
  )
);
