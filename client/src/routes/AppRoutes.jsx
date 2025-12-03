import { Routes, Route } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProtectedRoute from '../components/ProtectedRoute';
import ResponsiveNestedSidebar from '../components/ResponsiveNestedSidebar';
import { useAuth } from '../context/AuthContext'; // example: your auth context

// Public Pages
import Home from '../pages/Home';
import ArticleDetail from '../pages/ArticleDetail';
import Login from '../pages/Login';
import Register from '../pages/Register';

// Journalist Pages
import JournalistDashboard from '../pages/Journalist/JournalistDashboard';
import MyArticles from '../pages/Journalist/MyArticles';
import CreateArticle from '../pages/Journalist/CreateArticle';

// Editor Pages
import EditorDashboard from '../pages/Editor/EditorDashboard';
import ReviewArticles from '../pages/Editor/ReviewArticles';

// Admin Pages
import AdminPublishPanel from '../pages/Admin/AdminPublishPanel';
import AdminUsersPanel from '../pages/Admin/AdminUsersPanel';

function AppRoutes() {
  const { user } = useAuth(); // user.role should exist

  return (
    <div className="flex min-h-screen">
      {/* Show ResponsiveNestedSidebar only for logged-in users */}
      {user && <ResponsiveNestedSidebar role={user.role} />}

      <div className="flex-1 flex flex-col md:ml-64">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/article/:id" element={<ArticleDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Journalist Routes */}
            <Route
              path="/journalist"
              element={
                <ProtectedRoute requiredRole={['journalist', 'admin']}>
                  <JournalistDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/journalist/my-articles"
              element={
                <ProtectedRoute requiredRole={['journalist', 'admin']}>
                  <MyArticles />
                </ProtectedRoute>
              }
            />
            <Route
              path="/journalist/create-article"
              element={
                <ProtectedRoute requiredRole={['journalist', 'admin']}>
                  <CreateArticle />
                </ProtectedRoute>
              }
            />

            {/* Editor Routes */}
            <Route
              path="/editor"
              element={
                <ProtectedRoute requiredRole={['editor', 'admin']}>
                  <EditorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editor/review-articles"
              element={
                <ProtectedRoute requiredRole={['editor', 'admin']}>
                  <ReviewArticles />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/publish"
              element={
                <ProtectedRoute requiredRole={['admin']}>
                  <AdminPublishPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRole={['admin']}>
                  <AdminUsersPanel />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default AppRoutes;
