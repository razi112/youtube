import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, Mic, Clock, TrendingUp } from "lucide-react";
import { searchYouTubeVideos } from "@/services/youtubeApi";
import { useNavigate } from "react-router-dom";

interface Suggestion {
  text: string;
  thumbnail?: string; // only for video-match suggestions
  type: "query" | "trending" | "recent";
}

// YouTube autocomplete via a CORS-friendly proxy approach
// Falls back to local trending suggestions if the API is unavailable
const TRENDING_SEEDS = [
  "trending music", "funny videos", "gaming highlights",
  "news today", "cooking recipes", "travel vlog",
  "movie trailer", "live stream", "sports highlights",
  "tech review", "fashion haul", "learning tutorial",
];

const STORAGE_KEY = "ado_recent_searches";

const getRecent = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveRecent = (query: string) => {
  const prev = getRecent().filter((q) => q !== query);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([query, ...prev].slice(0, 8)));
};

const removeRecent = (query: string) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(getRecent().filter((q) => q !== query))
  );
};

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const SearchBar = ({ searchQuery, onSearchChange }: SearchBarProps) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Build suggestions list
  const buildSuggestions = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        // Show recent + trending when empty
        const recent = getRecent().map<Suggestion>((t) => ({ text: t, type: "recent" }));
        const trending = TRENDING_SEEDS.slice(0, 8 - recent.length).map<Suggestion>((t) => ({
          text: t,
          type: "trending",
        }));
        setSuggestions([...recent, ...trending]);
        return;
      }

      setLoadingSuggestions(true);

      // Generate local prefix-based suggestions immediately
      const q = query.toLowerCase();
      const localSuggestions: Suggestion[] = [
        query,
        `${query} 2024`,
        `${query} tutorial`,
        `${query} music`,
        `${query} highlights`,
        `${query} full video`,
        `${query} live`,
        `${query} new`,
      ]
        .filter((s, i) => i === 0 || s !== query)
        .slice(0, 8)
        .map((text) => ({ text, type: "query" as const }));

      setSuggestions(localSuggestions);

      // Fetch a couple of real video results to show thumbnails
      try {
        const result = await searchYouTubeVideos(query, 3);
        const videoSuggestions: Suggestion[] = result.videos.map((v) => ({
          text: v.title,
          thumbnail: v.thumbnail,
          type: "query",
        }));

        // Merge: text suggestions first, then video matches
        const merged: Suggestion[] = [
          ...localSuggestions.slice(0, 5),
          ...videoSuggestions,
        ];
        setSuggestions(merged);
      } catch {
        // keep local suggestions
      }

      setLoadingSuggestions(false);
    },
    []
  );

  // Debounce suggestion fetch
  useEffect(() => {
    if (!focused) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => buildSuggestions(searchQuery), 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, focused, buildSuggestions]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setFocused(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleFocus = () => {
    setFocused(true);
    buildSuggestions(searchQuery);
  };

  const commitSearch = (query: string) => {
    if (!query.trim()) return;
    saveRecent(query);
    onSearchChange(query);
    setFocused(false);
    setActiveIdx(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!focused || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && suggestions[activeIdx]) {
        commitSearch(suggestions[activeIdx].text);
      } else {
        commitSearch(searchQuery);
      }
    } else if (e.key === "Escape") {
      setFocused(false);
      setActiveIdx(-1);
      inputRef.current?.blur();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    commitSearch(activeIdx >= 0 ? suggestions[activeIdx].text : searchQuery);
  };

  const showDropdown = focused && suggestions.length > 0;

  return (
    <div className="flex items-center flex-1 max-w-2xl mx-2 md:mx-4 relative">
      <form onSubmit={handleSubmit} className="flex flex-1">
        {/* Input wrapper */}
        <div
          className={`flex flex-1 relative transition-all ${
            focused ? "ring-2 ring-blue-500 rounded-l-full" : ""
          }`}
        >
          {/* Search icon inside input when focused */}
          {focused && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <Search className="h-4 w-4" />
            </span>
          )}

          <input
            ref={inputRef}
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            className={`search-input flex-1 transition-all ${
              focused ? "pl-9 rounded-l-full border-blue-500" : ""
            } ${searchQuery ? "pr-8" : ""}`}
            autoComplete="off"
          />

          {/* Clear button */}
          {searchQuery && (
            <button
              type="button"
              onClick={() => { onSearchChange(""); inputRef.current?.focus(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded-full"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Search button */}
        <button
          type="submit"
          className={`search-button transition-all ${focused ? "border-blue-500/40" : ""}`}
        >
          <Search className="h-5 w-5" />
        </button>
      </form>

      {/* Mic button */}
      <button className="ml-2 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-secondary hover:bg-accent transition-colors">
        <Mic className="h-5 w-5" />
      </button>

      {/* ── Autocomplete dropdown ── */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-[calc(100%+6px)] left-0 right-12 bg-[#212121] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100]"
          style={{ minWidth: "100%" }}
        >
          <ul className="py-2">
            {suggestions.map((s, i) => (
              <li key={`${s.text}-${i}`}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()} // prevent blur before click
                  onClick={() => commitSearch(s.text)}
                  onMouseEnter={() => setActiveIdx(i)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    activeIdx === i ? "bg-white/10" : "hover:bg-white/5"
                  }`}
                >
                  {/* Left icon */}
                  <span className="flex-shrink-0 text-muted-foreground">
                    {s.type === "recent" ? (
                      <Clock className="h-4 w-4" />
                    ) : s.type === "trending" ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </span>

                  {/* Suggestion text — bold the matching prefix */}
                  <span className="flex-1 text-sm text-white truncate">
                    {searchQuery && s.text.toLowerCase().startsWith(searchQuery.toLowerCase()) ? (
                      <>
                        <span className="font-semibold">
                          {s.text.slice(0, searchQuery.length)}
                        </span>
                        <span className="text-white/70">
                          {s.text.slice(searchQuery.length)}
                        </span>
                      </>
                    ) : (
                      s.text
                    )}
                  </span>

                  {/* Thumbnail for video suggestions */}
                  {s.thumbnail && (
                    <img
                      src={s.thumbnail}
                      alt=""
                      className="flex-shrink-0 w-16 h-9 object-cover rounded-md"
                    />
                  )}

                  {/* Fill-in arrow for text suggestions */}
                  {!s.thumbnail && (
                    <button
                      type="button"
                      title="Fill in search"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSearchChange(s.text);
                        inputRef.current?.focus();
                      }}
                      className="flex-shrink-0 p-1 rounded-full hover:bg-white/10 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {/* North-west arrow (fill in) */}
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" style={{ transform: "rotate(225deg)" }}>
                        <path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                </button>
              </li>
            ))}
          </ul>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-white/10 flex justify-end">
            <span className="text-[11px] text-white/30 italic">Report search predictions</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
