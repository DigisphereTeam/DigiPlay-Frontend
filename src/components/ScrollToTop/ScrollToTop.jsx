import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    setTimeout(() => {
      const scrollContainer = document.querySelector(
        ".app-layout-scroll-content",
      );

      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
      }
    }, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;