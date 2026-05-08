/**
 * userStore.ts
 * All Supabase read/write operations for user-specific data.
 * Tables needed (run in Supabase SQL editor):
 *
 *   create table watch_history (
 *     id uuid primary key default gen_random_uuid(),
 *     user_id uuid references auth.users(id) on delete cascade not null,
 *     video_id text not null,
 *     title text, thumbnail text, channel_name text, channel_avatar text,
 *     duration text, views text, uploaded_at text,
 *     watched_at timestamptz default now(),
 *     unique(user_id, video_id)
 *   );
 *
 *   create table liked_videos (
 *     id uuid primary key default gen_random_uuid(),
 *     user_id uuid references auth.users(id) on delete cascade not null,
 *     video_id text not null,
 *     title text, thumbnail text, channel_name text, channel_avatar text,
 *     duration text, views text, uploaded_at text,
 *     liked_at timestamptz default now(),
 *     unique(user_id, video_id)
 *   );
 *
 *   create table saved_videos (
 *     id uuid primary key default gen_random_uuid(),
 *     user_id uuid references auth.users(id) on delete cascade not null,
 *     video_id text not null,
 *     title text, thumbnail text, channel_name text, channel_avatar text,
 *     duration text, views text, uploaded_at text,
 *     saved_at timestamptz default now(),
 *     unique(user_id, video_id)
 *   );
 *
 *   -- Enable RLS on all three tables and add policies:
 *   alter table watch_history enable row level security;
 *   alter table liked_videos  enable row level security;
 *   alter table saved_videos  enable row level security;
 *
 *   create policy "Users manage own history" on watch_history for all using (auth.uid() = user_id);
 *   create policy "Users manage own likes"   on liked_videos  for all using (auth.uid() = user_id);
 *   create policy "Users manage own saves"   on saved_videos  for all using (auth.uid() = user_id);
 */

import { supabase } from "./supabase";
import { YouTubeVideo } from "@/services/youtubeApi";

// ─── helpers ────────────────────────────────────────────────────────────────

const videoToRow = (video: YouTubeVideo, userId: string) => ({
  user_id: userId,
  video_id: video.id,
  title: video.title,
  thumbnail: video.thumbnail,
  channel_name: video.channel.name,
  channel_avatar: video.channel.avatar,
  duration: video.duration,
  views: video.views,
  uploaded_at: video.uploadedAt,
});

const rowToVideo = (row: Record<string, string>): YouTubeVideo => ({
  id: row.video_id,
  title: row.title,
  thumbnail: row.thumbnail,
  channel: {
    id: row.video_id,
    name: row.channel_name,
    avatar: row.channel_avatar,
  },
  duration: row.duration,
  views: row.views,
  uploadedAt: row.uploaded_at,
});

// ─── Watch History ───────────────────────────────────────────────────────────

export const addToHistory = async (video: YouTubeVideo, userId: string) => {
  await supabase
    .from("watch_history")
    .upsert(
      { ...videoToRow(video, userId), watched_at: new Date().toISOString() },
      { onConflict: "user_id,video_id" }
    );
};

export const getHistory = async (userId: string): Promise<YouTubeVideo[]> => {
  const { data } = await supabase
    .from("watch_history")
    .select("*")
    .eq("user_id", userId)
    .order("watched_at", { ascending: false })
    .limit(50);
  return (data ?? []).map(rowToVideo);
};

export const removeFromHistory = async (videoId: string, userId: string) => {
  await supabase
    .from("watch_history")
    .delete()
    .eq("user_id", userId)
    .eq("video_id", videoId);
};

export const clearHistory = async (userId: string) => {
  await supabase.from("watch_history").delete().eq("user_id", userId);
};

// ─── Liked Videos ────────────────────────────────────────────────────────────

export const likeVideo = async (video: YouTubeVideo, userId: string) => {
  await supabase
    .from("liked_videos")
    .upsert(videoToRow(video, userId), { onConflict: "user_id,video_id" });
};

export const unlikeVideo = async (videoId: string, userId: string) => {
  await supabase
    .from("liked_videos")
    .delete()
    .eq("user_id", userId)
    .eq("video_id", videoId);
};

export const getLikedVideos = async (userId: string): Promise<YouTubeVideo[]> => {
  const { data } = await supabase
    .from("liked_videos")
    .select("*")
    .eq("user_id", userId)
    .order("liked_at", { ascending: false })
    .limit(50);
  return (data ?? []).map(rowToVideo);
};

export const isVideoLiked = async (videoId: string, userId: string): Promise<boolean> => {
  const { data } = await supabase
    .from("liked_videos")
    .select("video_id")
    .eq("user_id", userId)
    .eq("video_id", videoId)
    .maybeSingle();
  return !!data;
};

// ─── Saved / Library ─────────────────────────────────────────────────────────

export const saveVideo = async (video: YouTubeVideo, userId: string) => {
  await supabase
    .from("saved_videos")
    .upsert(videoToRow(video, userId), { onConflict: "user_id,video_id" });
};

export const unsaveVideo = async (videoId: string, userId: string) => {
  await supabase
    .from("saved_videos")
    .delete()
    .eq("user_id", userId)
    .eq("video_id", videoId);
};

export const getSavedVideos = async (userId: string): Promise<YouTubeVideo[]> => {
  const { data } = await supabase
    .from("saved_videos")
    .select("*")
    .eq("user_id", userId)
    .order("saved_at", { ascending: false })
    .limit(50);
  return (data ?? []).map(rowToVideo);
};

// ─── Downloads ───────────────────────────────────────────────────────────────

export const addDownload = async (video: YouTubeVideo, userId: string) => {
  await supabase
    .from("downloads")
    .upsert(
      { ...videoToRow(video, userId), downloaded_at: new Date().toISOString() },
      { onConflict: "user_id,video_id" }
    );
};

export const getDownloads = async (userId: string): Promise<YouTubeVideo[]> => {
  const { data } = await supabase
    .from("downloads")
    .select("*")
    .eq("user_id", userId)
    .order("downloaded_at", { ascending: false })
    .limit(50);
  return (data ?? []).map(rowToVideo);
};

export const removeDownload = async (videoId: string, userId: string) => {
  await supabase
    .from("downloads")
    .delete()
    .eq("user_id", userId)
    .eq("video_id", videoId);
};

export const isVideoDownloaded = async (videoId: string, userId: string): Promise<boolean> => {
  const { data } = await supabase
    .from("downloads")
    .select("video_id")
    .eq("user_id", userId)
    .eq("video_id", videoId)
    .maybeSingle();
  return !!data;
};
