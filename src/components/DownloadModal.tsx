import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { YouTubeVideo } from "@/services/youtubeApi";
import { useAuth } from "@/context/AuthContext";
import { addDownload } from "@/lib/userStore";
import {
  Download,
  HardDrive,
  CheckCircle2,
  LogIn,
  Loader2,
} from "lucide-react";

interface DownloadModalProps {
  open: boolean;
  onClose: () => void;
  video: YouTubeVideo | null;
  onSignIn: () => void;
}

const DownloadModal = ({ open, onClose, video, onSignIn }: DownloadModalProps) => {
  const { user } = useAuth();
  const [savedToAdo, setSavedToAdo] = useState(false);
  const [savingToAdo, setSavingToAdo] = useState(false);

  if (!video) return null;

  // "Download to device" — opens YouTube's own page in a new tab
  // (direct MP4 download requires a backend/proxy; this is the best browser-safe approach)
  const handleDeviceDownload = () => {
    window.open(`https://www.youtube.com/watch?v=${video.id}`, "_blank");
    onClose();
  };

  // "Download to ADØ" — saves to Supabase downloads table
  const handleAdoDownload = async () => {
    if (!user) {
      onClose();
      onSignIn();
      return;
    }
    setSavingToAdo(true);
    await addDownload(video, user.id);
    setSavingToAdo(false);
    setSavedToAdo(true);
    setTimeout(() => {
      setSavedToAdo(false);
      onClose();
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Download className="h-5 w-5 text-primary" />
            Download video
          </DialogTitle>
        </DialogHeader>

        {/* Video preview */}
        <div className="flex items-center gap-3 px-6 py-4 bg-secondary/40">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-24 aspect-video object-cover rounded-lg flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium line-clamp-2 leading-5">{video.title}</p>
            <p className="text-xs text-muted-foreground mt-1 truncate">{video.channel.name}</p>
            <p className="text-xs text-muted-foreground">{video.duration} · {video.views} views</p>
          </div>
        </div>

        {/* Options */}
        <div className="px-6 py-4 flex flex-col gap-3">
          {/* Download to device */}
          <button
            onClick={handleDeviceDownload}
            className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-accent transition-colors text-left group"
          >
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
              <HardDrive className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div>
              <p className="text-sm font-semibold">Download to device</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Opens YouTube to download the video file
              </p>
            </div>
          </button>

          {/* Download to ADØ */}
          <button
            onClick={handleAdoDownload}
            disabled={savingToAdo || savedToAdo}
            className="flex items-center gap-4 p-4 rounded-xl border border-primary/40 hover:bg-primary/5 transition-colors text-left group disabled:opacity-70"
          >
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              {savingToAdo ? (
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              ) : savedToAdo ? (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary fill-current">
                  <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-primary">
                {savedToAdo ? "Saved to ADØ!" : "Download to ADØ"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {user
                  ? "Save to your ADØ downloads library"
                  : "Sign in to save to your ADØ library"}
              </p>
            </div>
            {!user && (
              <LogIn className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
          </button>
        </div>

        <div className="px-6 pb-5">
          <Button
            variant="ghost"
            className="w-full rounded-xl text-muted-foreground"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadModal;
