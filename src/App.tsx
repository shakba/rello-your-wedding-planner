import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import GuestsPage from "./pages/GuestsPage";
import WebsiteEditor from "./pages/WebsiteEditor";
import AdminDashboard from "./pages/AdminDashboard";
import WeddingWebsite from "./pages/WeddingWebsite";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/guests"
              element={
                <ProtectedRoute>
                  <GuestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/rsvps"
              element={
                <ProtectedRoute>
                  <GuestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/website"
              element={
                <ProtectedRoute>
                  <WebsiteEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/seating"
              element={
                <ProtectedRoute>
                  <ComingSoon
                    variant="couple"
                    title="תכנון ישיבה"
                    description="אנחנו בונים מחדש את כלי הישיבה עם חוויית גרירה חדשה."
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/registry"
              element={
                <ProtectedRoute>
                  <ComingSoon
                    variant="couple"
                    title="רשימת מתנות"
                    description="ממשק חדש לרשימת המתנות יעלה בקרוב כחלק מהבנייה מחדש."
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/settings"
              element={
                <ProtectedRoute>
                  <ComingSoon
                    variant="couple"
                    title="הגדרות"
                    description="מסך הגדרות חדש יתווסף בסבב הבא."
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/create"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/packages"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ComingSoon
                    variant="admin"
                    title="ניהול חבילות"
                    description="מסך חבילות חדש נבנה מחדש כרגע."
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ComingSoon
                    variant="admin"
                    title="הגדרות מערכת"
                    description="הגדרות המערכת יתווספו במבנה החדש."
                  />
                </ProtectedRoute>
              }
            />

            <Route path="/w/:slug" element={<WeddingWebsite />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
