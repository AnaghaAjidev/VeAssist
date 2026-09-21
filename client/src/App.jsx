import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/public/HomePage";
import AboutPage from "./pages/public/AboutPage";
import ScrollToTop from "./components/common/ScrollToTop";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import FamilyDashboard from "./pages/family/FamilyDashboard";
import DocumentsPage from "./pages/family/DocumentsPage";
import DeathAssistancePage from "./pages/family/DeathAssistancePage";
import OfficerDashboard from "./pages/officer/OfficerDashboard";
import OfficerCaseDetails from "./pages/officer/OfficerCaseDetails";
import ApplicationsPage from "./pages/family/ApplicationsPage";
import CreateApplicationPage from "./pages/family/CreateApplicationPage";
import OfficerApplications from "./pages/officer/OfficerApplications";
import OfficerApplicationDetails from "./pages/officer/OfficerApplicationDetails";
import ApplicationDocumentsPage from "./pages/family/ApplicationDocumentsPage";
import AuthorityDashboard from "./pages/authority/AuthorityDashboard";
import AuthorityApplicationDetails from "./pages/authority/AuthorityApplicationDetails";

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
        <Route path="/family/documents" element={<DocumentsPage />} />
        <Route path="/family/death-assistance" element={<DeathAssistancePage />} />
        <Route path="/officer/dashboard" element={<OfficerDashboard />} />
        <Route path="/officer/cases/:caseId" element={<OfficerCaseDetails />} />
        <Route path="/family/applications" element={<ApplicationsPage />} />
        <Route path="/family/applications/new/:caseId" element={<CreateApplicationPage />} />
        <Route path="/family/applications/:applicationId/documents" element={<ApplicationDocumentsPage />} />
        <Route path="/officer/applications" element={<OfficerApplications />} />
        <Route path="/officer/applications/:applicationId" element={<OfficerApplicationDetails />} />
        <Route path="/authority/dashboard" element={<AuthorityDashboard />} />
        <Route path="/authority/applications/:applicationId" element={<AuthorityApplicationDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;