import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfileWizardPage } from './pages/ProfileWizardPage';
import { DocumentVaultPage } from './pages/DocumentVaultPage';
import { SchemeExplorerPage } from './pages/SchemeExplorerPage';
import { SchemeDetailPage } from './pages/SchemeDetailPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { ApplicationTrackerPage } from './pages/ApplicationTrackerPage';
import { AdminPortalPage } from './pages/AdminPortalPage';
import { PrivacyTermsPage } from './pages/PrivacyTermsPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({
  children,
  adminOnly = false,
}) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-xs text-slate-400">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const [assistantOpen, setAssistantOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar onOpenAssistant={() => setAssistantOpen(true)} />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/schemes" element={<SchemeExplorerPage />} />
          <Route path="/schemes/:id" element={<SchemeDetailPage />} />
          <Route path="/privacy-terms" element={<PrivacyTermsPage />} />

          {/* Citizen Protected Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileWizardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <DocumentVaultPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommendations"
            element={
              <ProtectedRoute>
                <RecommendationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <ProtectedRoute>
                <ApplicationTrackerPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminPortalPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      {/* Global AI Scheme Assistant Drawer */}
      <AiAssistantDrawer
        isOpen={assistantOpen}
        onClose={() => setAssistantOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
