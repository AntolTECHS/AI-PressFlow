import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ResponsiveNestedSidebar from "./ResponsiveNestedSidebar";
import { useAuth } from "../context/AuthContext";

const DashboardLayout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Navbar full width */}
      <Navbar />

      <div className="flex flex-1">
        {/* Sidebar below Navbar */}
        {user && (
          <div className="hidden md:block w-64">
            <ResponsiveNestedSidebar role={user.role} />
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 p-6">{children}</main>
      </div>

      <Footer />
    </div>
  );
};

export default DashboardLayout;
