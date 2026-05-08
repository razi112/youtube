import VideoCard from "./VideoCard";
import { YouTubeVideo } from "@/services/youtubeApi";
import { SearchX, AlertCircle, RefreshCw } from "lucide-react";

interface VideoGridProps {
  videos: YouTubeVideo[];
  searchQuery: string;
  error?: string;
  onRetry?: () => void;
}

const VideoGrid = ({ videos, searchQuery, error, onRetry }: VideoGridProps) => {
  if (error) {
    const isQuota = error.includes("quota");
    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-24 gap-4 text-center px-4">
        <div className="bg-destructive/10 rounded-full p-4 sm:p-5">
          <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-destructive" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">
            {isQuota ? "API quota exceeded" : "Failed to load videos"}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xs sm:max-w-sm">
            {isQuota
              ? "The YouTube API daily quota has been reached. Try again after midnight Pacific Time, or add a new API key in your .env file."
              : `Error: ${error}`}
          </p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary hover:bg-accent transition-colors text-sm font-medium"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        )}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-muted-foreground gap-4 px-4">
        <SearchX className="h-12 w-12 sm:h-16 sm:w-16 opacity-40" />
        <div className="text-center">
          <h3 className="text-base sm:text-lg font-medium text-foreground mb-1">
            No results found
          </h3>
          <p className="text-xs sm:text-sm">
            {searchQuery
              ? `No videos match "${searchQuery}". Try different keywords.`
              : "No videos available right now."}
          </p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary hover:bg-accent transition-colors text-sm font-medium"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-3 sm:gap-x-4 gap-y-6 sm:gap-y-8 lg:gap-y-10">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
};

export default VideoGrid;
