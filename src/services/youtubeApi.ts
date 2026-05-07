import { YOUTUBE_API_BASE_URL, getActiveKey, rotateKey, totalKeys } from "@/config/youtube";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface YouTubeVideo {
  id: string;
  thumbnail: string;
  title: string;
  channel: { id: string; name: string; avatar: string };
  views: string;
  uploadedAt: string;
  duration: string;
  durationSeconds?: number;
}

export interface PaginatedResult {
  videos: YouTubeVideo[];
  nextPageToken?: string;
  error?: string;
}

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string; channelId: string; channelTitle: string; publishedAt: string;
    thumbnails: { high?: { url: string }; medium?: { url: string }; default?: { url: string } };
  };
}

interface YouTubeVideoItem {
  id: string;
  snippet: {
    title: string; channelId: string; channelTitle: string; publishedAt: string;
    thumbnails: { high?: { url: string }; medium?: { url: string }; default?: { url: string } };
  };
  statistics?: { viewCount?: string };
  contentDetails?: { duration: string };
}

interface YouTubeChannelItem {
  id: string;
  snippet: { thumbnails: { default: { url: string } } };
}

// ─── Formatters ───────────────────────────────────────────────────────────────

export const formatViewCount = (count?: string): string => {
  if (!count) return "0";
  const n = parseInt(count, 10);
  if (isNaN(n)) return "0";
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
};

export const parseDurationSeconds = (d: string): number => {
  const m = d.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return parseInt(m[1] || "0") * 3600 + parseInt(m[2] || "0") * 60 + parseInt(m[3] || "0");
};

export const formatDuration = (d: string): string => {
  const t = parseDurationSeconds(d);
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
};

export const formatUploadDate = (ds: string): string => {
  const d = Math.floor((Date.now() - new Date(ds).getTime()) / 86_400_000);
  if (d === 0) return "Today";
  if (d === 1) return "1 day ago";
  if (d < 7) return `${d} days ago`;
  if (d < 14) return "1 week ago";
  if (d < 30) return `${Math.floor(d / 7)} weeks ago`;
  if (d < 60) return "1 month ago";
  if (d < 365) return `${Math.floor(d / 30)} months ago`;
  return `${Math.floor(d / 365)} years ago`;
};

const bestThumb = (
  t: { high?: { url: string }; medium?: { url: string }; default?: { url: string } } | undefined,
  id: string
) => t?.high?.url || t?.medium?.url || t?.default?.url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

// ─── Key-aware fetch with auto-rotation ──────────────────────────────────────

/**
 * Fetches a URL, replacing {KEY} placeholder with the active API key.
 * On quota error (403 quotaExceeded / 429), rotates to the next key and retries once.
 * Returns { data, error } — data is null on unrecoverable error.
 */
const apiFetch = async (
  buildUrl: (key: string) => string
): Promise<{ data: unknown; error: string | null }> => {
  if (totalKeys() === 0) {
    return { data: null, error: "no_key: No API key configured in VITE_YOUTUBE_API_KEYS" };
  }

  const tryFetch = async (key: string): Promise<{ data: unknown; error: string | null }> => {
    const url = buildUrl(key);
    let res: Response;
    try {
      res = await fetch(url);
    } catch (e) {
      return { data: null, error: `network: ${String(e)}` };
    }

    if (res.ok) {
      const data = await res.json();
      return { data, error: null };
    }

    // Parse error body
    let body: { error?: { message?: string; errors?: { reason?: string }[] } } = {};
    try { body = await res.json(); } catch { /* ignore */ }

    const reason = body?.error?.errors?.[0]?.reason ?? "";
    const msg = body?.error?.message ?? `HTTP ${res.status}`;

    const isQuota =
      reason === "quotaExceeded" ||
      reason === "dailyLimitExceeded" ||
      res.status === 429;

    if (isQuota) return { data: null, error: "quota_exceeded" };
    return { data: null, error: msg };
  };

  // First attempt with current key
  const first = await tryFetch(getActiveKey());
  if (first.error !== "quota_exceeded") return first;

  // Rotate and retry once
  const nextKey = rotateKey();
  if (!nextKey) return { data: null, error: "quota_exceeded" };

  const second = await tryFetch(nextKey);
  if (second.error !== "quota_exceeded") return second;

  // Try remaining keys
  let key = rotateKey();
  while (key) {
    const attempt = await tryFetch(key);
    if (attempt.error !== "quota_exceeded") return attempt;
    key = rotateKey();
  }

  return { data: null, error: "quota_exceeded" };
};

