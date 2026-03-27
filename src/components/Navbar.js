import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "15px 40px",
      background: "#0f172a",
      color: "white"
    }}>
      <h2>Dr. Loknath Clinic</h2>

      <div style={{ display: "flex", gap: "25px" }}>
        <Link to="/" style={{ color: "white", textDecoration: "none" }}>
          Home
        </Link>

        <Link to="/admin" style={{ color: "white", textDecoration: "none" }}>
          Admin
        </Link>
      </div>
    </nav>
  );
}