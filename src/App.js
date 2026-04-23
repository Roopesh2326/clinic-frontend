import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  BrowserRouter as Router,
  Routes, Route,
  useLocation, Navigate,
} from "react-router-dom";

import Navbar        from "./components/Navbar";
import Footer        from "./components/Footer";
import NoticeBar     from "./components/NoticeBar";
import Chatbot       from "./components/Chatbot";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";

import Home          from "./pages/Home";
import Store         from "./pages/Store";
import Admin         from "./pages/Admin";
import UserDashboard from "./pages/UserDashboard";
import Staffdashboard from "./pages/Staffdashboard";
import Receptiondesk from "./pages/Receptiondesk";
import QueueDisplay  from "./pages/QueueDisplay";
import MyOrders      from "./pages/MyOrders";
import Cart          from "./pages/Cart";
import Appointment   from "./components/Appointment";
import Signup        from "./pages/Signup";
import Login         from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound      from "./pages/NotFound"; // we'll create this

function AppContent() {
  const location = useLocation();

  const hideShell =
    location.pathname.startsWith("/dashboard")  ||
    location.pathname.startsWith("/admin")      ||
    location.pathname.startsWith("/staff")      ||
    location.pathname.startsWith("/reception");

  return (
    <>
      <NoticeBar />
      {!hideShell && <Navbar />}
      <Chatbot />
      <ErrorBoundary>
        <Routes>

          {/* ── PUBLIC ROUTES — anyone can access ── */}
          <Route path="/"                element={<Home />}           />
          <Route path="/store"           element={<Store />}          />
          <Route path="/appointment"     element={<Appointment />}    />
          <Route path="/queue-display"   element={<QueueDisplay />}   />
          <Route path="/login"           element={<Login />}          />
          <Route path="/signup"          element={<Signup />}         />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* ── USER ROUTES — must be logged in ── */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={["user", "admin", "staff", "reception"]}>
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="/cart" element={
            <ProtectedRoute allowedRoles={["user", "admin", "staff", "reception"]}>
              <Cart />
            </ProtectedRoute>
          } />
          <Route path="/my-orders" element={
            <ProtectedRoute allowedRoles={["user", "admin", "staff", "reception"]}>
              <MyOrders />
            </ProtectedRoute>
          } />

          {/* ── STAFF ROUTE ── */}
          <Route path="/staff" element={
            <ProtectedRoute allowedRoles={["staff", "admin"]}>
              <Staffdashboard />
            </ProtectedRoute>
          } />

          {/* ── RECEPTION ROUTE ── */}
          <Route path="/reception" element={
            <ProtectedRoute allowedRoles={["reception", "admin"]}>
              <Receptiondesk />
            </ProtectedRoute>
          } />

          {/* ── ADMIN ONLY ROUTE ── */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Admin />
            </ProtectedRoute>
          } />

          {/* ── 404 — catch all unknown routes ── */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </ErrorBoundary>
      {!hideShell && <Footer />}
    </>
  );
}

function App() {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  useEffect(() => {
    fetch("https://clinic-backend-mxto.onrender.com/ping")
    .catch(() => {});

    const interval = setInterval(() => {
      fetch("https://clinic-backend-mxto.onrender.com/ping")
      .catch(() => {});
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
  
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;