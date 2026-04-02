import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Button, Box, Badge } from "@mui/material";

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const role = localStorage.getItem("role");

  const updateCartCount = () => {
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    setCartCount(cartItems.length);
  };

  useEffect(() => {
    updateCartCount();

    const onStorage = () => updateCartCount();
    window.addEventListener("storage", onStorage);
    window.addEventListener("cartUpdate", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cartUpdate", onStorage);
    };
  }, []);

  return (
    <AppBar position="sticky" style={{ background: "linear-gradient(90deg, #0f172a 0%, #1e293b 100%)" }}>
      <Toolbar>
        <Link to="/" style={{ textDecoration: "none", color: "white", flex: 1 }}>
          <Typography variant="h6" style={{ fontWeight: "700" }}>
            🏥 Dr. Loknath Clinic
          </Typography>
        </Link>

        <Box style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <Button color="inherit">🏠 Home</Button>
          </Link>

          <Link to="/store" style={{ textDecoration: "none" }}>
            <Button color="inherit">💊 Store</Button>
          </Link>

          {isLoggedIn && role === "admin" && (
            <Link to="/admin" style={{ textDecoration: "none" }}>
              <Button color="inherit">⚙️ Admin</Button>
            </Link>
          )}

          {isLoggedIn && role === "user" && (
            <>
              <Link to="/dashboard" style={{ textDecoration: "none" }}>
                <Button color="inherit">📊 Dashboard</Button>
              </Link>
              <Link to="/cart" style={{ textDecoration: "none" }}>
                <Button color="inherit">
                  🛒 Cart
                  <Badge badgeContent={cartCount} color="error" style={{ marginLeft: "8px" }}>
                  </Badge>
                  {cartCount > 0 && <span style={{ marginLeft: "4px", fontWeight: "700", color: "#ff6b6b" }}>{cartCount}</span>}
                </Button>
              </Link>
            </>
          )}

          {!isLoggedIn && (
            <>
              <Link to="/login" style={{ textDecoration: "none" }}>
                <Button color="inherit" variant="outlined">🔐 Login</Button>
              </Link>
              <Link to="/signup" style={{ textDecoration: "none" }}>
                <Button variant="contained" style={{ background: "#4ade80", color: "black" }}>📝 Signup</Button>
              </Link>
            </>
          )}

          {isLoggedIn && (
            <Button
              color="inherit"
              onClick={() => {
                localStorage.removeItem("isLoggedIn");
                localStorage.removeItem("role");
                window.location.href = "/";
              }}
            >
              🚪 Logout
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}