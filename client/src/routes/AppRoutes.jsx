// AppRoutes.jsx
import { Routes, Route } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProtectedRoute from '../components/ProtectedRoute';
import Home from '../pages/Home';
import ArticleDetail from '../pages/ArticleDetail';
import Login from '../pages/Login';
import Register from '../pages/Register';
import EditorDashboard from '../pages/EditorDashboard';

function AppRoutes() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/editor"
            element={
              <ProtectedRoute requiredRole={['editor', 'admin']}>
                <EditorDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default AppRoutes;
