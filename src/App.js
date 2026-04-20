import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import NoticeBar from "./components/NoticeBar";
import Chatbot from "./components/Chatbot";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";
import Store from "./pages/Store";
import Admin from "./pages/Admin";
import UserDashboard from "./pages/UserDashboard";
import Staffdashboard from "./pages/Staffdashboard";
import Receptiondesk from "./pages/Receptiondesk";
import QueueDisplay from "./pages/QueueDisplay";
import MyOrders from "./pages/MyOrders";
import Cart from "./pages/Cart";
import Appointment from "./components/Appointment";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";

function AppContent() {
  const location = useLocation();

  // These routes manage their own layout — hide global shell
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
          <Route path="/"                element={<Home />}          />
          <Route path="/store"           element={<Store />}         />
          <Route path="/admin"           element={<Admin />}         />
          <Route path="/dashboard"       element={<UserDashboard />} />
          <Route path="/staff"           element={<Staffdashboard />}/>
          <Route path="/reception"       element={<Receptiondesk />} />
          <Route path="/queue-display"   element={<QueueDisplay />}  />
          <Route path="/my-orders"       element={<MyOrders />}      />
          <Route path="/cart"            element={<Cart />}          />
          <Route path="/appointment"     element={<Appointment />}   />
          <Route path="/signup"          element={<Signup />}        />
          <Route path="/login"           element={<Login />}         />
          <Route path="/forgot-password" element={<ForgotPassword />}/>
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

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;