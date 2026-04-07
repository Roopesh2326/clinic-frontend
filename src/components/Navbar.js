import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Button, Box, Badge, IconButton, Menu, MenuItem, Grow } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import SpaIcon from '@mui/icons-material/Spa';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import StorefrontIcon from '@mui/icons-material/Storefront';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const role = localStorage.getItem("role");

  const safeReadCart = useCallback(() => {
    try {
      const raw = localStorage.getItem("cart");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, []);

  const updateCartCount = useCallback(() => {
    const cartItems = safeReadCart();
    setCartCount(cartItems.length);
  }, [safeReadCart]);

  useEffect(() => {
    updateCartCount();

    const onStorage = () => updateCartCount();
    const onResize = () => setIsMobile(window.innerWidth < 768);

    window.addEventListener("storage", onStorage);
    window.addEventListener("cartUpdate", onStorage);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cartUpdate", onStorage);
      window.removeEventListener("resize", onResize);
    };
  }, [updateCartCount]);

  const { handleLogout } = {
    handleLogout: () => {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("role");
      window.location.href = "/";
    },
  };

  return (
    <AppBar position="sticky" style={{ background: "linear-gradient(90deg, #0f172a 0%, #1e293b 100%)" }}>
      <Toolbar style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        <Link to="/" style={{ textDecoration: "none", color: "white" }}>
          <Typography variant="h6" style={{ fontWeight: "700" }}>
            🏥 Dr. Loknath Clinic
          </Typography>
        </Link>

        {isMobile ? (
          <>
            <IconButton onClick={(event) => { setAnchorEl(event.currentTarget); setMobileOpen(true); }} color="inherit">
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={mobileOpen}
              onClose={() => { setMobileOpen(false); setAnchorEl(null); }}
              TransitionComponent={Grow}
              keepMounted
              PaperProps={{ style: { borderRadius: 16, minWidth: 180 } }}
              elevation={4}
            >
              <MenuItem component={Link} to="/store" onClick={() => { setMobileOpen(false); setAnchorEl(null); }}>
                <StorefrontIcon style={{ marginRight: 8 }} /> Store
              </MenuItem>
              {isLoggedIn && role === "user" && (
                <>
                  <MenuItem component={Link} to="/dashboard" onClick={() => { setMobileOpen(false); setAnchorEl(null); }}>
                    <DashboardIcon style={{ marginRight: 8 }} /> Dashboard
                  </MenuItem>
                  <MenuItem component={Link} to="/cart" onClick={() => { setMobileOpen(false); setAnchorEl(null); }}>
                    <ShoppingCartIcon style={{ marginRight: 8 }} /> Cart {cartCount > 0 ? `(${cartCount})` : ""}
                  </MenuItem>
                </>
              )}
              {isLoggedIn ? (
                <MenuItem onClick={() => { setMobileOpen(false); setAnchorEl(null); handleLogout(); }}>
                  <LogoutIcon style={{ marginRight: 8 }} /> Logout
                </MenuItem>
              ) : (
                <>
                  <MenuItem component={Link} to="/login" onClick={() => { setMobileOpen(false); setAnchorEl(null); }}>
                    <LoginIcon style={{ marginRight: 8 }} /> Login
                  </MenuItem>
                  <MenuItem component={Link} to="/signup" onClick={() => { setMobileOpen(false); setAnchorEl(null); }}>
                    <PersonAddIcon style={{ marginRight: 8 }} /> Signup
                  </MenuItem>
                </>
              )}
            </Menu>
          </>
        ) : (
          <Box style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <Link to="/" style={{ textDecoration: "none" }}>
              <Button color="inherit" startIcon={<HomeIcon />}>Home</Button>
            </Link>
            <a href="/#remedies" style={{ textDecoration: "none" }}>
              <Button color="inherit" startIcon={<SpaIcon />}>Remedies</Button>
            </a>

            <a href="/#treatments" style={{ textDecoration: "none" }}>
              <Button color="inherit" startIcon={<LocalPharmacyIcon />}>Treatments</Button>
            </a>

            <a href="/#appointment" style={{ textDecoration: "none" }}>
              <Button color="inherit" startIcon={<CalendarTodayIcon />}>Consultation</Button>
            </a>

            <Link to="/store" style={{ textDecoration: "none" }}>
              <Button color="inherit" startIcon={<StorefrontIcon />}>Store</Button>
            </Link>

            {isLoggedIn && role === "user" && (
              <>
                <Link to="/dashboard" style={{ textDecoration: "none" }}>
                  <Button color="inherit" startIcon={<DashboardIcon />}>Dashboard</Button>
                </Link>
                <Link to="/cart" style={{ textDecoration: "none" }}>
                  <Button color="inherit" startIcon={<ShoppingCartIcon />}>
                    Cart
                    <Badge badgeContent={cartCount} color="error" style={{ marginLeft: "8px" }} />
                  </Button>
                </Link>
              </>
            )}

            {isLoggedIn ? (
              <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
                Logout
              </Button>
            ) : (
              <>
                <Link to="/login" style={{ textDecoration: "none" }}>
                  <Button color="inherit" variant="outlined" startIcon={<LoginIcon />}>
                    Login
                  </Button>
                </Link>
                <Link to="/signup" style={{ textDecoration: "none" }}>
                  <Button variant="contained" startIcon={<PersonAddIcon />} style={{ background: "#4ade80", color: "black" }}>
                    Signup
                  </Button>
                </Link>
              </>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
