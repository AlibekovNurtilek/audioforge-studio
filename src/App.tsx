import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Categories from "./pages/Categories";
import Books from "./pages/Books";
import BookChunks from "./pages/BookChunks";
import Assignments from "./pages/Assignments";
import SpeakerBooks from "./pages/SpeakerBooks";
import RecordBook from "./pages/RecordBook";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      
      {/* Admin Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Categories />
          </ProtectedRoute>
        }
      />
      <Route
        path="/books"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Books />
          </ProtectedRoute>
        }
      />
      <Route
        path="/books/:bookId/chunks"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <BookChunks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assignments"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Assignments />
          </ProtectedRoute>
        }
      />

      {/* Speaker Routes */}
      <Route
        path="/"
        element={
          user?.role === "speaker" ? (
            <ProtectedRoute allowedRoles={["speaker"]}>
              <SpeakerBooks />
            </ProtectedRoute>
          ) : null
        }
      />
      <Route
        path="/record/:bookId"
        element={
          <ProtectedRoute allowedRoles={["speaker"]}>
            <RecordBook />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
