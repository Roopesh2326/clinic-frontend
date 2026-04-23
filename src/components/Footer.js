import React from "react";

// ─── Design tokens (kept in sync with Home.jsx) ───────────────────────────────
const T = {
  g1:  "#0b3d1f",
  g2:  "#155231",
  g4:  "#22c55e",
  g5:  "#dcfce7",
  gol: "#b8955a",
  wh:  "#ffffff",
};

// ─── GOOGLE MAPS EMBED ────────────────────────────────────────────────────────
// This uses the free iframe embed — no API key required.
// The query "Dr.+Somnath+Clinic+Thane" will pin the location on Google Maps.
//
// To get a precise embed for YOUR exact address:
//   1. Go to maps.google.com
//   2. Search your clinic's exact address
//   3. Click Share → Embed a map → Copy HTML
//   4. Replace the src below with your <iframe src="...">
//
// Current embed: Generic search for clinic in Thane, Maharashtra
const MAPS_EMBED_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.11609823277!2d72.74109995!3d19.0759837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b63aceef0c69%3A0xe09b6379f7e19d5b!2sThane%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin";

function GoogleMapEmbed() {
  return (
    <div style={{
      position:     "relative",
      width:        "100%",
      paddingTop:   "56.25%",   // 16:9 aspect ratio
      borderRadius: "14px",
      overflow:     "hidden",
      boxShadow:    "0 4px 20px rgba(0,0,0,0.25)",
      border:       "1px solid rgba(255,255,255,0.12)",
    }}>
      <iframe
        title="Dr. Somnath Clinic — Thane, Maharashtra"
        src={MAPS_EMBED_SRC}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        style={{
          position: "absolute",
          top:    0,
          left:   0,
          width:  "100%",
          height: "100%",
          border: 0,
          // Slight color overlay using CSS filters to match the dark green theme
          filter: "invert(10%) sepia(10%) saturate(120%) hue-rotate(100deg) brightness(90%)",
        }}
      />
      {/* Clickable overlay label */}
      <a
        href="https://maps.google.com/?q=Thane,Maharashtra"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position:    "absolute",
          bottom:      "10px",
          left:        "10px",
          background:  T.g2,
          color:       T.wh,
          fontSize:    "11px",
          fontWeight:  "700",
          fontFamily:  "'Plus Jakarta Sans', sans-serif",
          padding:     "5px 10px",
          borderRadius: "8px",
          textDecoration: "none",
          display:     "flex",
          alignItems:  "center",
          gap:         "5px",
          boxShadow:   "0 2px 8px rgba(0,0,0,0.3)",
          letterSpacing: "0.03em",
          transition:  "background .2s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "#22c55e"}
        onMouseLeave={e => e.currentTarget.style.background = T.g2}
      >
        📍 Open in Maps
      </a>
    </div>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
export default function Footer() {

  const scrollTo = (e, href) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Google Fonts — load once */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        @media (max-width: 860px) {
          .footer-grid { flex-direction: column !important; gap: 36px !important; }
          .footer-map-col { min-width: unset !important; }
        }
        @media (max-width: 500px) {
          .footer-bottom { flex-direction: column !important; text-align: center; gap: 8px !important; }
        }
      `}</style>

      <footer id="contact" style={{ background: T.g1, padding: "64px 32px 36px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

          {/* ── TOP ROW — 3 columns: Brand | Quick Links | Map ── */}
          <div
            className="footer-grid"
            style={{
              display:       "flex",
              gap:           "48px",
              flexWrap:      "wrap",
              paddingBottom: "48px",
              borderBottom:  "1px solid rgba(255,255,255,.1)",
              marginBottom:  "32px",
              alignItems:    "flex-start",
            }}
          >

            {/* ── COL 1: Brand ── */}
            <div style={{ flex: "0 0 230px" }}>
              {/* Logo */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "12px",
                  background: `linear-gradient(135deg, ${T.g4}, ${T.g2})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "20px", flexShrink: 0,
                }}>🌿</div>
                <div>
                  <div style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize:   "18px", fontWeight: "700", color: T.wh,
                  }}>Dr. Somnath Clinic</div>
                  <div style={{
                    fontFamily:    "'Plus Jakarta Sans', sans-serif",
                    fontSize:      "10px", fontWeight: "600",
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    color:         `${T.g4}99`,
                  }}>Homeopathy · Est. 2003</div>
                </div>
              </div>

              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize:   "14px", lineHeight: "1.75",
                color:      "rgba(255,255,255,.5)", margin: "0 0 20px",
              }}>
                Natural, effective healing for chronic conditions.
                Personalized care with 20+ years of expertise in Thane, Maharashtra.
              </p>

              {/* Contact info (moved from old column 3) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { icon: "📞", label: "+91 97524 40622", href: "tel:+919752440622" },
                  { icon: "📍", label: "Thane, Maharashtra",   href: "https://maps.google.com/?q=Thane,Maharashtra" },
                  { icon: "🕐", label: "Mon–Sat · 9 AM – 6 PM", href: "#"          },
                ].map((c, i) => (
                  <a key={i} href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    style={{
                      display:       "flex", gap: "8px", alignItems: "flex-start",
                      fontFamily:    "'Plus Jakarta Sans', sans-serif",
                      fontSize:      "13px", color: "rgba(255,255,255,.55)",
                      textDecoration: "none", transition: "color .2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = T.wh}
                    onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.55)"}
                  >
                    <span style={{ fontSize: "14px", flexShrink: 0 }}>{c.icon}</span>
                    <span>{c.label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* ── COL 2: Quick Links ── */}
            <div style={{ flex: "0 0 160px" }}>
              <div style={{
                fontFamily:    "'Plus Jakarta Sans', sans-serif",
                fontSize:      "11px", fontWeight: "700",
                letterSpacing: "0.1em", textTransform: "uppercase",
                color:         T.gol, marginBottom: "18px",
              }}>Quick Links</div>

              {[
                { label: "Home",           href: "/"              },
                { label: "Appointments",   href: "/appointment"   },
                { label: "Medicine Store", href: "/store"         },
                { label: "My Account",     href: "/dashboard"     },
                { label: "Login",          href: "/login"         },
                { label: "Queue Display",  href: "/queue-display" },
              ].map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => scrollTo(e, link.href)}
                  style={{
                    display:        "block",
                    fontFamily:     "'Plus Jakarta Sans', sans-serif",
                    fontSize:       "14px",
                    color:          "rgba(255,255,255,.55)",
                    textDecoration: "none",
                    marginBottom:   "10px",
                    transition:     "color .2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = T.wh}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.55)"}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* ── COL 3: Google Maps ── */}
            <div className="footer-map-col" style={{ flex: 1, minWidth: "280px" }}>
              <div style={{
                fontFamily:    "'Plus Jakarta Sans', sans-serif",
                fontSize:      "11px", fontWeight: "700",
                letterSpacing: "0.1em", textTransform: "uppercase",
                color:         T.gol, marginBottom: "14px",
              }}>Find Us</div>

              <GoogleMapEmbed />

              <div style={{
                fontFamily:  "'Plus Jakarta Sans', sans-serif",
                fontSize:    "12px",
                color:       "rgba(255,255,255,.4)",
                marginTop:   "10px",
                lineHeight:  "1.5",
              }}>
                📍 Dr. Somnath Clinic, Thane, Maharashtra 400601
              </div>
            </div>

          </div>

          {/* ── BOTTOM ROW ── */}
          <div
            className="footer-bottom"
            style={{
              display:        "flex",
              justifyContent: "space-between",
              alignItems:     "center",
              flexWrap:       "wrap",
              gap:            "12px",
            }}
          >
            <div style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize:   "13px", color: "rgba(255,255,255,.3)",
            }}>
              © {new Date().getFullYear()} Dr. Somnath Clinic. All rights reserved.
            </div>

            <div style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize:   "13px", color: "rgba(255,255,255,.3)",
            }}>
              Made with ❤️ by {" "}
              <span style={{ color: "rgba(255,255,255,.6)", fontWeight: "600" }}> Roopesh</span>
            </div>

            <div style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize:   "13px", color: "rgba(255,255,255,.3)",
            }}>
              Natural Healing · Modern Care
            </div>
          </div>

        </div>
      </footer>
    </>
  );
}