import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getVideoComments, YouTubeComment } from "@/services/youtubeApi";
import { useAuth } from "@/context/AuthContext";
import {
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  Loader2,
  MessageSquareOff,
  ArrowUpDown,
} from "lucide-react";

// ─── Format like count ────────────────────────────────────────────────────────

const fmtLikes = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n > 0 ? String(n) : "";
};

const fmtCount = (n?: number) => {
  if (!n) return "";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
};

// ─── Single comment row ───────────────────────────────────────────────────────

const CommentRow = ({
  comment,
  isReply = false,
}: {
  comment: YouTubeComment;
  isReply?: boolean;
}) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [showReplies, setShowReplies] = useState(false);

  const handleLike = () => {
    setLiked((prev) => {
      setLikeCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  };

  return (
    <div className={`flex gap-3 ${isReply ? "ml-11 mt-3" : ""}`}>
      {/* Avatar */}
      <a
        href={
          comment.authorChannelId
            ? `https://www.youtube.com/channel/${comment.authorChannelId}`
            : undefined
        }
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 mt-0.5"
      >
        <Avatar className={isReply ? "h-7 w-7" : "h-9 w-9"}>
          <AvatarImage
            src={comment.authorAvatar}
            alt={comment.authorName}
            referrerPolicy="no-referrer"
          />
          <AvatarFallback className="text-xs font-semibold bg-secondary">
            {comment.authorName?.[0]?.toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>
      </a>

      <div className="flex-1 min-w-0">
        {/* Author + timestamp */}
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <a
            href={
              comment.authorChannelId
                ? `https://www.youtube.com/channel/${comment.authorChannelId}`
                : undefined
            }
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] font-semibold hover:text-primary transition-colors leading-none"
          >
            {comment.authorName}
          </a>
          <span className="text-[12px] text-muted-foreground leading-none">
            {comment.publishedAt}
          </span>
        </div>

        {/* Comment text — YouTube returns HTML with <br>, <b>, <a> etc. */}
        <div
          className="text-[13px] leading-[1.65] text-foreground/90 break-words [&_a]:text-primary [&_a]:hover:underline"
          dangerouslySetInnerHTML={{ __html: comment.text }}
        />

        {/* Like / Dislike / Reply */}
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-[12px] transition-colors ${
              liked
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ThumbsUp
              className={`h-3.5 w-3.5 ${liked ? "fill-foreground stroke-foreground" : ""}`}
            />
            {fmtLikes(likeCount)}
          </button>

          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <ThumbsDown className="h-3.5 w-3.5" />
          </button>

          <button className="text-[12px] font-semibold text-muted-foreground hover:text-foreground transition-colors">
            Reply
          </button>
        </div>

        {/* Replies toggle */}
        {!isReply && comment.replyCount > 0 && (
          <button
            onClick={() => setShowReplies((s) => !s)}
            className="flex items-center gap-1.5 mt-2.5 text-[13px] font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            {showReplies ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Hide {comment.replyCount}{" "}
                {comment.replyCount === 1 ? "reply" : "replies"}
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                {comment.replyCount}{" "}
                {comment.replyCount === 1 ? "reply" : "replies"}
              </>
            )}
          </button>
        )}

        {/* Inline replies (up to 5 from API) */}
        {showReplies &&
          comment.replies?.map((reply) => (
            <CommentRow key={reply.id} comment={reply} isReply />
          ))}
      </div>
    </div>
  );
};

// ─── Comment input ────────────────────────────────────────────────────────────

