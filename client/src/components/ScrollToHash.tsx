import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToHash = () => {
  const location = useLocation();
  const { hash, pathname } = location;

  useEffect(() => {
    const targetId = hash.replace("#", "") || (pathname === "/noticias" ? "noticias" : "");
    if (!targetId) return;

    const target = document.getElementById(targetId);

    if (!target) return;

    const frame = window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [hash, pathname]);

  return null;
};

export default ScrollToHash;
