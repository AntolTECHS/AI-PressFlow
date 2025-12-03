import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";

// Layout
import DashboardLayout from "../layouts/DashboardLayout";

// Public Pages
import Home from "../pages/Home";
import ArticleDetail from "../pages/ArticleDetail";
import Login from "../pages/Login";
import Register from "../pages/Register";

// Journalist Pages
import JournalistDashboard from "../pages/Journalist/JournalistDashboard";
import MyArticles from "../pages/Journalist/MyArticles";
import CreateArticle from "../pages/Journalist/CreateArticle";

// Editor Pages
import EditorDashboard from "../pages/Editor/EditorDashboard";
import ReviewArticles from "../pages/Editor/ReviewArticles";

// Admin Pages
import AdminPublishPanel from "../pages/Admin/AdminPublishPanel";
import AdminUsersPanel from "../pages/Admin/AdminUsersPanel";

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Homepage */}
      <Route
        path="/"
        element={
          user ? (
            <DashboardLayout>
              <Home />
            </DashboardLayout>
          ) : (
            <Home />
          )
        }
      />

      {/* Article Details (public) */}
      <Route path="/article/:id" element={<Home />} />

      {/* Login / Register */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Journalist Routes */}
      <Route
        path="/journalist"
        element={
          <ProtectedRoute requiredRole={["journalist", "admin"]}>
            <DashboardLayout>
              <JournalistDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/journalist/my-articles"
        element={
          <ProtectedRoute requiredRole={["journalist", "admin"]}>
            <DashboardLayout>
              <MyArticles />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/journalist/create-article"
        element={
          <ProtectedRoute requiredRole={["journalist", "admin"]}>
            <DashboardLayout>
              <CreateArticle />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Editor Routes */}
      <Route
        path="/editor"
        element={
          <ProtectedRoute requiredRole={["editor", "admin"]}>
            <DashboardLayout>
              <EditorDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/editor/review-articles"
        element={
          <ProtectedRoute requiredRole={["editor", "admin"]}>
            <DashboardLayout>
              <ReviewArticles />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/publish"
        element={
          <ProtectedRoute requiredRole={["admin"]}>
            <DashboardLayout>
              <AdminPublishPanel />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requiredRole={["admin"]}>
            <DashboardLayout>
              <AdminUsersPanel />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
