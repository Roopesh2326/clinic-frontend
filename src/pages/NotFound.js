import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#f0fdf4",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      textAlign: "center",
      padding: "32px",
    }}>
      <div style={{ fontSize: "80px", marginBottom: "16px" }}>🌿</div>

      <h1 style={{
        fontSize: "96px", fontWeight: "800",
        color: "#0b3d1f", lineHeight: 1, margin: "0 0 8px",
        fontFamily: "'Cormorant Garamond', serif",
      }}>404</h1>

      <h2 style={{
        fontSize: "24px", fontWeight: "700",
        color: "#155231", margin: "0 0 12px",
      }}>Page Not Found</h2>

      <p style={{
        fontSize: "15px", color: "#697a6e",
        maxWidth: "400px", lineHeight: "1.7",
        marginBottom: "36px",
      }}>
        The page you're looking for doesn't exist or has been moved.
        Let's get you back on track.
      </p>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "12px 28px", borderRadius: "50px",
            border: "2px solid #155231", background: "transparent",
            color: "#155231", fontSize: "14px", fontWeight: "600",
            cursor: "pointer", transition: "all .2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#155231"; e.currentTarget.style.color = "white"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#155231"; }}
        >
          ← Go Back
        </button>

        <button
          onClick={() => navigate("/")}
          style={{
            padding: "12px 28px", borderRadius: "50px",
            border: "none", background: "#22c55e",
            color: "#0b3d1f", fontSize: "14px", fontWeight: "700",
            cursor: "pointer", boxShadow: "0 4px 14px rgba(34,197,94,0.4)",
            transition: "all .2s",
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseLeave={e => e.currentTarget.style.transform = ""}
        >
          🏠 Go Home
        </button>
      </div>
    </div>
  );
}