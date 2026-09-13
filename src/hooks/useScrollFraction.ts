import { useEffect, useState } from "react";

// Returns how far the user has scrolled through the whole document, 0 to 1.
export function useScrollFraction() {
  const [fraction, setFraction] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollableHeight = docHeight - winHeight;

      if (scrollableHeight <= 0) {
        setFraction(0);
        return;
      }

      setFraction(Math.min(1, Math.max(0, scrollTop / scrollableHeight)));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return fraction;
}