// ─── Shared helpers ───────────────────────────────────────────────────────────

const fetchChannelAvatars = async (ids: string[]): Promise<Map<string, string>> => {
  if (!ids.length) return new Map();
  const { data } = await apiFetch(
    (k) => `${YOUTUBE_API_BASE_URL}/channels?part=snippet&id=${[...new Set(ids)].join(",")}&key=${k}`
  );
  if (!data) return new Map();
  return new Map(
    ((data as { items?: YouTubeChannelItem[] }).items ?? []).map((c) => [
      c.id, c.snippet?.thumbnails?.default?.url || "",
    ])
  );
};

const fetchVideoDetails = async (ids: string[]): Promise<Map<string, YouTubeVideoItem>> => {
  if (!ids.length) return new Map();
  const { data } = await apiFetch(
    (k) => `${YOUTUBE_API_BASE_URL}/videos?part=contentDetails,statistics&id=${ids.join(",")}&key=${k}`
  );
  if (!data) return new Map();
  return new Map(
    ((data as { items?: YouTubeVideoItem[] }).items ?? []).map((v) => [v.id, v])
  );
};

// ─── Public API ───────────────────────────────────────────────────────────────

export const searchYouTubeVideos = async (
  query = "", maxResults = 12, pageToken?: string
): Promise<PaginatedResult> => {
  const { data, error } = await apiFetch(
    (k) =>
      `${YOUTUBE_API_BASE_URL}/search?part=snippet&type=video` +
      `&maxResults=${maxResults}&q=${encodeURIComponent(query || "trending")}` +
      `&key=${k}` + (pageToken ? `&pageToken=${pageToken}` : "")
  );

  if (error) { console.error("[youtubeApi] search:", error); return { videos: [], error }; }

  const d = data as { items?: YouTubeSearchItem[]; nextPageToken?: string };
  const items = d.items ?? [];
  if (!items.length) return { videos: [], nextPageToken: undefined };

  const [detailsMap, avatarMap] = await Promise.all([
    fetchVideoDetails(items.map((i) => i.id.videoId)),
    fetchChannelAvatars(items.map((i) => i.snippet.channelId)),
  ]);

  return {
    videos: items.map((item) => {
      const det = detailsMap.get(item.id.videoId);
      const raw = det?.contentDetails?.duration ?? "PT0S";
      return {
        id: item.id.videoId,
        thumbnail: bestThumb(item.snippet.thumbnails, item.id.videoId),
        title: item.snippet.title,
        channel: { id: item.snippet.channelId, name: item.snippet.channelTitle, avatar: avatarMap.get(item.snippet.channelId) || "" },
        views: formatViewCount(det?.statistics?.viewCount),
        uploadedAt: formatUploadDate(item.snippet.publishedAt),
        duration: formatDuration(raw),
        durationSeconds: parseDurationSeconds(raw),
      };
    }),
    nextPageToken: d.nextPageToken,
  };
};

