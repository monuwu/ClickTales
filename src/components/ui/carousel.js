import * as React from "react";
import { cn } from "../../lib/utils";

export function Carousel({ children, className, ...props }) {
  const containerRef = React.useRef(null);

  const scroll = (direction) => {
    if (containerRef.current) {
      const scrollAmount = 300;
      containerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className={cn("relative w-full", className)} {...props}>
      <button
        type="button"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-indigo-200 text-indigo-600 rounded-full p-2 shadow transition"
        onClick={() => scroll("left")}
        aria-label="Scroll left"
      >
        &#8592;
      </button>
      <div
        ref={containerRef}
        className="flex overflow-x-auto space-x-4 py-4 scrollbar-hide scroll-smooth"
      >
        {children}
      </div>
      <button
        type="button"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-indigo-200 text-indigo-600 rounded-full p-2 shadow transition"
        onClick={() => scroll("right")}
        aria-label="Scroll right"
      >
        &#8594;
      </button>
    </div>
  );
}