import { useLocation } from "react-router-dom";

const T = {
  g1:  "#0b3d1f",
  g2:  "#155231",
  g4:  "#22c55e",
  g5:  "#dcfce7",
  gol: "#b8955a",
  wh:  "#ffffff",
};

export default function Footer() {
  const location = useLocation();

  const scrollTo = (e, href) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer id="contact" style={{ background: T.g1, padding: "64px 32px 32px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* ── TOP ROW ── */}
        <div style={{
          display: "flex", gap: "48px", flexWrap: "wrap",
          paddingBottom: "48px",
          borderBottom: "1px solid rgba(255,255,255,.1)",
          marginBottom: "32px",
        }} className="footer-grid">

          {/* Brand */}
          <div style={{ flex: "0 0 260px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "12px",
                background: `linear-gradient(135deg, ${T.g4}, ${T.g2})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px",
              }}>🌿</div>
              <div>
                <div style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "18px", fontWeight: "700", color: T.wh,
                }}>Dr. Somnath Clinic</div>
                <div style={{
                  fontSize: "10px", color: `${T.g4}99`,
                  fontWeight: "600", letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>Homeopathy · Est. 2003</div>
              </div>
            </div>
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "14px", lineHeight: "1.75",
              color: "rgba(255,255,255,.5)", margin: 0,
            }}>
              Natural, effective healing for chronic conditions.
              Personalized care with 20+ years of expertise.
            </p>
          </div>

          {/* Quick Links */}
          <div style={{ flex: 1, minWidth: "140px" }}>
            <div style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "11px", fontWeight: "700",
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: T.gol, marginBottom: "18px",
            }}>Quick Links</div>
            {[
              { label: "Home",           href: "/"               },
              { label: "Appointments",   href: "/appointment"    },
              { label: "Medicine Store", href: "/store"          },
              { label: "Login",          href: "/login"          },
              { label: "Queue Display",  href: "/queue-display"  },
            ].map(link => (
                <a // Added the missing opening tag
                key={link.label}
                href={link.href}
                onClick={(e) => scrollTo(e, link.href)}
                style={{
                  display: "block",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "14px",
                  color: "rgba(255,255,255,.55)",
                  textDecoration: "none",
                  marginBottom: "10px",
                  transition: "color .2s",
                }}
                onMouseEnter={e => e.currentTarget.style.color = T.wh}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.55)"}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Contact */}
          <div style={{ flex: 1, minWidth: "200px" }}>
            <div style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "11px", fontWeight: "700",
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: T.gol, marginBottom: "18px",
            }}>Contact</div>
            {[
              { icon: "📞", label: "+91 97524 40622", href: "tel:+919752440622" },
              { icon: "📍", label: "Thane, Maharashtra", href: "#"             },
              { icon: "🕐", label: "Mon–Sat · 9 AM – 6 PM", href: "#"          },
            ].map((c, i) => (
                <a // Added the missing opening tag
                key={i}
                href={c.href}
                style={{
                  display: "flex", gap: "10px", alignItems: "flex-start",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "14px", color: "rgba(255,255,255,.55)",
                  textDecoration: "none", marginBottom: "12px",
                  transition: "color .2s",
                }}
                onMouseEnter={e => e.currentTarget.style.color = T.wh}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.55)"}
              >
                <span style={{ fontSize: "16px" }}>{c.icon}</span>
                <span>{c.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* ── BOTTOM ROW ── */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}>
          <div style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "13px", color: "rgba(255,255,255,.3)",
          }}>
            © 2025 Dr. Somnath Clinic. All rights reserved.
          </div>

          <div style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "13px", color: "rgba(255,255,255,.3)",
          }}>
            Made with ❤️ by{" "}
            <span style={{ color: "rgba(255,255,255,.6)", fontWeight: "600" }}>
              Roopesh
            </span>
          </div>

          <div style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "13px", color: "rgba(255,255,255,.3)",
          }}>
            Natural Healing · Modern Care
          </div>
        </div>

      </div>
    </footer>
  );
}