export const getPopularVideos = async (
  maxResults = 12, pageToken?: string
): Promise<PaginatedResult> => {
  const { data, error } = await apiFetch(
    (k) =>
      `${YOUTUBE_API_BASE_URL}/videos?part=snippet,contentDetails,statistics` +
      `&chart=mostPopular&maxResults=${maxResults}&key=${k}` +
      (pageToken ? `&pageToken=${pageToken}` : "")
  );

  if (error || !(data as { items?: unknown[] })?.items?.length) {
    if (error) console.error("[youtubeApi] popular:", error);
    // Fallback to search
    return searchYouTubeVideos("trending", maxResults, pageToken);
  }

  const d = data as { items: YouTubeVideoItem[]; nextPageToken?: string };
  const avatarMap = await fetchChannelAvatars(d.items.map((i) => i.snippet.channelId));

  return {
    videos: d.items.map((item) => {
      const raw = item.contentDetails?.duration ?? "PT0S";
      return {
        id: item.id,
        thumbnail: bestThumb(item.snippet.thumbnails, item.id),
        title: item.snippet.title,
        channel: { id: item.snippet.channelId, name: item.snippet.channelTitle, avatar: avatarMap.get(item.snippet.channelId) || "" },
        views: formatViewCount(item.statistics?.viewCount),
        uploadedAt: formatUploadDate(item.snippet.publishedAt),
        duration: formatDuration(raw),
        durationSeconds: parseDurationSeconds(raw),
      };
    }),
    nextPageToken: d.nextPageToken,
  };
};

export const getShorts = async (
  maxResults = 20, pageToken?: string
): Promise<PaginatedResult> => {
  const { data, error } = await apiFetch(
    (k) =>
      `${YOUTUBE_API_BASE_URL}/search?part=snippet&type=video` +
      `&videoDuration=short&maxResults=${Math.min(maxResults * 2, 50)}` +
      `&order=viewCount&q=%23shorts&key=${k}` +
      (pageToken ? `&pageToken=${pageToken}` : "")
  );

  if (error) { console.error("[youtubeApi] shorts:", error); return searchYouTubeVideos("#shorts", maxResults, pageToken); }

  const d = data as { items?: YouTubeSearchItem[]; nextPageToken?: string };
  const items = d.items ?? [];
  if (!items.length) return { videos: [], nextPageToken: undefined };

  const [detailsMap, avatarMap] = await Promise.all([
    fetchVideoDetails(items.map((i) => i.id.videoId)),
    fetchChannelAvatars(items.map((i) => i.snippet.channelId)),
  ]);

  return {
    videos: items
      .map((item) => {
        const det = detailsMap.get(item.id.videoId);
        const raw = det?.contentDetails?.duration ?? "PT0S";
        const secs = parseDurationSeconds(raw);
        return {
          id: item.id.videoId,
          thumbnail: bestThumb(item.snippet.thumbnails, item.id.videoId),
          title: item.snippet.title,
          channel: { id: item.snippet.channelId, name: item.snippet.channelTitle, avatar: avatarMap.get(item.snippet.channelId) || "" },
          views: formatViewCount(det?.statistics?.viewCount),
          uploadedAt: formatUploadDate(item.snippet.publishedAt),
          duration: formatDuration(raw),
          durationSeconds: secs,
        };
      })
      .filter((v) => (v.durationSeconds ?? 999) <= 60)
      .slice(0, maxResults),
    nextPageToken: d.nextPageToken,
  };
};

export const getVideoDetails = async (videoId: string): Promise<YouTubeVideo | null> => {
  const { data, error } = await apiFetch(
    (k) =>
      `${YOUTUBE_API_BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${k}`
  );

  if (error) { console.error("[youtubeApi] videoDetails:", error); return null; }

  const item: YouTubeVideoItem | undefined = (data as { items?: YouTubeVideoItem[] }).items?.[0];
  if (!item) return null;

  const avatarMap = await fetchChannelAvatars([item.snippet.channelId]);
  const raw = item.contentDetails?.duration ?? "PT0S";

  return {
    id: item.id,
    thumbnail: bestThumb(item.snippet.thumbnails, item.id),
    title: item.snippet.title,
    channel: { id: item.snippet.channelId, name: item.snippet.channelTitle, avatar: avatarMap.get(item.snippet.channelId) || "" },
    views: formatViewCount(item.statistics?.viewCount),
    uploadedAt: formatUploadDate(item.snippet.publishedAt),
    duration: formatDuration(raw),
    durationSeconds: parseDurationSeconds(raw),
  };
};
