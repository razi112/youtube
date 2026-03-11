import { Search, Mic, Video, Bell, Menu, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const Header = ({ onMenuClick, searchQuery, onSearchChange }: HeaderProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-background z-50 flex items-center justify-between px-2 md:px-4">
      {/* Left section */}
      <div className="flex items-center gap-2 md:gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hidden md:flex"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <a href="/" className="flex items-center gap-1">
          <div className="bg-primary rounded-lg p-1.5">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary-foreground fill-current">
              <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/>
            </svg>
          </div>
          <span className="text-xl font-semibold tracking-tight hidden sm:inline">YouTube</span>
        </a>
      </div>

      {/* Center section - Search */}
      <form onSubmit={handleSubmit} className="flex items-center flex-1 max-w-2xl mx-2 md:mx-4">
        <div className="flex flex-1 relative">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input flex-1 pr-8"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-14 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded-full"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          <button type="submit" className="search-button">
            <Search className="h-5 w-5" />
          </button>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full ml-2 hidden sm:flex">
          <Mic className="h-5 w-5" />
        </Button>
      </form>

      {/* Right section */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="rounded-full hidden sm:flex">
          <Video className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full hidden sm:flex">
          <Bell className="h-5 w-5" />
        </Button>
        <Avatar className="h-8 w-8 ml-1 md:ml-2 cursor-pointer">
          <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default Header;
