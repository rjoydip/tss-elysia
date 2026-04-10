import { useState, useEffect } from "react";

/**
 * Custom hook to detect scroll direction and scroll position.
 * Returns true if the header should be visible, false otherwise.
 */
export function useScrollDirection() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show header at the top of the page
      if (currentScrollY < 10) {
        setIsVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      // Hide header when scrolling down, show when scrolling up
      // Add a small threshold (5px) to prevent flickering
      if (Math.abs(currentScrollY - lastScrollY) > 5) {
        setIsVisible(currentScrollY < lastScrollY);
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return isVisible;
}