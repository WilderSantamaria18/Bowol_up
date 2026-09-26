import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { CopilotProvider } from '@/features/copilot/context/CopilotContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ProtectedRoute, PublicOnlyRoute } from '@/app/router/ProtectedRoute';
import { RootLayout } from '@/layouts/RootLayout';
import { HomePage } from '@/pages/HomePage';

// Lazy-loaded routes for optimal initial bundle performance
const LoginPage = React.lazy(() => import('@/features/auth/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = React.lazy(() => import('@/features/auth/pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const SettingsPage = React.lazy(() => import('@/features/organization/pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const OnboardingPage = React.lazy(() => import('@/features/businessprofile/pages/OnboardingPage').then(m => ({ default: m.OnboardingPage })));
const BusinessProfilePage = React.lazy(() => import('@/features/businessprofile/pages/BusinessProfilePage').then(m => ({ default: m.BusinessProfilePage })));
const TrendsPage = React.lazy(() => import('@/features/trends/pages/TrendsPage').then(m => ({ default: m.TrendsPage })));
const SwotPage = React.lazy(() => import('@/features/swot/pages/SwotPage').then(m => ({ default: m.SwotPage })));
const OpportunitiesPage = React.lazy(() => import('@/features/opportunities/pages/OpportunitiesPage').then(m => ({ default: m.OpportunitiesPage })));
const HypothesesPage = React.lazy(() => import('@/features/hypotheses/pages/HypothesesPage').then(m => ({ default: m.HypothesesPage })));
const TaskBoardPage = React.lazy(() => import('@/features/tasks/pages/TaskBoardPage').then(m => ({ default: m.TaskBoardPage })));
const SprintsPage = React.lazy(() => import('@/features/sprints/pages/SprintsPage').then(m => ({ default: m.SprintsPage })));
const CalendarPage = React.lazy(() => import('@/features/calendar/pages/CalendarPage').then(m => ({ default: m.CalendarPage })));
const SocialPage = React.lazy(() => import('@/features/social/pages/SocialPage').then(m => ({ default: m.SocialPage })));
const DashboardPage = React.lazy(() => import('@/features/dashboard/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const BillingPage = React.lazy(() => import('@/features/billing/pages/BillingPage').then(m => ({ default: m.BillingPage })));
const AuditLogsPage = React.lazy(() => import('@/features/audit/pages/AuditLogsPage').then(m => ({ default: m.AuditLogsPage })));
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

const RouteLoadingFallback: React.FC = () => (
  <div className="min-h-[60vh] w-full flex flex-col items-center justify-center p-8">
    <div className="w-7 h-7 rounded-full border-2 border-orange-500/20 border-t-orange-500 animate-spin" />
    <span className="mt-3 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 tracking-widest uppercase">
      Cargando módulo...
    </span>
  </div>
);

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
      <ThemeProvider>
        <AuthProvider>
          <CopilotProvider>
            <BrowserRouter>
              <React.Suspense fallback={<RouteLoadingFallback />}>
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
                path="social"
                element={
                  <ProtectedRoute>
                    <SocialPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="brand"
                element={
                  <ProtectedRoute>
                    <SocialPage />
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
              <Route
                path="billing"
                element={
                  <ProtectedRoute>
                    <BillingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="audit-logs"
                element={
                  <ProtectedRoute>
                    <AuditLogsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </React.Suspense>
      </BrowserRouter>
      </CopilotProvider>
    </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);
};

export default App;
