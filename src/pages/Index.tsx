import { useState, useEffect, useRef, useCallback } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import CategoryChips from "@/components/CategoryChips";
import VideoGrid from "@/components/VideoGrid";
import BottomNav from "@/components/BottomNav";
import SectionPage from "@/pages/SectionPage";
import SignInModal from "@/components/SignInModal";
import ClipsShelf from "@/components/ClipsShelf";
import { getPopularVideos, searchYouTubeVideos, YouTubeVideo } from "@/services/youtubeApi";
import { Loader2 } from "lucide-react";

// Sections that show a dedicated page instead of the video grid
const USER_SECTIONS = ["History", "Liked videos", "Library", "Subscriptions", "Downloads"] as const;
type UserSection = typeof USER_SECTIONS[number];

const isUserSection = (s: string): s is UserSection =>
  USER_SECTIONS.includes(s as UserSection);

// Sections that map to a YouTube search query
const SECTION_QUERIES: Record<string, string> = {
  Home: "",
  Trending: "trending",
  Shopping: "shopping haul",
  Music: "music",
  Movies: "movies trailer",
  Live: "live stream",
  Gaming: "gaming",
  News: "news today",
  Sports: "sports highlights",
  Learning: "tutorial learning",
  Fashion: "fashion style",
};

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("Home");
  const [activeCategory, setActiveCategory] = useState("All");
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [apiError, setApiError] = useState<string | undefined>(undefined);
  const [pageToken, setPageToken] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [showSignIn, setShowSignIn] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const getEffectiveQuery = useCallback(
    (section: string, category: string, search: string): string => {
      if (search.trim()) return search.trim();
      if (category !== "All") return category;
      return SECTION_QUERIES[section] ?? "trending";
    },
    []
  );

  const fetchVideos = useCallback(
    async (section: string, category: string, search: string, token?: string) => {
      const query = getEffectiveQuery(section, category, search);
      if (query === "") return getPopularVideos(16, token);
      return searchYouTubeVideos(query, 16, token);
    },
    [getEffectiveQuery]
  );

  // Load on section / category change (skip user sections)
  useEffect(() => {
    if (isUserSection(activeSection)) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setApiError(undefined);
      setPageToken(undefined);
      const result = await fetchVideos(activeSection, activeCategory, searchQuery);
      if (!cancelled) {
        setVideos(result.videos);
        setPageToken(result.nextPageToken);
        setHasMore(!!result.nextPageToken);
        if (result.error) setApiError(result.error);
        setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [activeSection, activeCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search
  useEffect(() => {
    if (isUserSection(activeSection)) return;
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      setApiError(undefined);
      setPageToken(undefined);
      const result = await fetchVideos(activeSection, activeCategory, searchQuery);
      setVideos(result.videos);
      setPageToken(result.nextPageToken);
      setHasMore(!!result.nextPageToken);
      if (result.error) setApiError(result.error);
      setLoading(false);
    }, 500);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const result = await fetchVideos(activeSection, activeCategory, searchQuery, pageToken);
    setVideos((prev) => [...prev, ...result.videos]);
    setPageToken(result.nextPageToken);
    setHasMore(!!result.nextPageToken);
    setLoadingMore(false);
  }, [loadingMore, hasMore, activeSection, activeCategory, searchQuery, pageToken, fetchVideos]);

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || loadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) loadMore();
      });
      if (node) observerRef.current.observe(node);
    },
    [loading, loadingMore, hasMore, loadMore]
  );

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setActiveCategory("All");
    setSearchQuery("");
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setActiveSection("Home");
    setSearchQuery("");
  };

  const showUserSection = isUserSection(activeSection) && !searchQuery;

  return (
    <div className="min-h-screen bg-background">
      <Header
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <Sidebar
        isOpen={sidebarOpen}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />

      <main
        className={`pt-14 transition-all duration-200 ${
          sidebarOpen ? "md:ml-60" : "md:ml-[72px]"
        } ml-0 pb-20 md:pb-4`}
      >
        <div className="px-2 sm:px-3 md:px-5 lg:px-6">

          {/* Category chips — hide on user sections */}
          {!showUserSection && (
            <CategoryChips
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
            />
          )}

          {showUserSection ? (
            /* ── User section (History / Liked / Library / Subscriptions) ── */
            <div className="py-4">
              <SectionPage
                section={activeSection as UserSection}
                onSignInClick={() => setShowSignIn(true)}
              />
            </div>
          ) : (
            /* ── Normal video grid ── */
            <>
              {activeSection !== "Home" && !searchQuery && activeCategory === "All" && (
                <h2 className="text-lg font-semibold mb-3 mt-1">{activeSection}</h2>
              )}

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {/* Clips shelf — only on Home with no search/category filter */}
                  {activeSection === "Home" && !searchQuery && activeCategory === "All" && (
                    <ClipsShelf />
                  )}

                  <VideoGrid
                    videos={videos}
                    searchQuery={searchQuery}
                    error={apiError}
                    onRetry={() => {
                      setActiveSection((s) => s); // trigger re-fetch
                      setApiError(undefined);
                      setVideos([]);
                      setLoading(true);
                      fetchVideos(activeSection, activeCategory, searchQuery).then((r) => {
                        setVideos(r.videos);
                        setPageToken(r.nextPageToken);
                        setHasMore(!!r.nextPageToken);
                        if (r.error) setApiError(r.error);
                        setLoading(false);
                      });
                    }}
                  />
                  {hasMore && (
                    <div ref={sentinelRef} className="flex items-center justify-center py-8">
                      {loadingMore && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>

      <BottomNav activeSection={activeSection} onSectionChange={handleSectionChange} />
      <SignInModal open={showSignIn} onClose={() => setShowSignIn(false)} />
    </div>
  );
};

export default Index;
