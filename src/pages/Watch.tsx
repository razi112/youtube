import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Comments from "@/components/Comments";
import SignInModal from "@/components/SignInModal";
import DownloadModal from "@/components/DownloadModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getPopularVideos, YouTubeVideo, getVideoDetails } from "@/services/youtubeApi";
import { useAuth } from "@/context/AuthContext";
import {
  addToHistory,
  likeVideo,
  unlikeVideo,
  isVideoLiked,
  saveVideo,
  unsaveVideo,
} from "@/lib/userStore";
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Download,
  MoreHorizontal,
  Loader2,
  Bell,
  ChevronDown,
  ChevronUp,
  Scissors,
  BookMarked,
} from "lucide-react";

/* ─── Compact related-video row ─── */
const RelatedCard = ({ v }: { v: YouTubeVideo }) => (
  <Link to={`/watch?v=${v.id}`} className="flex gap-2 group">
    <div className="relative w-[140px] sm:w-[160px] lg:w-[168px] flex-shrink-0 rounded-lg overflow-hidden bg-muted">
      <img
        src={v.thumbnail}
        alt={v.title}
        className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
      <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-medium px-1 py-0.5 rounded">
        {v.duration}
      </span>
    </div>
    <div className="flex-1 min-w-0 py-0.5">
      <h3 className="text-[12px] sm:text-[13px] font-medium line-clamp-2 leading-[17px] sm:leading-[18px] text-foreground group-hover:text-primary transition-colors">
        {v.title}
      </h3>
      <p className="text-[11px] sm:text-[12px] text-muted-foreground mt-1 hover:text-foreground transition-colors truncate">
        {v.channel.name}
      </p>
      <p className="text-[11px] sm:text-[12px] text-muted-foreground">
        {v.views} views&nbsp;•&nbsp;{v.uploadedAt}
      </p>
    </div>
  </Link>
);

