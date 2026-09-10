import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import {
  getHistory,
  getLikedVideos,
  getSavedVideos,
  getDownloads,
  removeFromHistory,
  clearHistory,
  unlikeVideo,
  unsaveVideo,
  removeDownload,
} from "@/lib/userStore";
import { YouTubeVideo } from "@/services/youtubeApi";
import {
  X,
  Clock,
  ThumbsUp,
  BookMarked,
  Download,
  LogOut,
  Loader2,
  Trash2,
  Play,
  User,
  Mail,
  ChevronRight,
  History,
  Settings,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "profile" | "history" | "liked" | "library" | "downloads";

interface AccountPanelProps {
  open: boolean;
  onClose: () => void;
  onSignIn: () => void;
}

// ─── Glass helpers ────────────────────────────────────────────────────────────

const glassCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "1rem",
};

const glassActive: React.CSSProperties = {
  background: "rgba(255,255,255,0.10)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "0.75rem",
};

// ─── Video row ────────────────────────────────────────────────────────────────

const VideoRow = ({
  video,
  onRemove,
  onClose,
}: {
  video: YouTubeVideo;
  onRemove: (id: string) => void;
  onClose: () => void;
}) => {
  const navigate = useNavigate();

  const go = () => {
    navigate(`/watch?v=${video.id}`);
    onClose();
  };

  return (
    <div className="flex gap-3 group rounded-xl p-2 transition-all cursor-pointer"
      style={{ background: "rgba(255,255,255,0)" }}
      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
      onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0)")}
    >
      {/* Thumbnail */}
      <div className="relative w-36 flex-shrink-0 rounded-lg overflow-hidden" onClick={go}>
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "rgba(0,0,0,0.4)" }}>
          <Play className="h-6 w-6 text-white fill-white" />
        </div>
        {video.duration && (
          <span className="absolute bottom-1 right-1 text-[10px] font-medium text-white px-1 py-0.5 rounded"
            style={{ background: "rgba(0,0,0,0.7)" }}>
            {video.duration}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 py-0.5" onClick={go}>
        <h4 className="text-sm font-medium line-clamp-2 leading-5 text-white/90 mb-1">
          {video.title}
        </h4>
        <p className="text-[11px] text-white/45 truncate">{video.channel.name}</p>
        <p className="text-[11px] text-white/35 mt-0.5">{video.views} views · {video.uploadedAt}</p>
      </div>

      {/* Remove */}
      <button
        onClick={e => { e.stopPropagation(); onRemove(video.id); }}
        className="flex-shrink-0 self-center p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all"
        style={{ background: "rgba(255,255,255,0.06)" }}
        title="Remove"
      >
        <X className="h-3.5 w-3.5 text-white/50" />
      </button>
    </div>
  );
};

// ─── Tab content ──────────────────────────────────────────────────────────────

