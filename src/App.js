import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Navbar from "./components/Navbar"; // 👈 ADD THIS

function App() {
  return (
    <Router>
      <Navbar />  {/* 👈 SHOW NAVBAR EVERYWHERE */}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;