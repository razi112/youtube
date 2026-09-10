import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const categories = [
  "All",
  "Music",
  "Gaming",
  "Live",
  "React",
  "Programming",
  "News",
  "Cooking",
  "Sports",
  "Fashion",
  "Comedy",
  "Podcasts",
  "Recently uploaded",
  "Watched",
  "New to you",
];

interface CategoryChipsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryChips = ({ activeCategory, onCategoryChange }: CategoryChipsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
    }
  };

  return (
    <div className="flex items-center gap-1 sticky top-14 z-40 py-3"
      style={{
        background: "rgba(10, 9, 20, 0.5)",
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <button
        onClick={() => scroll("left")}
        className="hidden md:flex shrink-0 items-center justify-center h-8 w-8 rounded-full hover:bg-accent"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide flex-1">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`chip ${activeCategory === category ? "active" : ""}`}
          >
            {category}
          </button>
        ))}
      </div>
      <button
        onClick={() => scroll("right")}
        className="hidden md:flex shrink-0 items-center justify-center h-8 w-8 rounded-full hover:bg-accent"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default CategoryChips;
