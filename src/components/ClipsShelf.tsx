import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getShorts, YouTubeVideo } from "@/services/youtubeApi";
import { ChevronLeft, ChevronRight, MoreVertical, Loader2 } from "lucide-react";

/* ─── Single portrait clip card ─────────────────────────────────────────────── */
const ClipThumb = ({ video }: { video: YouTubeVideo }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex-shrink-0 w-[168px] cursor-pointer group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false); }}
    >
      {/* Portrait thumbnail */}
      <div
        className="relative rounded-xl overflow-hidden bg-muted"
        style={{ aspectRatio: "9/16" }}
        onClick={() => navigate(`/clips`)}
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            hovered ? "scale-105" : "scale-100"
          }`}
          loading="lazy"
        />

        {/* Duration badge */}
        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md leading-none">
          {video.duration}
        </span>

        {/* Play overlay on hover */}
        {hovered && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="bg-black/60 rounded-full p-3">
              <svg viewBox="0 0 24 24" className="h-7 w-7 fill-white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Info row */}
      <div className="mt-2 flex items-start justify-between gap-1 px-0.5">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium line-clamp-2 leading-[18px] text-foreground">
            {video.title}
          </p>
          <p className="text-[12px] text-muted-foreground mt-0.5 truncate">
            {video.views} views
          </p>
        </div>

        {/* 3-dot menu */}
        <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`p-0.5 rounded-full hover:bg-accent transition-opacity mt-0.5 ${
              hovered ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-6 z-50 w-44 bg-popover border border-border rounded-xl shadow-xl py-1 text-sm">
              {["Save to Watch later", "Save to playlist", "Share", "Not interested"].map((item) => (
                <button
                  key={item}
                  className="w-full text-left px-4 py-2.5 hover:bg-accent transition-colors"
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

/* ─── Clips shelf (horizontal scrollable row) ────────────────────────────────── */
const ClipsShelf = () => {
  const [clips, setClips] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getShorts(12).then((res) => {
      setClips(res.videos);
      setLoading(false);
    });
  }, []);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -600 : 600, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-5 w-5 rounded bg-muted animate-pulse" />
          <div className="h-5 w-16 rounded bg-muted animate-pulse" />
        </div>
        <div className="flex gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[168px] rounded-xl bg-muted animate-pulse"
              style={{ aspectRatio: "9/16" }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (clips.length === 0) return null;

  return (
    <div className="mb-8">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => navigate("/clips")}
          className="flex items-center gap-2 group"
        >
          {/* Clips icon */}
          <div className="bg-primary rounded-md p-1">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-primary-foreground">
              <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
            </svg>
          </div>
          <span className="text-base font-bold group-hover:text-primary transition-colors">
            Clips
          </span>
          <span className="text-[10px] font-black text-primary">ADØ</span>
        </button>

        <button
          onClick={() => navigate("/clips")}
          className="text-sm font-medium text-primary hover:underline"
        >
          View all
        </button>
      </div>

      {/* Scroll container */}
      <div className="relative">
        {/* Left arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 h-10 w-10 rounded-full bg-background border border-border shadow-lg flex items-center justify-center hover:bg-accent transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* Right arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 h-10 w-10 rounded-full bg-background border border-border shadow-lg flex items-center justify-center hover:bg-accent transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        {/* Scrollable row */}
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-1"
        >
          {clips.map((clip) => (
            <ClipThumb key={clip.id} video={clip} />
          ))}

          {/* "See more" card at the end */}
          <div
            onClick={() => navigate("/clips")}
            className="flex-shrink-0 w-[168px] rounded-xl border border-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-accent transition-colors text-sm font-medium text-muted-foreground hover:text-foreground"
            style={{ aspectRatio: "9/16" }}
          >
            <ChevronRight className="h-8 w-8" />
            <span>See all Clips</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClipsShelf;
