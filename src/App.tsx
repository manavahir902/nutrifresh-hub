import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute, UnauthorizedPage } from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import NutritionDashboard from "./pages/NutritionDashboard";
import AISuggestions from "./pages/AISuggestions";
import MealPlans from "./pages/MealPlans";
import { TeacherDashboard } from "./pages/TeacherDashboard";
import { AdminPanel } from "./pages/AdminPanel";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { StudentNotifications } from "./components/student/StudentNotifications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary>
            <div className="min-h-screen flex flex-col">
              <Navigation />
              <main className="flex-1">
                <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                
                {/* Protected routes - require authentication */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/nutrition" element={
                  <ProtectedRoute>
                    <NutritionDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/ai-suggestions" element={
                  <ProtectedRoute>
                    <AISuggestions />
                  </ProtectedRoute>
                } />
                <Route path="/meal-plans" element={
                  <ProtectedRoute>
                    <MealPlans />
                  </ProtectedRoute>
                } />
                <Route path="/notifications" element={
                  <ProtectedRoute>
                    <StudentNotifications />
                  </ProtectedRoute>
                } />
                
                {/* Role-based protected routes */}
                <Route path="/teacher" element={
                  <ProtectedRoute requiredRole="teacher">
                    <TeacherDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminPanel />
                  </ProtectedRoute>
                } />
                
                {/* Error pages */}
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              </main>
              <Footer />
            </div>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
