import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import GuestsPage from "./pages/GuestsPage";
import WebsiteEditor from "./pages/WebsiteEditor";
import AdminDashboard from "./pages/AdminDashboard";
import WeddingWebsite from "./pages/WeddingWebsite";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AuthRedirect = () => {
  const { user, role, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Login />;
  if (role === "admin") return <Navigate to="/admin" replace />;
  return <Navigate to="/dashboard" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<AuthRedirect />} />

            {/* Couple Dashboard */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/guests" element={<ProtectedRoute><GuestsPage /></ProtectedRoute>} />
            <Route path="/dashboard/website" element={<ProtectedRoute><WebsiteEditor /></ProtectedRoute>} />
            <Route path="/dashboard/seating" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/registry" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/settings" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/create" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/packages" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />

            {/* Public Wedding Website */}
            <Route path="/w/:slug" element={<WeddingWebsite />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
