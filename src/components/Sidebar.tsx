import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Compass,
  PlaySquare,
  Clock,
  ThumbsUp,
  Flame,
  ShoppingBag,
  Music2,
  Film,
  Radio,
  Gamepad2,
  Newspaper,
  Trophy,
  Lightbulb,
  Shirt,
  Clapperboard,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

// Custom Clips icon — two overlapping film frames
const ClipsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="14" height="12" rx="2" />
    <path d="M16 10l4-2v8l-4-2" />
    <line x1="6" y1="6" x2="6" y2="2" />
    <line x1="10" y1="6" x2="10" y2="2" />
  </svg>
);

const mainItems = [
  { icon: Home, label: "Home", section: "Home", path: "/" },
  { icon: ClipsIcon, label: "Clips", section: "Clips", path: "/clips" },
  { icon: Compass, label: "Explore", section: "Trending", path: "/" },
  { icon: PlaySquare, label: "Subscriptions", section: "Subscriptions", path: "/" },
];

const libraryItems = [
  { icon: PlaySquare, label: "Library", section: "Library", path: "/" },
  { icon: Clock, label: "History", section: "History", path: "/" },
  { icon: ThumbsUp, label: "Liked videos", section: "Liked videos", path: "/" },
];

const exploreItems = [
  { icon: Flame, label: "Trending", section: "Trending", path: "/" },
  { icon: ShoppingBag, label: "Shopping", section: "Shopping", path: "/" },
  { icon: Music2, label: "Music", section: "Music", path: "/" },
  { icon: Film, label: "Movies", section: "Movies", path: "/" },
  { icon: Radio, label: "Live", section: "Live", path: "/" },
  { icon: Gamepad2, label: "Gaming", section: "Gaming", path: "/" },
  { icon: Newspaper, label: "News", section: "News", path: "/" },
  { icon: Trophy, label: "Sports", section: "Sports", path: "/" },
  { icon: Lightbulb, label: "Learning", section: "Learning", path: "/" },
  { icon: Shirt, label: "Fashion", section: "Fashion", path: "/" },
];

const Sidebar = ({ isOpen, activeSection, onSectionChange }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (item: { section: string; path: string }) => {
    onSectionChange(item.section);
    navigate(item.path);
  };

  const isActive = (item: { section: string; path: string }) => {
    if (item.path === "/clips") return location.pathname === "/clips";
    return activeSection === item.section && location.pathname !== "/clips";
  };

  if (!isOpen) {
    return (
      <aside className="fixed left-0 top-14 bottom-0 w-[72px] bg-background overflow-y-auto scrollbar-hide py-2 hidden md:block z-40">
        {mainItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleClick(item)}
            className={`w-full flex flex-col items-center gap-1 py-4 px-1 hover:bg-accent rounded-lg mx-1 transition-colors ${
              isActive(item) ? "bg-accent font-semibold" : ""
            }`}
          >
            {item.label === "Clips" ? (
              <div className="relative">
                <item.icon className="h-5 w-5" />
                <span className="absolute -top-1 -right-2 text-[7px] font-black text-primary leading-none">ADØ</span>
              </div>
            ) : (
              <item.icon className="h-5 w-5" />
            )}
            <span className="text-[10px]">{item.label}</span>
          </button>
        ))}
      </aside>
    );
  }

  return (
    <aside className="fixed left-0 top-14 bottom-0 w-60 bg-background overflow-y-auto scrollbar-hide py-3 px-3 hidden md:block z-40">
      {/* Main */}
      <div className="mb-3">
        {mainItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleClick(item)}
            className={`sidebar-item w-full transition-colors ${
              isActive(item) ? "active" : ""
            }`}
          >
            <div className="relative flex-shrink-0">
              <item.icon className="h-5 w-5" />
              {item.label === "Clips" && (
                <span className="absolute -top-1.5 -right-3 text-[8px] font-black text-primary leading-none">ADØ</span>
              )}
            </div>
            <span className="text-sm">{item.label}</span>
            {item.label === "Clips" && (
              <span className="ml-auto text-[10px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full leading-none">
                NEW
              </span>
            )}
          </button>
        ))}
      </div>

      <hr className="border-border my-3" />

      {/* You */}
      <div className="mb-3">
        <h3 className="px-3 mb-2 text-sm font-medium">You</h3>
        {libraryItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleClick(item)}
            className={`sidebar-item w-full transition-colors ${
              isActive(item) ? "active" : ""
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </div>

      <hr className="border-border my-3" />

      {/* Explore */}
      <div className="mb-3">
        <h3 className="px-3 mb-2 text-sm font-medium">Explore</h3>
        {exploreItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleClick(item)}
            className={`sidebar-item w-full transition-colors ${
              isActive(item) ? "active" : ""
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </div>

      <hr className="border-border my-3" />

      <div className="px-3 py-4 text-xs text-muted-foreground">
        <p className="mb-4">About Press Copyright Contact us Creators Advertise Developers</p>
        <p className="mb-4">Terms Privacy Policy & Safety How ADØ works Test new features</p>
        <p>© 2026 ADØ LLC</p>
      </div>
    </aside>
  );
};

export default Sidebar;
