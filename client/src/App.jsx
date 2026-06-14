import { Navigate, Route, Routes } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Toaster } from "react-hot-toast";
import LandingPage from "./pages/LandingPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import GeneratorPage from "./pages/GeneratorPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import ProjectDetailsPage from "./pages/ProjectDetailsPage.jsx";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";
import ComparePage from "./pages/ComparePage.jsx";
import SharedProjectPage from "./pages/SharedProjectPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import React from 'react';

function ProtectedRoute({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <Navigate to="/sign-in" replace />
      </SignedOut>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-in" element={<AuthPage mode="sign-in" />} />
        <Route path="/sign-up" element={<AuthPage mode="sign-up" />} />
        <Route path="/share/:shareId" element={<SharedProjectPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="generator" element={<GeneratorPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="history/:id" element={<ProjectDetailsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="compare" element={<ComparePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </ThemeProvider>
  );
}