/* ─── Main Watch page ─── */
const Watch = () => {
  const [searchParams] = useSearchParams();
  const videoId = searchParams.get("v") || "";
  const navigate = useNavigate();
  const { user } = useAuth();

  // Sidebar — starts closed on watch page (more screen for video)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Home");

  const [searchQuery, setSearchQuery] = useState("");
  const [video, setVideo] = useState<YouTubeVideo | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [descExpanded, setDescExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [showDownload, setShowDownload] = useState(false);

  useEffect(() => {
    if (!videoId) return;
    setLoading(true);
    setDescExpanded(false);
    setLiked(false);
    setDisliked(false);
    setSaved(false);

    Promise.all([getVideoDetails(videoId), getPopularVideos(15)]).then(
      async ([details, popular]) => {
        setVideo(details);
        setRelatedVideos(popular.videos.filter((v) => v.id !== videoId));
        setLoading(false);
        if (details && user) {
          await addToHistory(details, user.id);
          const alreadyLiked = await isVideoLiked(videoId, user.id);
          setLiked(alreadyLiked);
        }
      }
    );
  }, [videoId, user]);

  const handleLike = async () => {
    if (!video) return;
    const next = !liked;
    setLiked(next);
    setDisliked(false);
    if (user) {
      if (next) await likeVideo(video, user.id);
      else await unlikeVideo(video.id, user.id);
    }
  };

  const handleDislike = () => {
    setDisliked(!disliked);
    setLiked(false);
    if (user && video && disliked) unlikeVideo(video.id, user.id);
  };

  const handleSave = async () => {
    if (!video || !user) return;
    const next = !saved;
    setSaved(next);
    if (next) await saveVideo(video, user.id);
    else await unsaveVideo(video.id, user.id);
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (q.trim()) navigate(`/?search=${encodeURIComponent(q)}`);
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          onMenuClick={() => setSidebarOpen((o) => !o)}
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
        />
        <Sidebar
          isOpen={sidebarOpen}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        onMenuClick={() => setSidebarOpen((o) => !o)}
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
      />

      {/* Sidebar — slides in/out over the content */}
      <Sidebar
        isOpen={sidebarOpen}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />

      {/* Backdrop — clicking it closes the sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <SignInModal open={showSignIn} onClose={() => setShowSignIn(false)} />
      <DownloadModal
        open={showDownload}
        onClose={() => setShowDownload(false)}
        video={video}
        onSignIn={() => { setShowDownload(false); setShowSignIn(true); }}
      />

      <main
        className={`pt-14 transition-all duration-200 ${
          sidebarOpen ? "md:ml-60" : "md:ml-[72px]"
        } ml-0 pb-20 md:pb-6`}
      >
        <div className="max-w-[1800px] mx-auto px-2 sm:px-3 md:px-5 lg:px-8 flex flex-col lg:flex-row gap-4 sm:gap-6 py-3 sm:py-4">

          {/* ── Left: player + info ── */}
          <div className="flex-1 min-w-0">

            {/* Player */}
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-2xl">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                title={video?.title || "Video player"}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {video && (
              <>
                {/* Title */}
                <h1 className="mt-3 text-base md:text-[18px] font-semibold leading-6 text-foreground">
                  {video.title}
                </h1>

                {/* Channel row + actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
                  {/* Channel */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                      <AvatarImage src={video.channel.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                        {video.channel.name[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm leading-5">{video.channel.name}</p>
                      <p className="text-xs text-muted-foreground">1.2M subscribers</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        onClick={() => setSubscribed(!subscribed)}
                        className={`rounded-full h-9 px-4 text-sm font-medium transition-all ${
                          subscribed
                            ? "bg-secondary text-foreground hover:bg-accent"
                            : "bg-foreground text-background hover:bg-foreground/80"
                        }`}
                      >
                        {subscribed ? "Subscribed" : "Subscribe"}
                      </Button>
                      {subscribed && (
                        <Button variant="secondary" size="icon" className="rounded-full h-9 w-9">
                          <Bell className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center bg-secondary rounded-full overflow-hidden">
                      <button
                        onClick={handleLike}
                        className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium hover:bg-accent transition-colors ${liked ? "text-primary" : ""}`}
                        title={user ? "Like" : "Sign in to like"}
                      >
                        <ThumbsUp className={`h-4 w-4 ${liked ? "fill-primary stroke-primary" : ""}`} />
                        {video.views}
                      </button>
                      <div className="w-px h-5 bg-border" />
                      <button
                        onClick={handleDislike}
                        className={`px-3 py-2 hover:bg-accent transition-colors ${disliked ? "text-primary" : ""}`}
                      >
                        <ThumbsDown className={`h-4 w-4 ${disliked ? "fill-primary stroke-primary" : ""}`} />
                      </button>
                    </div>

                    <Button variant="secondary" size="sm" className="rounded-full gap-1.5 px-4 h-9">
                      <Share2 className="h-4 w-4" /><span>Share</span>
                    </Button>
                    <Button variant="secondary" size="sm" className="rounded-full gap-1.5 px-4 h-9">
                      <Scissors className="h-4 w-4" /><span className="hidden sm:inline">Clip</span>
                    </Button>
                    <Button
                      variant="secondary" size="sm"
                      onClick={handleSave}
                      className={`rounded-full gap-1.5 px-4 h-9 ${saved ? "text-primary" : ""}`}
                      title={user ? (saved ? "Saved" : "Save") : "Sign in to save"}
                    >
                      <BookMarked className={`h-4 w-4 ${saved ? "fill-primary stroke-primary" : ""}`} />
                      <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
                    </Button>
                    <Button
                      variant="secondary" size="sm"
                      onClick={() => setShowDownload(true)}
                      className="rounded-full gap-1.5 px-4 h-9"
                    >
                      <Download className="h-4 w-4" /><span className="hidden sm:inline">Download</span>
                    </Button>
                    <Button variant="secondary" size="icon" className="rounded-full h-9 w-9">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Description */}
                <div
                  className="mt-4 bg-secondary hover:bg-accent/60 rounded-xl p-4 cursor-pointer transition-colors"
                  onClick={() => setDescExpanded(!descExpanded)}
                >
                  <div className="flex items-center gap-3 text-sm font-medium mb-1">
                    <span>{video.views} views</span>
                    <span className="text-muted-foreground">{video.uploadedAt}</span>
                    <span className="text-primary text-xs font-semibold">#trending #viral</span>
                  </div>
                  <p className={`text-sm text-foreground/80 leading-6 whitespace-pre-line ${descExpanded ? "" : "line-clamp-2"}`}>
                    {`Uploaded by ${video.channel.name}.\n\nWatch this amazing video and don't forget to like, comment, and subscribe for more content like this!\n\nFollow us on social media for behind-the-scenes content and updates.\n\n#${video.channel.name.replace(/\s/g, "")} #ADØ #video`}
                  </p>
                  <button className="flex items-center gap-1 text-sm font-semibold mt-2 hover:text-primary transition-colors">
                    {descExpanded
                      ? <><ChevronUp className="h-4 w-4" /> Show less</>
                      : <><ChevronDown className="h-4 w-4" /> Show more</>}
                  </button>
                </div>

                {/* Real comments from YouTube API */}
                <Comments
                  videoId={videoId}
                  onSignIn={() => setShowSignIn(true)}
                />
              </>
            )}
          </div>

          {/* ── Right: related videos ── */}
          <div className="w-full lg:w-[360px] xl:w-[402px] flex-shrink-0">
            <div className="space-y-2 sm:space-y-3">
              {relatedVideos.map((v) => <RelatedCard key={v.id} v={v} />)}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Watch;
