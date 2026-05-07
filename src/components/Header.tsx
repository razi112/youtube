import { useState } from "react";
import { Menu, UserCircle2, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SignInModal from "@/components/SignInModal";
import SearchBar from "@/components/SearchBar";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  onMenuClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const Header = ({ onMenuClick, searchQuery, onSearchChange }: HeaderProps) => {
  const [showSignIn, setShowSignIn] = useState(false);
  const { user, loading, signOut } = useAuth();

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const displayName = (user?.user_metadata?.full_name as string) ?? user?.email ?? "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-14 bg-background z-50 flex items-center justify-between px-2 md:px-4">

        {/* Left — logo */}
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
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
                <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
              </svg>
            </div>
            <span className="text-xl font-semibold tracking-tight hidden sm:inline">ADØ</span>
          </a>
        </div>

        {/* Center — search bar with autocomplete */}
        <SearchBar searchQuery={searchQuery} onSearchChange={onSearchChange} />

        {/* Right — auth */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {loading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback className="text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span className="font-medium truncate">{displayName}</span>
                  <span className="text-xs text-muted-foreground font-normal truncate">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  Your channel
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={signOut}
                  className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowSignIn(true)}
              className="flex items-center gap-2 rounded-full border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 px-3 h-9"
            >
              <UserCircle2 className="h-5 w-5" />
              <span className="hidden sm:inline text-sm font-medium">Sign in</span>
            </Button>
          )}
        </div>
      </header>

      <SignInModal open={showSignIn} onClose={() => setShowSignIn(false)} />
    </>
  );
};

export default Header;
