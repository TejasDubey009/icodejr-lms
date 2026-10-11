import { useEffect } from "react";
import LandingPage from "@/pages/LandingPage";
import { MotionProvider } from "@/motion";

export default function App() {
  // One page: old marketing aliases (/pricing, /demo, …) and unknown paths settle on "/".
  useEffect(() => {
    if (window.location.pathname !== "/") {
      window.history.replaceState(null, "", "/" + window.location.search + window.location.hash);
    }
  }, []);

  return (
    <MotionProvider>
      <LandingPage />
    </MotionProvider>
  );
}