const CommentInput = ({ onSignIn }: { onSignIn?: () => void }) => {
  const { user } = useAuth();
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState("");

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const initials = (
    (user?.user_metadata?.full_name as string) ??
    user?.email ??
    "U"
  )
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex gap-3 mb-8">
      <Avatar className="h-9 w-9 flex-shrink-0">
        <AvatarImage src={avatarUrl} referrerPolicy="no-referrer" />
        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        {user ? (
          <>
            <input
              type="text"
              placeholder="Add a comment…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setFocused(true)}
              className="w-full bg-transparent border-b border-border pb-1.5 text-sm focus:outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground"
            />
            {focused && (
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    setFocused(false);
                    setText("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="rounded-full"
                  disabled={!text.trim()}
                >
                  Comment
                </Button>
              </div>
            )}
          </>
        ) : (
          <button
            onClick={onSignIn}
            className="w-full text-left border-b border-border pb-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in to comment…
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Main Comments section ────────────────────────────────────────────────────

interface CommentsProps {
  videoId: string;
  onSignIn?: () => void;
}

const Comments = ({ videoId, onSignIn }: CommentsProps) => {
  const [comments, setComments] = useState<YouTubeComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [totalCount, setTotalCount] = useState<number | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<"relevance" | "time">("relevance");
  const [collapsed, setCollapsed] = useState(false);

  // Use a ref so loadMore always has the latest token without re-creating the fn
  const tokenRef = useRef<string | undefined>(undefined);
  tokenRef.current = nextPageToken;

  // Initial load / reload when videoId or order changes
  useEffect(() => {
    let cancelled = false;

    const fetchFirst = async () => {
      setLoading(true);
      setComments([]);
      setNextPageToken(undefined);
      setError(null);

      const result = await getVideoComments(videoId, 20, undefined, order);

      if (cancelled) return;

      if (result.error) {
        setError(result.error);
      } else {
        setComments(result.comments);
        setNextPageToken(result.nextPageToken);
        if (result.totalCount) setTotalCount(result.totalCount);
      }
      setLoading(false);
    };

    fetchFirst();
    return () => { cancelled = true; };
  }, [videoId, order]);

  // Load next page
  const loadMore = async () => {
    if (loadingMore || !tokenRef.current) return;
    setLoadingMore(true);

    const result = await getVideoComments(videoId, 20, tokenRef.current, order);

    if (!result.error) {
      setComments((prev) => [...prev, ...result.comments]);
      setNextPageToken(result.nextPageToken);
    }
    setLoadingMore(false);
  };

  return (
    <div className="mt-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          <h2 className="text-base font-semibold">
            {totalCount ? `${fmtCount(totalCount)} Comments` : "Comments"}
          </h2>

          {/* Sort toggle */}
          <button
            onClick={() =>
              setOrder((o) => (o === "relevance" ? "time" : "relevance"))
            }
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            {order === "relevance" ? "Top comments" : "Newest first"}
          </button>
        </div>

        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {collapsed ? (
            <><ChevronDown className="h-4 w-4" /> Show</>
          ) : (
            <><ChevronUp className="h-4 w-4" /> Hide</>
          )}
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Comment input */}
          <CommentInput onSignIn={onSignIn} />

          {/* ── States ── */}
          {loading ? (
            <div className="flex items-center justify-center py-14">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 py-14 text-center">
              <MessageSquareOff className="h-10 w-10 text-muted-foreground opacity-40" />
              <p className="text-sm text-muted-foreground max-w-xs">
                {error.includes("commentsDisabled") ||
                error.includes("disabled") ||
                error.includes("403")
                  ? "Comments are turned off for this video."
                  : error.includes("quota")
                  ? "Comment quota reached. Try again later."
                  : "Could not load comments right now."}
              </p>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-14 text-center">
              <MessageSquareOff className="h-10 w-10 text-muted-foreground opacity-40" />
              <p className="text-sm text-muted-foreground">
                No comments yet. Be the first!
              </p>
            </div>
          ) : (
            <>
              {/* ── Comment list ── */}
              <div className="space-y-6">
                {comments.map((c) => (
                  <CommentRow key={c.id} comment={c} />
                ))}
              </div>

              {/* ── Load more ── */}
              {nextPageToken && (
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="mt-7 flex items-center gap-2 text-sm font-semibold text-primary hover:underline disabled:opacity-50 transition-opacity"
                >
                  {loadingMore ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  Show more comments
                </button>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Comments;
