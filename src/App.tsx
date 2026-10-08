import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Old marketing aliases and any unknown path land on the page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
