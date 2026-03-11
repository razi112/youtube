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
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

const mainItems = [
  { icon: Home, label: "Home", active: true },
  { icon: Compass, label: "Explore" },
  { icon: PlaySquare, label: "Subscriptions" },
];

const libraryItems = [
  { icon: PlaySquare, label: "Library" },
  { icon: Clock, label: "History" },
  { icon: ThumbsUp, label: "Liked videos" },
];

const exploreItems = [
  { icon: Flame, label: "Trending" },
  { icon: ShoppingBag, label: "Shopping" },
  { icon: Music2, label: "Music" },
  { icon: Film, label: "Movies" },
  { icon: Radio, label: "Live" },
  { icon: Gamepad2, label: "Gaming" },
  { icon: Newspaper, label: "News" },
  { icon: Trophy, label: "Sports" },
  { icon: Lightbulb, label: "Learning" },
  { icon: Shirt, label: "Fashion" },
];

const Sidebar = ({ isOpen }: SidebarProps) => {
  if (!isOpen) {
    return (
      <aside className="fixed left-0 top-14 bottom-0 w-[72px] bg-background overflow-y-auto scrollbar-hide py-2 hidden md:block">
        {mainItems.map((item) => (
          <div
            key={item.label}
            className={`flex flex-col items-center gap-1 py-4 px-1 cursor-pointer hover:bg-accent rounded-lg mx-1 ${
              item.active ? "bg-accent" : ""
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px]">{item.label}</span>
          </div>
        ))}
      </aside>
    );
  }

  return (
    <aside className="fixed left-0 top-14 bottom-0 w-60 bg-background overflow-y-auto scrollbar-hide py-3 px-3 hidden md:block">
      {/* Main */}
      <div className="mb-3">
        {mainItems.map((item) => (
          <div
            key={item.label}
            className={`sidebar-item cursor-pointer ${item.active ? "active" : ""}`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-sm">{item.label}</span>
          </div>
        ))}
      </div>

      <hr className="border-border my-3" />

      {/* Library */}
      <div className="mb-3">
        {libraryItems.map((item) => (
          <div key={item.label} className="sidebar-item cursor-pointer">
            <item.icon className="h-5 w-5" />
            <span className="text-sm">{item.label}</span>
          </div>
        ))}
      </div>

      <hr className="border-border my-3" />

      {/* Explore */}
      <div className="mb-3">
        <h3 className="px-3 mb-2 text-sm font-medium">Explore</h3>
        {exploreItems.map((item) => (
          <div key={item.label} className="sidebar-item cursor-pointer">
            <item.icon className="h-5 w-5" />
            <span className="text-sm">{item.label}</span>
          </div>
        ))}
      </div>

      <hr className="border-border my-3" />

      <div className="px-3 py-4 text-xs text-muted-foreground">
        <p className="mb-4">About Press Copyright Contact us Creators Advertise Developers</p>
        <p className="mb-4">Terms Privacy Policy & Safety How YouTube works Test new features</p>
        <p>© 2026 Google LLC</p>
      </div>
    </aside>
  );
};

export default Sidebar;
