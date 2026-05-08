import { useState, useRef, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreVertical, Clock, ListPlus, VolumeX, Volume2 } from "lucide-react";
import { YouTubeVideo } from "@/services/youtubeApi";
import { useNavigate } from "react-router-dom";

interface VideoCardProps {
  video: YouTubeVideo;
  enablePreview?: boolean;
}

const PREVIEW_DELAY_MS = 1200;

const VideoCard = ({ video, enablePreview = true }: VideoCardProps) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [muted, setMuted] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const startPreview = useCallback(() => {
    if (!enablePreview) return;
    setHovered(true);
    setProgress(0);
    const step = 100 / (PREVIEW_DELAY_MS / 16);
    progressTimer.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(progressTimer.current!); return 100; }
        return p + step;
      });
    }, 16);
    hoverTimer.current = setTimeout(() => setPreviewing(true), PREVIEW_DELAY_MS);
  }, [enablePreview]);

  const stopPreview = useCallback(() => {
    setHovered(false);
    setPreviewing(false);
    setProgress(0);
    setMuted(true);
    setMenuOpen(false);
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    if (progressTimer.current) clearInterval(progressTimer.current);
  }, []);

  const previewSrc = `https://www.youtube.com/embed/${video.id}?autoplay=1&mute=${
    muted ? 1 : 0
  }&controls=0&modestbranding=1&rel=0&loop=1&playlist=${video.id}&start=10`;

  return (
    <div
      className="group cursor-pointer"
      onClick={() => navigate(`/watch?v=${video.id}`)}
      onMouseEnter={startPreview}
      onMouseLeave={stopPreview}
    >
      {/* Thumbnail */}
      <div className="relative rounded-xl overflow-hidden bg-muted mb-2 sm:mb-3">
        <div className="aspect-video w-full">
          <img
            src={video.thumbnail}
            alt={video.title}
            className={`w-full h-full object-cover transition-all duration-300 ${
              previewing ? "opacity-0 scale-105" : hovered ? "scale-105" : "scale-100"
            }`}
            loading="lazy"
          />
          {previewing && (
            <iframe
              src={previewSrc}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen={false}
              title={`Preview: ${video.title}`}
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>

        {/* Progress bar */}
        {hovered && !previewing && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/20 overflow-hidden">
            <div className="h-full bg-primary transition-none" style={{ width: `${progress}%` }} />
          </div>
        )}

        {/* Duration badge */}
        {!previewing && (
          <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] sm:text-[11px] font-medium px-1 sm:px-1.5 py-0.5 rounded-md leading-none">
            {video.duration}
          </span>
        )}

        {/* Mute toggle */}
        {previewing && (
          <button
            onClick={(e) => { e.stopPropagation(); setMuted((m) => !m); }}
            className="absolute bottom-2 right-2 bg-black/70 hover:bg-black text-white rounded-full p-1.5 z-10"
          >
            {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
        )}

        {/* Watch later / Save — desktop hover only */}
        {!previewing && (
          <div
            className={`absolute top-2 right-2 flex-col gap-1.5 transition-opacity duration-150 hidden sm:flex ${
              hovered ? "opacity-100" : "opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="bg-black/80 hover:bg-black text-white rounded-full p-1.5 flex items-center gap-1 text-[11px] font-medium whitespace-nowrap">
              <Clock className="h-3.5 w-3.5" />
              <span className="hidden group-hover:inline pr-1">Watch later</span>
            </button>
            <button className="bg-black/80 hover:bg-black text-white rounded-full p-1.5 flex items-center gap-1 text-[11px] font-medium whitespace-nowrap">
              <ListPlus className="h-3.5 w-3.5" />
              <span className="hidden group-hover:inline pr-1">Save</span>
            </button>
          </div>
        )}
      </div>

      {/* Info row */}
      <div className="flex gap-2 sm:gap-3 px-0.5">
        <div className="flex-shrink-0 pt-0.5">
          <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
            <AvatarImage src={video.channel.avatar} />
            <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
              {video.channel.name[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-xs sm:text-sm font-medium leading-4 sm:leading-5 line-clamp-2 text-foreground mb-0.5 sm:mb-1">
            {video.title}
          </h3>
          <p className="text-[11px] sm:text-[13px] text-muted-foreground hover:text-foreground transition-colors truncate">
            {video.channel.name}
          </p>
          <p className="text-[11px] sm:text-[13px] text-muted-foreground">
            {video.views} views&nbsp;•&nbsp;{video.uploadedAt}
          </p>
        </div>

        {/* 3-dot menu */}
        <div className="flex-shrink-0 relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`p-1 rounded-full hover:bg-accent transition-opacity ${
              hovered ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-7 z-50 w-48 sm:w-52 bg-popover border border-border rounded-xl shadow-xl py-1 text-sm">
              {["Add to queue", "Save to Watch later", "Save to playlist", "Share", "Not interested", "Don't recommend channel"].map((item) => (
                <button
                  key={item}
                  className="w-full text-left px-4 py-2.5 hover:bg-accent transition-colors text-xs sm:text-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
