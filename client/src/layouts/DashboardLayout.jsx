// src/layouts/DashboardLayout.jsx
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ResponsiveNestedSidebar from "../components/ResponsiveNestedSidebar";
import { useAuth } from "../context/AuthContext";

const DashboardLayout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Navbar spans full width */}
      <Navbar />

      <div className="flex flex-1">
        {/* Sidebar below navbar */}
        {user && (
          <div className="hidden md:block">
            <ResponsiveNestedSidebar role={user.role} />
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default DashboardLayout;
