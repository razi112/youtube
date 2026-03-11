import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getPopularVideos, YouTubeVideo, getVideoDetails } from "@/services/youtubeApi";
import { ThumbsUp, ThumbsDown, Share2, Download, MoreHorizontal, Loader2 } from "lucide-react";

const Watch = () => {
  const [searchParams] = useSearchParams();
  const videoId = searchParams.get("v") || "";
  const [searchQuery, setSearchQuery] = useState("");
  const [video, setVideo] = useState<YouTubeVideo | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [details, popular] = await Promise.all([
        getVideoDetails(videoId),
        getPopularVideos(12),
      ]);
      setVideo(details);
      setRelatedVideos(popular.videos.filter((v) => v.id !== videoId));
      setLoading(false);
    };
    if (videoId) load();
  }, [videoId]);

  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      navigate(`/?search=${encodeURIComponent(query)}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onMenuClick={() => {}} searchQuery={searchQuery} onSearchChange={handleSearch} />
        <div className="flex items-center justify-center pt-14 h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => {}} searchQuery={searchQuery} onSearchChange={handleSearch} />

      <main className="pt-14 px-3 md:px-6 lg:px-24 flex flex-col lg:flex-row gap-6 py-6 pb-20 md:pb-6">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Embedded Player */}
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title={video?.title || "Video player"}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Video Info */}
          {video && (
            <div className="mt-3">
              <h1 className="text-xl font-semibold leading-7">{video.title}</h1>

              <div className="flex flex-wrap items-center justify-between mt-3 gap-3">
                {/* Channel info */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={video.channel.avatar} />
                    <AvatarFallback>{video.channel.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{video.channel.name}</p>
                    <p className="text-xs text-muted-foreground">Subscribers</p>
                  </div>
                  <Button className="rounded-full ml-2 bg-foreground text-background hover:bg-foreground/80 text-sm h-9 px-4">
                    Subscribe
                  </Button>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-secondary rounded-full">
                    <Button variant="ghost" size="sm" className="rounded-l-full gap-1.5 px-4">
                      <ThumbsUp className="h-4 w-4" />
                      <span className="text-sm">{video.views}</span>
                    </Button>
                    <div className="w-px h-6 bg-border" />
                    <Button variant="ghost" size="sm" className="rounded-r-full px-3">
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="secondary" size="sm" className="rounded-full gap-1.5 px-4">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  <Button variant="secondary" size="sm" className="rounded-full gap-1.5 px-4">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <Button variant="secondary" size="icon" className="rounded-full h-9 w-9">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Description */}
              <div
                className="mt-4 bg-secondary rounded-xl p-3 cursor-pointer hover:bg-accent transition-colors"
                onClick={() => setDescriptionExpanded(!descriptionExpanded)}
              >
                <p className="text-sm font-medium">
                  {video.views} views • {video.uploadedAt}
                </p>
                <p className={`text-sm mt-1 text-muted-foreground ${descriptionExpanded ? "" : "line-clamp-2"}`}>
                  Click to watch this video. Uploaded by {video.channel.name}.
                </p>
                <span className="text-sm font-medium mt-1 inline-block">
                  {descriptionExpanded ? "Show less" : "...more"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Related videos sidebar */}
        <div className="lg:w-[400px] flex-shrink-0 space-y-3">
          {relatedVideos.map((v) => (
            <Link key={v.id} to={`/watch?v=${v.id}`} className="flex gap-2 group">
              <div className="relative w-40 flex-shrink-0">
                <img
                  src={v.thumbnail}
                  alt={v.title}
                  className="w-full aspect-video object-cover rounded-lg"
                />
                <span className="absolute bottom-1 right-1 bg-background/90 text-[10px] font-medium px-1 py-0.5 rounded">
                  {v.duration}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium line-clamp-2 leading-5 group-hover:text-primary-foreground">
                  {v.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{v.channel.name}</p>
                <p className="text-xs text-muted-foreground">
                  {v.views} views • {v.uploadedAt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Watch;
