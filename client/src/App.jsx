import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/public/HomePage";
import AboutPage from "./pages/public/AboutPage";
import ScrollToTop from "./components/common/ScrollToTop";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import FamilyDashboard from "./pages/family/FamilyDashboard";
import DeathAssistancePage from "./pages/family/DeathAssistancePage";

function App() {
  return (
    <BrowserRouter>
     <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/family/dashboard" element={<FamilyDashboard />} />
        <Route path="/family/death-assistance" element={<DeathAssistancePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;