import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";

// ─── Section config ──────────────────────────────────────────────────────────

type SectionKey = "History" | "Liked videos" | "Library" | "Subscriptions" | "Downloads";

const SECTION_META: Record<
  SectionKey,
  { icon: React.ElementType; title: string; emptyMsg: string; emptyIcon: React.ElementType }
> = {
  History: {
    icon: Clock,
    title: "Watch history",
    emptyMsg: "Videos you watch will appear here.",
    emptyIcon: History,
  },
  "Liked videos": {
    icon: ThumbsUp,
    title: "Liked videos",
    emptyMsg: "Videos you like will appear here.",
    emptyIcon: ThumbsUp,
  },
  Library: {
    icon: BookMarked,
    title: "Saved videos",
    emptyMsg: "Videos you save will appear here.",
    emptyIcon: BookMarked,
  },
  Subscriptions: {
    icon: PlaySquare,
    title: "Subscriptions",
    emptyMsg: "Subscribe to channels to see their latest videos here.",
    emptyIcon: PlaySquare,
  },
  Downloads: {
    icon: Download,
    title: "Downloads",
    emptyMsg: "Videos you download to ADØ will appear here.",
    emptyIcon: Download,
  },
};

// ─── Single video row ────────────────────────────────────────────────────────

const VideoRow = ({
  video,
  onRemove,
}: {
  video: YouTubeVideo;
  onRemove?: (id: string) => void;
}) => {
  const navigate = useNavigate();
  return (
    <div className="flex gap-3 group hover:bg-accent/40 rounded-xl p-2 -mx-2 transition-colors">
      {/* Thumbnail */}
      <div
        className="relative w-32 sm:w-40 md:w-48 flex-shrink-0 rounded-lg overflow-hidden bg-muted cursor-pointer"
        onClick={() => navigate(`/watch?v=${video.id}`)}
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-medium px-1 py-0.5 rounded">
          {video.duration}
        </span>
      </div>

      {/* Info */}
      <div
        className="flex-1 min-w-0 py-0.5 cursor-pointer"
        onClick={() => navigate(`/watch?v=${video.id}`)}
      >
        <h3 className="text-sm font-medium line-clamp-2 leading-5 text-foreground mb-1">
          {video.title}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <Avatar className="h-5 w-5">
            <AvatarImage src={video.channel.avatar} />
            <AvatarFallback className="text-[9px]">
              {video.channel.name[0]}
            </AvatarFallback>
          </Avatar>
          <p className="text-[12px] text-muted-foreground truncate">
            {video.channel.name}
          </p>
        </div>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          {video.views} views&nbsp;•&nbsp;{video.uploadedAt}
        </p>
      </div>

      {/* Remove button */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(video.id);
          }}
          className="flex-shrink-0 self-start mt-1 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-accent transition-all"
          title="Remove"
        >
          <X className="h-4 w-4 text-muted-foreground" />
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
  const Icon = meta.emptyIcon;
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
      <div className="bg-secondary rounded-full p-6">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-1">Sign in to see your {meta.title.toLowerCase()}</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          {meta.emptyMsg}
        </p>
      </div>
      <Button
        onClick={onSignIn}
        variant="outline"
        className="rounded-full border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 gap-2"
      >
        <LogIn className="h-4 w-4" />
        Sign in
      </Button>
    </div>
  );
};

// ─── Empty state ─────────────────────────────────────────────────────────────

const EmptyState = ({ section }: { section: SectionKey }) => {
  const meta = SECTION_META[section];
  const Icon = meta.emptyIcon;
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="bg-secondary rounded-full p-6">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-1">No {meta.title.toLowerCase()} yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs">{meta.emptyMsg}</p>
      </div>
    </div>
  );
};

// ─── Main SectionPage ────────────────────────────────────────────────────────

interface SectionPageProps {
  section: SectionKey;
  onSignInClick: () => void;
}

const SectionPage = ({ section, onSignInClick }: SectionPageProps) => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const meta = SECTION_META[section];
  const Icon = meta.icon;

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const fetchers: Record<SectionKey, () => Promise<YouTubeVideo[]>> = {
      History: () => getHistory(user.id),
      "Liked videos": () => getLikedVideos(user.id),
      Library: () => getSavedVideos(user.id),
      Subscriptions: async () => [],
      Downloads: () => getDownloads(user.id),
    };
    fetchers[section]().then((vids) => {
      setVideos(vids);
      setLoading(false);
    });
  }, [user, section]);

  const handleRemove = async (videoId: string) => {
    if (!user) return;
    setVideos((prev) => prev.filter((v) => v.id !== videoId));
    if (section === "History") await removeFromHistory(videoId, user.id);
    if (section === "Liked videos") await unlikeVideo(videoId, user.id);
    if (section === "Library") await unsaveVideo(videoId, user.id);
    if (section === "Downloads") await removeDownload(videoId, user.id);
  };

  const handleClearAll = async () => {
    if (!user) return;
    setVideos([]);
    if (section === "History") await clearHistory(user.id);
  };

  if (!user) {
    return <SignInPrompt section={section} onSignIn={onSignInClick} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Icon className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold">{meta.title}</h2>
          {videos.length > 0 && (
            <span className="text-sm text-muted-foreground">
              ({videos.length})
            </span>
          )}
        </div>
        {videos.length > 0 && section === "History" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="gap-2 text-muted-foreground hover:text-destructive rounded-full"
          >
            <Trash2 className="h-4 w-4" />
            Clear all
          </Button>
        )}
      </div>

      {/* Content */}
      {videos.length === 0 ? (
        <EmptyState section={section} />
      ) : (
        <div className="space-y-1">
          {videos.map((video) => (
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
