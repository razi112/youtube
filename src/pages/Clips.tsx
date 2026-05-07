import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getShorts, YouTubeVideo } from "@/services/youtubeApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Share2,
  Music2,
  ChevronUp,
  ChevronDown,
  Loader2,
  X,
} from "lucide-react";

// ─── Clip card (one full-screen vertical video) ──────────────────────────────

interface ClipCardProps {
  video: YouTubeVideo;
  isActive: boolean;
  index: number;
}

const ClipCard = ({ video, isActive }: ClipCardProps) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(
    Math.floor(Math.random() * 900 + 100) + "K"
  );
  const [showComment, setShowComment] = useState(false);
  const navigate = useNavigate();

  const handleLike = () => {
    setLiked((l) => !l);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black snap-start snap-always">
      {/* ── Video iframe ── */}
      <div className="relative w-full h-full max-w-[420px] mx-auto">
        {isActive ? (
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1&mute=0&controls=0&modestbranding=1&rel=0&loop=1&playlist=${video.id}&start=5`}
            className="w-full h-full object-cover"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title={video.title}
          />
        ) : (
          /* Thumbnail placeholder for non-active clips */
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        )}

        {/* Dark gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

        {/* ── Bottom info ── */}
        <div className="absolute bottom-0 left-0 right-14 p-4 pb-6">
          {/* Channel */}
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-9 w-9 ring-2 ring-white/60">
              <AvatarImage src={video.channel.avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                {video.channel.name[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-white font-semibold text-sm drop-shadow">
              {video.channel.name}
            </span>
            <button className="ml-1 px-3 py-0.5 rounded-full border border-white text-white text-xs font-semibold hover:bg-white hover:text-black transition-colors">
              Follow
            </button>
          </div>

          {/* Title */}
          <p className="text-white text-sm leading-5 line-clamp-2 drop-shadow mb-2">
            {video.title}
          </p>

          {/* Music ticker */}
          <div className="flex items-center gap-1.5 text-white/80 text-xs">
            <Music2 className="h-3.5 w-3.5 flex-shrink-0 animate-spin" style={{ animationDuration: "3s" }} />
            <span className="truncate max-w-[200px]">
              Original audio · {video.channel.name}
            </span>
          </div>
        </div>

        {/* ── Right action buttons ── */}
        <div className="absolute right-2 bottom-16 flex flex-col items-center gap-5">
          {/* Like */}
          <button onClick={handleLike} className="flex flex-col items-center gap-1">
            <div className={`p-2.5 rounded-full ${liked ? "bg-primary/20" : "bg-black/40"} backdrop-blur-sm transition-colors`}>
              <ThumbsUp className={`h-6 w-6 ${liked ? "fill-primary stroke-primary" : "text-white"}`} />
            </div>
            <span className="text-white text-[11px] font-medium drop-shadow">{likeCount}</span>
          </button>

          {/* Dislike */}
          <button className="flex flex-col items-center gap-1">
            <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-sm">
              <ThumbsDown className="h-6 w-6 text-white" />
            </div>
            <span className="text-white text-[11px] font-medium drop-shadow">Dislike</span>
          </button>

          {/* Comments */}
          <button onClick={() => setShowComment(true)} className="flex flex-col items-center gap-1">
            <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-sm">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <span className="text-white text-[11px] font-medium drop-shadow">
              {Math.floor(Math.random() * 900 + 50)}
            </span>
          </button>

          {/* Share */}
          <button className="flex flex-col items-center gap-1">
            <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-sm">
              <Share2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-white text-[11px] font-medium drop-shadow">Share</span>
          </button>

          {/* Channel avatar spinning disc */}
          <button
            onClick={() => navigate(`/watch?v=${video.id}`)}
            className="mt-1"
            title="Watch full video"
          >
            <Avatar className="h-10 w-10 ring-2 ring-white animate-spin" style={{ animationDuration: "4s" }}>
              <AvatarImage src={video.channel.avatar} className="w-full h-full object-cover" />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                {video.channel.name[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </button>
        </div>
      </div>

      {/* ── Comment drawer ── */}
      {showComment && (
        <div
          className="absolute inset-0 z-20 flex flex-col justify-end"
          onClick={() => setShowComment(false)}
        >
          <div
            className="bg-[#1a1a1a] rounded-t-2xl p-4 max-h-[60%] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Comments</h3>
              <button onClick={() => setShowComment(false)}>
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            {[
              { name: "Alex J.", text: "This is fire 🔥🔥", likes: "2.1K" },
              { name: "Sarah M.", text: "Can't stop watching this on repeat!", likes: "847" },
              { name: "TechGuru", text: "Absolutely incredible content 😍", likes: "312" },
              { name: "Maria G.", text: "New subscriber here! Love it", likes: "204" },
              { name: "Dev P.", text: "Watched this 10 times already 💯", likes: "98" },
            ].map((c) => (
              <div key={c.name} className="flex gap-3 mb-4">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-secondary text-xs">{c.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-white/80 mb-0.5">{c.name}</p>
                  <p className="text-sm text-white/90">{c.text}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <button className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <ThumbsUp className="h-3 w-3" /> {c.likes}
                    </button>
                    <button className="text-[11px] text-muted-foreground">Reply</button>
                  </div>
                </div>
              </div>
            ))}
            {/* Comment input */}
            <div className="flex gap-2 mt-2 sticky bottom-0 bg-[#1a1a1a] pt-2">
              <input
                type="text"
                placeholder="Add a comment…"
                className="flex-1 bg-white/10 rounded-full px-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button size="sm" className="rounded-full px-4">Post</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Navigation arrows (desktop) ─────────────────────────────────────────────

const NavArrow = ({ dir, onClick }: { dir: "up" | "down"; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="hidden md:flex absolute right-6 z-30 h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
    style={{ [dir === "up" ? "top" : "bottom"]: "50%", transform: "translateY(-50%)" }}
  >
    {dir === "up" ? (
      <ChevronUp className="h-6 w-6 text-white" />
    ) : (
      <ChevronDown className="h-6 w-6 text-white" />
    )}
  </button>
);

// ─── Main Clips page ──────────────────────────────────────────────────────────

const Clips = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getShorts(20).then((res) => {
      setVideos(res.videos);
      setLoading(false);
    });
  }, []);

  // Scroll to a specific index
  const scrollTo = useCallback((idx: number) => {
    const container = containerRef.current;
    if (!container) return;
    const child = container.children[idx] as HTMLElement;
    if (child) child.scrollIntoView({ behavior: "smooth" });
    setActiveIdx(idx);
  }, []);

  // Track active clip via IntersectionObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Array.from(container.children).indexOf(entry.target as HTMLElement);
            if (idx !== -1) setActiveIdx(idx);
          }
        });
      },
      { root: container, threshold: 0.6 }
    );
    Array.from(container.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [videos]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") scrollTo(Math.min(activeIdx + 1, videos.length - 1));
      if (e.key === "ArrowUp") scrollTo(Math.max(activeIdx - 1, 0));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeIdx, videos.length, scrollTo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* Transparent header overlay */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/60 to-transparent pointer-events-none h-16" />
      <div className="absolute top-0 left-0 right-0 z-50 pointer-events-auto">
        <Header
          onMenuClick={() => navigate("/")}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Clips feed */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-hide mt-0"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {videos.map((video, i) => (
          <div key={video.id} className="w-full h-screen snap-start snap-always flex-shrink-0">
            <ClipCard video={video} isActive={i === activeIdx} index={i} />
          </div>
        ))}
      </div>

      {/* Desktop nav arrows */}
      <NavArrow dir="up" onClick={() => scrollTo(Math.max(activeIdx - 1, 0))} />
      <NavArrow dir="down" onClick={() => scrollTo(Math.min(activeIdx + 1, videos.length - 1))} />

      {/* Clip counter */}
      <div className="absolute top-16 right-4 z-30 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs font-medium">
        {activeIdx + 1} / {videos.length}
      </div>
    </div>
  );
};

export default Clips;
