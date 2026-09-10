import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { YouTubeVideo } from "@/services/youtubeApi";
import { useAuth } from "@/context/AuthContext";
import {
  getHistory,
  getLikedVideos,
  getSavedVideos,
  removeFromHistory,
  clearHistory,
  unlikeVideo,
  unsaveVideo,
  getDownloads,
  removeDownload,
} from "@/lib/userStore";
import {
  Clock,
  ThumbsUp,
  BookMarked,
  PlaySquare,
  Trash2,
  X,
  Loader2,
  LogIn,
  History,
  Download,
  Play,
} from "lucide-react";

// ─── Section config ──────────────────────────────────────────────────────────

type SectionKey = "History" | "Liked videos" | "Library" | "Subscriptions" | "Downloads";

const SECTION_META: Record<
  SectionKey,
  { icon: React.ElementType; title: string; emptyMsg: string }
> = {
  History:        { icon: Clock,      title: "Watch history",  emptyMsg: "Videos you watch will appear here."                         },
  "Liked videos": { icon: ThumbsUp,   title: "Liked videos",   emptyMsg: "Videos you like will appear here."                          },
  Library:        { icon: BookMarked, title: "Saved videos",   emptyMsg: "Videos you save will appear here."                          },
  Subscriptions:  { icon: PlaySquare, title: "Subscriptions",  emptyMsg: "Subscribe to channels to see their latest videos here."     },
  Downloads:      { icon: Download,   title: "Downloads",      emptyMsg: "Videos you download to ADØ will appear here."               },
};

// ─── Video row ────────────────────────────────────────────────────────────────

const VideoRow = ({
  video,
  onRemove,
}: {
  video: YouTubeVideo;
  onRemove?: (id: string) => void;
}) => {
  const navigate = useNavigate();

  return (
    <div
      className="flex gap-3 group rounded-2xl p-2.5 transition-all cursor-pointer"
      style={{ background: "rgba(255,255,255,0)" }}
      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
      onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0)")}
    >
      {/* Thumbnail */}
      <div
        className="relative w-36 sm:w-44 md:w-52 flex-shrink-0 rounded-xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.05)" }}
        onClick={() => navigate(`/watch?v=${video.id}`)}
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Play overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "rgba(0,0,0,0.38)" }}
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)" }}>
            <Play className="h-4 w-4 text-white fill-white ml-0.5" />
          </div>
        </div>
        {/* Duration */}
        {video.duration && (
          <span
            className="absolute bottom-1.5 right-1.5 text-[10px] font-medium text-white px-1.5 py-0.5 rounded-md"
            style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
          >
            {video.duration}
          </span>
        )}
      </div>

      {/* Info */}
      <div
        className="flex-1 min-w-0 py-0.5"
        onClick={() => navigate(`/watch?v=${video.id}`)}
      >
        <h3 className="text-sm font-medium line-clamp-2 leading-5 text-white/90 mb-1.5">
          {video.title}
        </h3>
        <div className="flex items-center gap-2 mb-0.5">
          <Avatar className="h-5 w-5">
            <AvatarImage src={video.channel.avatar} />
            <AvatarFallback className="text-[9px] bg-white/10">{video.channel.name[0]}</AvatarFallback>
          </Avatar>
          <p className="text-[12px] text-white/45 truncate">{video.channel.name}</p>
        </div>
        <p className="text-[11px] text-white/30">
          {video.views} views · {video.uploadedAt}
        </p>
      </div>

      {/* Remove */}
      {onRemove && (
        <button
          onClick={e => { e.stopPropagation(); onRemove(video.id); }}
          className="flex-shrink-0 self-start mt-1 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
          title="Remove"
        >
          <X className="h-3.5 w-3.5 text-white/50" />
        </button>
      )}
    </div>
  );
};

// ─── Sign-in prompt ──────────────────────────────────────────────────────────

const SignInPrompt = ({
  section,
  onSignIn,
}: {
  section: SectionKey;
  onSignIn: () => void;
}) => {
  const meta = SECTION_META[section];
  const Icon = meta.icon;
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(220,38,38,0.15))",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        <Icon className="h-9 w-9 text-white/40" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-white/85 mb-2">
          Sign in to see your {meta.title.toLowerCase()}
        </h3>
        <p className="text-sm text-white/40 max-w-xs leading-relaxed">{meta.emptyMsg}</p>
      </div>
      <button
        onClick={onSignIn}
        className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-semibold text-white transition-all"
        style={{
          background: "rgba(255,255,255,0.09)",
          border: "1px solid rgba(255,255,255,0.18)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.16)")}
        onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.09)")}
      >
        <LogIn className="h-4 w-4" />
        Sign in
      </button>
    </div>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = ({ section }: { section: SectionKey }) => {
  const meta = SECTION_META[section];
  const Icon = meta.icon;
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Icon className="h-7 w-7 text-white/25" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-white/60 mb-1">
          No {meta.title.toLowerCase()} yet
        </h3>
        <p className="text-sm text-white/30 max-w-xs leading-relaxed">{meta.emptyMsg}</p>
      </div>
    </div>
  );
};

// ─── Main SectionPage ─────────────────────────────────────────────────────────

interface SectionPageProps {
  section: SectionKey;
  onSignInClick: () => void;
}

const SectionPage = ({ section, onSignInClick }: SectionPageProps) => {
  const { user } = useAuth();
  const [videos, setVideos]   = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const meta = SECTION_META[section];
  const Icon = meta.icon;

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const fetchers: Record<SectionKey, () => Promise<YouTubeVideo[]>> = {
      History:        () => getHistory(user.id),
      "Liked videos": () => getLikedVideos(user.id),
      Library:        () => getSavedVideos(user.id),
      Subscriptions:  async () => [],
      Downloads:      () => getDownloads(user.id),
    };
    fetchers[section]().then(vids => {
      setVideos(vids);
      setLoading(false);
    });
  }, [user, section]);

  const handleRemove = async (videoId: string) => {
    if (!user) return;
    setVideos(prev => prev.filter(v => v.id !== videoId));
    if (section === "History")       await removeFromHistory(videoId, user.id);
    if (section === "Liked videos")  await unlikeVideo(videoId, user.id);
    if (section === "Library")       await unsaveVideo(videoId, user.id);
    if (section === "Downloads")     await removeDownload(videoId, user.id);
  };

  const handleClearAll = async () => {
    if (!user) return;
    setVideos([]);
    if (section === "History") await clearHistory(user.id);
  };

  if (!user) return <SignInPrompt section={section} onSignIn={onSignInClick} />;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl">
      {/* Section header */}
      <div
        className="flex items-center justify-between mb-6 px-4 py-3 rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.07)" }}
          >
            <Icon className="h-4 w-4 text-white/60" />
          </div>
          <h2 className="text-base font-bold text-white/85">{meta.title}</h2>
          {videos.length > 0 && (
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-full text-white/40"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              {videos.length}
            </span>
          )}
        </div>

        {videos.length > 0 && section === "History" && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 text-xs text-white/35 hover:text-red-400 transition-colors px-3 py-1.5 rounded-xl"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear all
          </button>
        )}
      </div>

      {/* Content */}
      {videos.length === 0 ? (
        <EmptyState section={section} />
      ) : (
        <div className="space-y-1">
          {videos.map(video => (
            <VideoRow
              key={video.id}
              video={video}
              onRemove={section !== "Subscriptions" ? handleRemove : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SectionPage;
