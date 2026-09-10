import { useState } from "react";
import { Menu, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SignInModal from "@/components/SignInModal";
import AccountPanel from "@/components/AccountPanel";
import SearchBar from "@/components/SearchBar";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  onMenuClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const Header = ({ onMenuClick, searchQuery, onSearchChange }: HeaderProps) => {
  const [showSignIn, setShowSignIn]     = useState(false);
  const [showAccount, setShowAccount]   = useState(false);
  const { user, loading } = useAuth();

  const avatarUrl   = user?.user_metadata?.avatar_url as string | undefined;
  const displayName = (user?.user_metadata?.full_name as string) ?? user?.email ?? "User";
  const initials    = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-2 sm:px-3 md:px-4 gap-2"
        style={{
          background:           "rgba(10, 9, 20, 0.55)",
          backdropFilter:       "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          borderBottom:         "1px solid rgba(255,255,255,0.08)",
          boxShadow:            "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Left — hamburger + logo */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-9 w-9 flex-shrink-0"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <a href="/" className="flex items-center flex-shrink-0">
            <span className="text-base sm:text-lg md:text-xl font-semibold tracking-tight">
              ADØ
            </span>
          </a>
        </div>

        {/* Center — search */}
        <SearchBar searchQuery={searchQuery} onSearchChange={onSearchChange} />

        {/* Right — auth */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {loading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            /* ── Avatar → opens AccountPanel ── */
            <button
              onClick={() => setShowAccount(true)}
              className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-transform hover:scale-105 active:scale-95"
              title="Account settings"
            >
              <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-white/10 hover:ring-white/30 transition-all">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-purple-500 to-red-500 text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          ) : (
            /* ── Sign-in pill ── */
            <Button
              variant="outline"
              onClick={() => setShowSignIn(true)}
              className="flex items-center gap-1.5 rounded-full px-2 sm:px-3 h-8 sm:h-9 text-xs sm:text-sm text-white/90 hover:text-white transition-all"
              style={{
                background:           "rgba(255,255,255,0.08)",
                border:               "1px solid rgba(255,255,255,0.18)",
                backdropFilter:       "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow:            "0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              <UserCircle2 className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="hidden sm:inline font-medium">Sign in</span>
            </Button>
          )}
        </div>
      </header>

      {/* Modals / panels */}
      <SignInModal  open={showSignIn}   onClose={() => setShowSignIn(false)} />
      <AccountPanel
        open={showAccount}
        onClose={() => setShowAccount(false)}
        onSignIn={() => { setShowAccount(false); setShowSignIn(true); }}
      />
    </>
  );
};

export default Header;
