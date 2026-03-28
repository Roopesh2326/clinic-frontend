import { Link } from "react-router-dom";

export default function Navbar() {
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  return (
    <nav style={styles.nav}>
      <h2 style={styles.logo}>Dr. Loknath Clinic</h2>

      <div style={styles.links}>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/admin" style={styles.link}>Admin</Link>

        {/*  SHOW ONLY WHEN NOT LOGGED IN */}
        {!isLoggedIn && (
          <>
            <Link to="/login">
              <button style={styles.btn}>Login</button>
            </Link>

            <Link to="/signup">
              <button style={styles.btnOutline}>Signup</button>
            </Link>
          </>
        )}

        {/*  SHOW LOGOUT WHEN LOGGED IN */}
        {isLoggedIn && (
          <button
            style={styles.logout}
            onClick={() => {
              localStorage.removeItem("isLoggedIn");
              window.location.href = "/";
            }}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 40px",
    background: "#0f172a",
    color: "white",
  },

  logo: {
    fontSize: "20px",
  },

  links: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },

  link: {
    color: "white",
    textDecoration: "none",
    fontWeight: "500",
  },

  btn: {
    padding: "8px 16px",
    background: "#166534",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },

  btnOutline: {
    padding: "8px 16px",
    background: "white",
    color: "#166534",
    border: "1px solid #166534",
    borderRadius: "8px",
    cursor: "pointer",
  },

  logout: {
    padding: "8px 16px",
    background: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};