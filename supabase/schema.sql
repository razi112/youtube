-- ============================================================
-- ADØ — Supabase schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Watch history
create table if not exists watch_history (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  video_id    text not null,
  title       text,
  thumbnail   text,
  channel_name  text,
  channel_avatar text,
  duration    text,
  views       text,
  uploaded_at text,
  watched_at  timestamptz default now(),
  unique(user_id, video_id)
);

-- Liked videos
create table if not exists liked_videos (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  video_id    text not null,
  title       text,
  thumbnail   text,
  channel_name  text,
  channel_avatar text,
  duration    text,
  views       text,
  uploaded_at text,
  liked_at    timestamptz default now(),
  unique(user_id, video_id)
);

-- Saved / Library
create table if not exists saved_videos (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  video_id    text not null,
  title       text,
  thumbnail   text,
  channel_name  text,
  channel_avatar text,
  duration    text,
  views       text,
  uploaded_at text,
  saved_at    timestamptz default now(),
  unique(user_id, video_id)
);

-- Enable Row Level Security
alter table watch_history enable row level security;
alter table liked_videos  enable row level security;
alter table saved_videos  enable row level security;

-- RLS policies — users can only access their own rows
create policy "Users manage own history"
  on watch_history for all using (auth.uid() = user_id);

create policy "Users manage own likes"
  on liked_videos for all using (auth.uid() = user_id);

create policy "Users manage own saves"
  on saved_videos for all using (auth.uid() = user_id);

-- Downloads table
create table if not exists downloads (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  video_id       text not null,
  title          text,
  thumbnail      text,
  channel_name   text,
  channel_avatar text,
  duration       text,
  views          text,
  uploaded_at    text,
  downloaded_at  timestamptz default now(),
  unique(user_id, video_id)
);

alter table downloads enable row level security;
create policy "Users manage own downloads" on downloads for all using (auth.uid() = user_id);
