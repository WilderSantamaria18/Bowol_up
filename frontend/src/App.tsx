import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { CopilotProvider } from '@/features/copilot/context/CopilotContext';
import { ProtectedRoute, PublicOnlyRoute } from '@/app/router/ProtectedRoute';
import { RootLayout } from '@/layouts/RootLayout';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { SettingsPage } from '@/features/organization/pages/SettingsPage';
import { OnboardingPage } from '@/features/businessprofile/pages/OnboardingPage';
import { BusinessProfilePage } from '@/features/businessprofile/pages/BusinessProfilePage';
import { TrendsPage } from '@/features/trends/pages/TrendsPage';
import { SwotPage } from '@/features/swot/pages/SwotPage';
import { OpportunitiesPage } from '@/features/opportunities/pages/OpportunitiesPage';
import { HypothesesPage } from '@/features/hypotheses/pages/HypothesesPage';
import { TaskBoardPage } from '@/features/tasks/pages/TaskBoardPage';
import { SprintsPage } from '@/features/sprints/pages/SprintsPage';
import { CalendarPage } from '@/features/calendar/pages/CalendarPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CopilotProvider>
          <BrowserRouter>
            <Routes>
            <Route path="/" element={<RootLayout />}>
              <Route index element={<HomePage />} />
              <Route
                path="login"
                element={
                  <PublicOnlyRoute>
                    <LoginPage />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="register"
                element={
                  <PublicOnlyRoute>
                    <RegisterPage />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="onboarding"
                element={
                  <ProtectedRoute>
                    <OnboardingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="business-profile"
                element={
                  <ProtectedRoute>
                    <BusinessProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="trends"
                element={
                  <ProtectedRoute>
                    <TrendsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="swot"
                element={
                  <ProtectedRoute>
                    <SwotPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="opportunities"
                element={
                  <ProtectedRoute>
                    <OpportunitiesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="hypotheses"
                element={
                  <ProtectedRoute>
                    <HypothesesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="experiments"
                element={
                  <ProtectedRoute>
                    <HypothesesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="tasks"
                element={
                  <ProtectedRoute>
                    <TaskBoardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="projects"
                element={
                  <ProtectedRoute>
                    <TaskBoardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="sprints"
                element={
                  <ProtectedRoute>
                    <SprintsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="calendar"
                element={
                  <ProtectedRoute>
                    <CalendarPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CopilotProvider>
    </AuthProvider>
  </QueryClientProvider>
);
};

export default App;