const VideoList = ({
  videos,
  loading,
  tab,
  onRemove,
  onClearAll,
  onClose,
}: {
  videos: YouTubeVideo[];
  loading: boolean;
  tab: Tab;
  onRemove: (id: string) => void;
  onClearAll?: () => void;
  onClose: () => void;
}) => {
  const labels: Record<Tab, string> = {
    profile: "",
    history: "Watch history",
    liked: "Liked videos",
    library: "Saved videos",
    downloads: "Downloads",
  };

  const icons: Record<Tab, React.ElementType> = {
    profile: User,
    history: History,
    liked: ThumbsUp,
    library: BookMarked,
    downloads: Download,
  };

  const Icon = icons[tab];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Sub-header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-white/50" />
          <span className="text-sm font-semibold text-white/80">{labels[tab]}</span>
          {videos.length > 0 && (
            <span className="text-xs text-white/30 font-normal">({videos.length})</span>
          )}
        </div>
        {tab === "history" && videos.length > 0 && onClearAll && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-red-400 transition-colors px-2 py-1 rounded-lg"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear all
          </button>
        )}
      </div>

      {videos.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-12">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Icon className="h-7 w-7 text-white/25" />
          </div>
          <p className="text-sm text-white/35">No {labels[tab].toLowerCase()} yet</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-1 pr-1">
          {videos.map(v => (
            <VideoRow key={v.id} video={v} onRemove={onRemove} onClose={onClose} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Profile tab ──────────────────────────────────────────────────────────────

const ProfileTab = ({
  onSignOut,
  onTabChange,
}: {
  onSignOut: () => void;
  onTabChange: (tab: Tab) => void;
}) => {
  const { user } = useAuth();
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const displayName = (user?.user_metadata?.full_name as string) ?? user?.email ?? "User";
  const email = user?.email ?? "";
  const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "";

  const quickLinks: { tab: Tab; icon: React.ElementType; label: string; desc: string }[] = [
    { tab: "history",   icon: Clock,      label: "Watch History",  desc: "Videos you've watched"     },
    { tab: "liked",     icon: ThumbsUp,   label: "Liked Videos",   desc: "Videos you've liked"       },
    { tab: "library",   icon: BookMarked, label: "Saved Videos",   desc: "Your personal library"     },
    { tab: "downloads", icon: Download,   label: "Downloads",      desc: "Offline videos"            },
  ];

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4">
      {/* Avatar card */}
      <div className="rounded-2xl p-5 flex items-center gap-4"
        style={{
          background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(220,38,38,0.1))",
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
        <Avatar className="h-16 w-16 ring-2 ring-white/20">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-purple-500 to-red-500 text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-base truncate">{displayName}</h3>
          <p className="text-xs text-white/50 truncate mt-0.5">{email}</p>
          {joinedDate && (
            <p className="text-[11px] text-white/30 mt-1">Member since {joinedDate}</p>
          )}
        </div>
      </div>

      {/* Account info */}
      <div style={glassCard} className="overflow-hidden">
        <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/35">Account info</p>
        </div>
        <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-3 px-4 py-3">
            <User className="h-4 w-4 text-white/40 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] text-white/35">Display name</p>
              <p className="text-sm text-white/80 truncate">{displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <Mail className="h-4 w-4 text-white/40 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] text-white/35">Email</p>
              <p className="text-sm text-white/80 truncate">{email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div style={glassCard} className="overflow-hidden">
        <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/35">Your content</p>
        </div>
        <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          {quickLinks.map(({ tab, icon: Icon, label, desc }) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all"
              style={{ background: "transparent" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.07)" }}>
                <Icon className="h-4 w-4 text-white/60" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/85">{label}</p>
                <p className="text-[11px] text-white/35">{desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-white/25 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Sign out */}
      <button
        onClick={onSignOut}
        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all"
        style={{
          background: "rgba(220,38,38,0.08)",
          border: "1px solid rgba(220,38,38,0.2)",
          color: "rgba(252,165,165,0.9)",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(220,38,38,0.15)")}
        onMouseLeave={e => (e.currentTarget.style.background = "rgba(220,38,38,0.08)")}
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </div>
  );
};

// ─── Sign-in prompt ───────────────────────────────────────────────────────────

const SignInPrompt = ({ onSignIn, onClose }: { onSignIn: () => void; onClose: () => void }) => (
  <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center px-6">
    <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg, rgba(139,92,246,0.25), rgba(220,38,38,0.2))",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      }}>
      <User className="h-9 w-9 text-white/60" />
    </div>
    <div>
      <h3 className="text-lg font-bold text-white mb-2">Sign in to ADØ</h3>
      <p className="text-sm text-white/45 leading-relaxed max-w-xs">
        Access your history, liked videos, saved content and more.
      </p>
    </div>
    <button
      onClick={() => { onSignIn(); onClose(); }}
      className="px-8 py-3 rounded-2xl text-sm font-semibold text-white transition-all"
      style={{
        background: "rgba(255,255,255,0.1)",
        border: "1px solid rgba(255,255,255,0.2)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.17)")}
      onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
    >
      Sign in
    </button>
  </div>
);

// ─── Main AccountPanel ────────────────────────────────────────────────────────

const AccountPanel = ({ open, onClose, onSignIn }: AccountPanelProps) => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Reset to profile tab on open
  useEffect(() => {
    if (open) setActiveTab("profile");
  }, [open]);

  // Fetch videos when tab changes
  const fetchTab = useCallback(async (tab: Tab) => {
    if (!user || tab === "profile") return;
    setLoadingVideos(true);
    const fetchers: Record<Exclude<Tab, "profile">, () => Promise<YouTubeVideo[]>> = {
      history:   () => getHistory(user.id),
      liked:     () => getLikedVideos(user.id),
      library:   () => getSavedVideos(user.id),
      downloads: () => getDownloads(user.id),
    };
    const vids = await fetchers[tab as Exclude<Tab, "profile">]();
    setVideos(vids);
    setLoadingVideos(false);
  }, [user]);

  useEffect(() => {
    fetchTab(activeTab);
  }, [activeTab, fetchTab]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setVideos([]);
  };

  const handleRemove = async (videoId: string) => {
    if (!user) return;
    setVideos(prev => prev.filter(v => v.id !== videoId));
    if (activeTab === "history")   await removeFromHistory(videoId, user.id);
    if (activeTab === "liked")     await unlikeVideo(videoId, user.id);
    if (activeTab === "library")   await unsaveVideo(videoId, user.id);
    if (activeTab === "downloads") await removeDownload(videoId, user.id);
  };

  const handleClearAll = async () => {
    if (!user) return;
    setVideos([]);
    await clearHistory(user.id);
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  if (!open) return null;

  const tabs: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: "profile",   icon: Settings,   label: "Profile"   },
    { id: "history",   icon: Clock,      label: "History"   },
    { id: "liked",     icon: ThumbsUp,   label: "Liked"     },
    { id: "library",   icon: BookMarked, label: "Library"   },
    { id: "downloads", icon: Download,   label: "Downloads" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[150]"
        style={{
          background: "rgba(4, 3, 12, 0.6)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
        onClick={onClose}
      />

      {/* Panel — slides in from the right */}
      <div
        className="fixed top-0 right-0 bottom-0 z-[160] flex flex-col"
        style={{
          width: "min(420px, 100vw)",
          background: "rgba(10, 8, 22, 0.92)",
          backdropFilter: "blur(40px) saturate(200%)",
          WebkitBackdropFilter: "blur(40px) saturate(200%)",
          borderLeft: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "-8px 0 48px rgba(0,0,0,0.6)",
          animation: "slideInRight 0.22s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* Top shimmer */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }} />

        {/* Ambient glow */}
        <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)" }} />

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-white/90 text-base">Account</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full transition-all"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <X className="h-4 w-4 text-white/60" />
          </button>
        </div>

        {/* ── Tab bar ── */}
        {user && (
          <div className="flex items-center gap-1 px-4 py-3 flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {tabs.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-[10px] font-medium transition-all"
                style={activeTab === id ? glassActive : { color: "rgba(255,255,255,0.4)" }}
              >
                <Icon className={`h-4 w-4 ${activeTab === id ? "text-white" : "text-white/40"}`} />
                <span className={activeTab === id ? "text-white/90" : ""}>{label}</span>
              </button>
            ))}
          </div>
        )}

        {/* ── Content ── */}
        <div className="flex-1 min-h-0 flex flex-col px-4 py-4">
          {!user ? (
            <SignInPrompt onSignIn={onSignIn} onClose={onClose} />
          ) : activeTab === "profile" ? (
            <ProfileTab onSignOut={handleSignOut} onTabChange={handleTabChange} />
          ) : (
            <VideoList
              videos={videos}
              loading={loadingVideos}
              tab={activeTab}
              onRemove={handleRemove}
              onClearAll={activeTab === "history" ? handleClearAll : undefined}
              onClose={onClose}
            />
          )}
        </div>
      </div>

      {/* Slide-in keyframe */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0.6; }
          to   { transform: translateX(0);    opacity: 1;   }
        }
      `}</style>
    </>
  );
};

export default AccountPanel;
