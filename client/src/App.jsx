// src/App.jsx
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mx-auto p-4">
        <AppRoutes />
      </div>
    </Router>
  );
}

export default App;
