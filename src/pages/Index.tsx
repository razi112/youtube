import { useState, useEffect, useRef, useCallback } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import CategoryChips from "@/components/CategoryChips";
import VideoGrid from "@/components/VideoGrid";
import BottomNav from "@/components/BottomNav";
import { getPopularVideos, searchYouTubeVideos, YouTubeVideo } from "@/services/youtubeApi";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [pageToken, setPageToken] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || loadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, loadingMore, hasMore, pageToken, searchQuery]
  );

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    if (searchQuery.trim()) {
      const { videos: moreVideos, nextPageToken } = await searchYouTubeVideos(searchQuery, 12, pageToken);
      setVideos((prev) => [...prev, ...moreVideos]);
      setPageToken(nextPageToken);
      setHasMore(!!nextPageToken);
    } else {
      const { videos: moreVideos, nextPageToken } = await getPopularVideos(12, pageToken);
      setVideos((prev) => [...prev, ...moreVideos]);
      setPageToken(nextPageToken);
      setHasMore(!!nextPageToken);
    }

    setLoadingMore(false);
  };

  // Load popular videos on mount
  useEffect(() => {
    const loadVideos = async () => {
      setLoading(true);
      const result = await getPopularVideos(16);
      setVideos(result.videos);
      setPageToken(result.nextPageToken);
      setHasMore(!!result.nextPageToken);
      setLoading(false);
    };
    loadVideos();
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (!searchQuery.trim()) {
      const loadPopular = async () => {
        setLoading(true);
        const result = await getPopularVideos(16);
        setVideos(result.videos);
        setPageToken(result.nextPageToken);
        setHasMore(!!result.nextPageToken);
        setLoading(false);
      };
      loadPopular();
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      const result = await searchYouTubeVideos(searchQuery, 16);
      setVideos(result.videos);
      setPageToken(result.nextPageToken);
      setHasMore(!!result.nextPageToken);
      setLoading(false);
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <Header
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <Sidebar isOpen={sidebarOpen} />
      
      <main
        className={`pt-14 transition-all duration-200 ${
          sidebarOpen ? "md:ml-60" : "md:ml-[72px]"
        } ml-0 pb-16 md:pb-0`}
      >
        <div className="px-3 md:px-6">
          <CategoryChips />
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <VideoGrid videos={videos} searchQuery={searchQuery} />
              {hasMore && (
                <div ref={sentinelRef} className="flex items-center justify-center py-8">
                  {loadingMore && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
