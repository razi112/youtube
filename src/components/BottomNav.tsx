import { Home, Compass, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

interface BottomNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

// Custom Clips icon
const ClipsIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="6" width="14" height="12" rx="2" />
    <path d="M16 10l4-2v8l-4-2" />
    <line x1="6" y1="6" x2="6" y2="2" />
    <line x1="10" y1="6" x2="10" y2="2" />
  </svg>
);

const navItems = [
  { icon: Home,      label: "Home",    section: "Home",     path: "/" },
  { icon: ClipsIcon, label: "Clips",   section: "Clips",    path: "/clips" },
  { icon: Compass,   label: "Explore", section: "Trending", path: "/" },
  { icon: User,      label: "You",     section: "History",  path: "/" },
];

const BottomNav = ({ activeSection, onSectionChange }: BottomNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide on watch page
  if (location.pathname === "/watch") return null;

  const handleClick = (item: (typeof navItems)[0]) => {
    onSectionChange(item.section);
    navigate(item.path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden safe-area-inset-bottom">
      <div className="flex items-center justify-around py-1 pb-safe">
        {navItems.map((item) => {
          const isActive =
            item.path === "/clips"
              ? location.pathname === "/clips"
              : activeSection === item.section && location.pathname !== "/clips";

          return (
            <button
              key={item.label}
              onClick={() => handleClick(item)}
              className={`flex flex-col items-center gap-0.5 py-2 px-5 text-[11px] transition-colors relative ${
                isActive
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              <div className="relative">
                <item.icon
                  className={`h-[22px] w-[22px] ${isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`}
                />
                {item.label === "Clips" && (
                  <span className="absolute -top-1.5 -right-3 text-[7px] font-black text-primary leading-none">
                    ADØ
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
