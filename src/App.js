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
import Staffdashboard from "./pages/Staffdashboard";
import ReceptionDesk from "./pages/ReceptionDesk";
import QueueDisplay from "./pages/QueueDisplay";
import Store from "./pages/Store";
import MyOrders from "./pages/MyOrders";
import NoticeBar from "./components/NoticeBar";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";
import Appointment from "./components/Appointment";
import ErrorBoundary from "./components/ErrorBoundary";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";



function App() {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <Router>
      <NoticeBar />
      <Navbar />
      <Chatbot />

      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/store" element={<Store />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/staff" element={<Staffdashboard />} />
          <Route path="/reception" element={<ReceptionDesk />} />
          <Route path="/queue-display" element={<QueueDisplayPage />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </ErrorBoundary>

      <Footer />
    </Router>
  );
}

export default App;