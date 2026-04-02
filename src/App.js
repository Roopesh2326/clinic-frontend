import React from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import {useEffect} from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Admin from "./pages/Admin";
import UserDashboard from "./pages/UserDashboard";
import Cart from "./pages/Cart";
import Store from "./pages/Store";
import NoticeBar from "./components/NoticeBar";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";
import Appointment from "./components/Appointment";
import Signup from "./pages/Signup";
import Login from "./pages/Login";



function App() {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <Router>
      <NoticeBar />
      <Navbar />
      <Chatbot />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/store" element={<Store />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/appointment" element={<Appointment />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;