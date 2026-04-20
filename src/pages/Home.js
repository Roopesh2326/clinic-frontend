import { useState, useEffect, useRef } from "react";

// ─── FONTS ────────────────────────────────────────────────────────────────────
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');`;

// ─── TOKENS ──────────────────────────────────────────────────────────────────
const T = {
  g1:  "#0b3d1f",
  g2:  "#155231",
  g3:  "#1a6b40",
  g4:  "#22c55e",
  g5:  "#dcfce7",
  gd:  "#f0fdf4",
  gol: "#b8955a",
  cr:  "#faf8f3",
  cr2: "#f3ede0",
  ink: "#0f1a13",
  im:  "#344139",
  il:  "#697a6e",
  wh:  "#ffffff",
};

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  ${FONTS}
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: ${T.cr};
    color: ${T.ink};
    overflow-x: hidden;
  }

  @keyframes fadeUp  { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
  @keyframes float   { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-12px); } }
  @keyframes shimmer { 0% { background-position:200% center; } 100% { background-position:-200% center; } }
  @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:.5; } }
  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes gradMove{ 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }

  .reveal      { opacity:0; transform:translateY(36px); transition: opacity .8s ease, transform .8s ease; }
  .reveal.in   { opacity:1; transform:translateY(0); }
  .reveal-l    { opacity:0; transform:translateX(-40px); transition: opacity .8s ease, transform .8s ease; }
  .reveal-l.in { opacity:1; transform:translateX(0); }
  .reveal-r    { opacity:0; transform:translateX(40px); transition: opacity .8s ease, transform .8s ease; }
  .reveal-r.in { opacity:1; transform:translateX(0); }

  .treat-card:hover { transform:translateY(-6px) !important; box-shadow:0 24px 48px rgba(11,61,31,.12) !important; }
  .step-dot:hover   { transform:scale(1.08); background:${T.g2} !important; }

  ::-webkit-scrollbar       { width:6px; }
  ::-webkit-scrollbar-track { background:${T.cr}; }
  ::-webkit-scrollbar-thumb { background:${T.g5}; border-radius:3px; }

  @media (max-width:900px) {
    .hero-grid  { flex-direction:column !important; }
    .about-grid { flex-direction:column-reverse !important; }
    .treat-grid { grid-template-columns:1fr 1fr !important; }
    .step-grid  { grid-template-columns:1fr 1fr !important; }
    .tbar-grid  { grid-template-columns:1fr 1fr !important; }
    .testi-wrap { padding-left:20px !important; }
    .cta-grid   { grid-template-columns:1fr !important; }
  }
  @media (max-width:600px) {
    .treat-grid     { grid-template-columns:1fr !important; }
    .step-grid      { grid-template-columns:1fr !important; }
    .tbar-grid      { grid-template-columns:1fr 1fr !important; }
    .hero-img-wrap  { display:none !important; }
    .hero-text      { padding:0 !important; }
    .section-pad    { padding:64px 20px !important; }
    .h1-size        { font-size:36px !important; line-height:1.15 !important; }
    .hero-btns      { flex-direction:column !important; align-items:flex-start !important; }
    .footer-grid    { flex-direction:column !important; gap:32px !important; }
  }
`;

// ─── SCROLL REVEAL ────────────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal, .reveal-l, .reveal-r");
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  });
}

// ─── ANIMATED COUNTER ─────────────────────────────────────────────────────────
function Counter({ end, suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref     = useRef();
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let n = 0;
        const step = end / 60;
        const t = setInterval(() => {
          n = Math.min(n + step, end);
          setVal(Math.round(n));
          if (n >= end) clearInterval(t);
        }, 20);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{val}{suffix}</span>;
}

// ══════════════════════════════════════════════════════════════════════════════
// HERO
// ══════════════════════════════════════════════════════════════════════════════
function Hero() {
  const [loaded, setLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setLoaded(true);
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section style={{
      minHeight: "100vh",
      position:  "relative",
      overflow:  "hidden",
      display:   "flex",
      alignItems:"center",
    }}>
      {/* BG IMAGE */}
      <div style={{
        position:  "absolute", inset: 0, zIndex: 0,
        transform: `translateY(${scrollY * 0.28}px)`,
      }}>
        <img
          src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1800&q=85&auto=format&fit=crop"
          alt="Natural healing"
          style={{ width:"100%", height:"110%", objectFit:"cover", objectPosition:"center 30%" }}
        />
      </div>

      {/* OVERLAYS */}
      <div style={{
        position:"absolute", inset:0, zIndex:1,
        background:`linear-gradient(120deg, ${T.g1}ee 0%, ${T.g1}cc 40%, ${T.g2}99 70%, transparent 100%)`,
      }} />
      <div style={{
        position:"absolute", inset:0, zIndex:2,
        background:"linear-gradient(60deg, transparent 55%, rgba(255,255,255,.04) 56%, rgba(255,255,255,.04) 57%, transparent 58%)",
      }} />

      {/* CONTENT */}
      <div style={{
        position:  "relative", zIndex: 3,
        maxWidth:  "1200px", margin: "0 auto",
        padding:   "120px 32px 80px",
        display:   "flex", alignItems: "center", gap: "60px",
        width:     "100%",
      }} className="hero-grid">

        {/* LEFT TEXT */}
        <div style={{ flex:"0 0 55%", maxWidth:"600px" }} className="hero-text">

          {/* Badge */}
          <div style={{
            display:"inline-flex", alignItems:"center", gap:"8px",
            background:"rgba(255,255,255,.12)", backdropFilter:"blur(8px)",
            border:"1px solid rgba(255,255,255,.2)",
            borderRadius:"40px", padding:"6px 16px", marginBottom:"32px",
            opacity: loaded ? 1 : 0,
            animation: loaded ? "fadeIn .8s ease .1s both" : "none",
          }}>
            <span style={{
              width:"8px", height:"8px", borderRadius:"50%",
              background:T.g4, display:"inline-block",
              animation:"pulse 2s ease infinite",
            }} />
            <span style={{
              fontSize:"12px", fontWeight:"600", color:T.wh,
              letterSpacing:"0.06em", textTransform:"uppercase",
            }}>Est. 2003 · Thane, Maharashtra</span>
          </div>

          {/* Headline */}
          <h1 className="h1-size" style={{
            fontFamily:"'Cormorant Garamond', serif",
            fontSize:"clamp(44px, 5.5vw, 72px)",
            fontWeight:"700", lineHeight:1.08,
            color:T.wh, margin:"0 0 10px",
            opacity: loaded ? 1 : 0,
            animation: loaded ? "fadeUp .9s ease .2s both" : "none",
          }}>
            Heal from Within,<br />
            <span style={{
              fontStyle:"italic",
              background:`linear-gradient(90deg, ${T.g4}, #a3e635, ${T.g4})`,
              backgroundSize:"200% auto",
              WebkitBackgroundClip:"text",
              WebkitTextFillColor:"transparent",
              animation:"shimmer 4s linear infinite",
            }}>Live Without Limits.</span>
          </h1>

          <p style={{
            fontFamily:"'Plus Jakarta Sans', sans-serif",
            fontSize:"18px", lineHeight:"1.75", fontWeight:"300",
            color:"rgba(255,255,255,.82)", margin:"24px 0 40px",
            maxWidth:"480px",
            opacity: loaded ? 1 : 0,
            animation: loaded ? "fadeUp .9s ease .35s both" : "none",
          }}>
            Dr. Somnath's homeopathy clinic — 20+ years of restoring health
            naturally, without side effects. Personalized care for every patient.
          </p>

          {/* CTAs */}
          <div style={{
            display:"flex", flexWrap:"wrap", gap:"14px",
            opacity: loaded ? 1 : 0,
            animation: loaded ? "fadeUp .9s ease .5s both" : "none",
          }} className="hero-btns">
            <a href="/appointment" style={{
              fontFamily:"'Plus Jakarta Sans', sans-serif",
              fontSize:"15px", fontWeight:"700",
              padding:"15px 36px", borderRadius:"50px",
              background:T.g4, color:T.g1,
              textDecoration:"none",
              boxShadow:`0 8px 28px ${T.g4}50`,
              transition:"transform .2s, box-shadow .2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px) scale(1.02)"; e.currentTarget.style.boxShadow=`0 16px 40px ${T.g4}65`; }}
            onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=`0 8px 28px ${T.g4}50`; }}>
              📅 Book Appointment
            </a>
            <a href="/store" style={{
              fontFamily:"'Plus Jakarta Sans', sans-serif",
              fontSize:"15px", fontWeight:"600",
              padding:"15px 36px", borderRadius:"50px",
              background:"rgba(255,255,255,.12)", backdropFilter:"blur(8px)",
              border:"1px solid rgba(255,255,255,.28)",
              color:T.wh, textDecoration:"none",
              transition:"background .2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,.22)"; }}
            onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,.12)"; }}>
              💊 Medicine Store
            </a>
          </div>

          {/* Social proof */}
          <div style={{
            display:"flex", gap:"28px", marginTop:"48px", flexWrap:"wrap",
            opacity: loaded ? 1 : 0,
            animation: loaded ? "fadeUp .9s ease .65s both" : "none",
          }}>
            {[
              { val:"20+", label:"Years"    },
              { val:"500+",label:"Patients" },
              { val:"4.9★",label:"Rating"   },
            ].map(s => (
              <div key={s.label}>
                <div style={{
                  fontFamily:"'Cormorant Garamond', serif",
                  fontSize:"26px", fontWeight:"700", color:T.wh, lineHeight:1,
                }}>{s.val}</div>
                <div style={{
                  fontFamily:"'Plus Jakarta Sans', sans-serif",
                  fontSize:"12px", color:`${T.g4}cc`, fontWeight:"500",
                  textTransform:"uppercase", letterSpacing:"0.06em", marginTop:"3px",
                }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Floating card */}
        <div style={{
          flex:1, display:"flex", flexDirection:"column", gap:"16px",
          opacity: loaded ? 1 : 0,
          animation: loaded ? "fadeIn 1s ease .6s both" : "none",
        }} className="hero-img-wrap">
          <div style={{
            background:"rgba(255,255,255,.1)", backdropFilter:"blur(16px)",
            border:"1px solid rgba(255,255,255,.18)",
            borderRadius:"24px", overflow:"hidden",
            boxShadow:"0 20px 60px rgba(0,0,0,.3)",
          }}>
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80&auto=format&fit=crop&crop=top"
              alt="Doctor consultation"
              style={{ width:"100%", height:"240px", objectFit:"cover", objectPosition:"top", display:"block" }}
            />
            <div style={{ padding:"20px 22px" }}>
              <div style={{
                fontFamily:"'Cormorant Garamond', serif",
                fontSize:"18px", fontWeight:"600", color:T.wh, marginBottom:"6px",
              }}>Dr. Somnath</div>
              <div style={{
                fontFamily:"'Plus Jakarta Sans', sans-serif",
                fontSize:"13px", color:"rgba(255,255,255,.7)",
              }}>BHMS · 20 Years in Homeopathy</div>
              <div style={{ display:"flex", gap:"8px", marginTop:"14px", flexWrap:"wrap" }}>
                {["Stress","Skin","Respiratory","Joints"].map(tag => (
                  <span key={tag} style={{
                    fontSize:"11px", padding:"4px 10px", borderRadius:"20px",
                    background:"rgba(34,197,94,.2)", color:T.g4,
                    fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:"600",
                  }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
            {[
              { icon:"⏱", label:"Next Available", val:"Today"   },
              { icon:"🌿", label:"Treatment",      val:"Natural" },
            ].map(c => (
              <div key={c.label} style={{
                background:"rgba(255,255,255,.1)", backdropFilter:"blur(12px)",
                border:"1px solid rgba(255,255,255,.15)",
                borderRadius:"16px", padding:"16px 18px",
                animation:"float 5s ease-in-out infinite",
              }}>
                <div style={{ fontSize:"20px", marginBottom:"6px" }}>{c.icon}</div>
                <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:"11px", color:"rgba(255,255,255,.6)", fontWeight:"500" }}>{c.label}</div>
                <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:"14px", color:T.wh, fontWeight:"700", marginTop:"2px" }}>{c.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position:"absolute", bottom:"32px", left:"50%",
        transform:"translateX(-50%)", zIndex:3,
        display:"flex", flexDirection:"column", alignItems:"center", gap:"8px",
        opacity: loaded ? 1 : 0,
        animation: loaded ? "fadeIn 1s ease 1.2s both" : "none",
      }}>
        <div style={{
          fontSize:"11px", fontFamily:"'Plus Jakarta Sans', sans-serif",
          color:"rgba(255,255,255,.5)", letterSpacing:"0.1em", textTransform:"uppercase",
        }}>Scroll</div>
        <div style={{
          width:"1px", height:"48px",
          background:"linear-gradient(to bottom, rgba(255,255,255,.5), transparent)",
          animation:"float 2s ease-in-out infinite",
        }} />
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TRUST BAR
// ══════════════════════════════════════════════════════════════════════════════
function TrustBar() {
  const stats = [
    { num:20,  suf:"+",   label:"Years of Practice" },
    { num:500, suf:"+",   label:"Patients Healed"   },
    { num:100, suf:"%",   label:"Natural Medicine"  },
    { num:4,   suf:".9 ★",label:"Patient Rating"    },
  ];
  return (
    <div style={{ background:T.g1, padding:"48px 32px" }}>
      <div className="tbar-grid reveal" style={{
        maxWidth:"1000px", margin:"0 auto",
        display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"24px",
      }}>
        {stats.map((s, i) => (
          <div key={i} style={{ textAlign:"center" }}>
            <div style={{
              fontFamily:"'Cormorant Garamond', serif",
              fontSize:"44px", fontWeight:"700", color:T.g4, lineHeight:1,
            }}>
              <Counter end={s.num} suffix={s.suf} />
            </div>
            <div style={{
              fontFamily:"'Plus Jakarta Sans', sans-serif",
              fontSize:"13px", color:"rgba(255,255,255,.55)",
              fontWeight:"400", marginTop:"6px", letterSpacing:"0.03em",
            }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ABOUT
// ══════════════════════════════════════════════════════════════════════════════
function About() {
  return (
    <section id="about" className="section-pad" style={{ padding:"100px 32px", background:T.wh, overflow:"hidden" }}>
      <div style={{
        maxWidth:"1100px", margin:"0 auto",
        display:"flex", gap:"80px", alignItems:"center", flexWrap:"wrap",
      }} className="about-grid">
        {/* Image */}
        <div className="reveal-l" style={{ flex:"0 0 44%", position:"relative" }}>
          <div style={{
            position:"absolute", top:"-24px", left:"-24px",
            width:"100%", height:"100%",
            border:`2px solid ${T.gol}40`, borderRadius:"20px 80px",
          }} />
          <img
            src="https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=700&q=80&auto=format&fit=crop"
            alt="Homeopathy remedies"
            style={{
              width:"100%", height:"500px", objectFit:"cover",
              borderRadius:"80px 20px 80px 20px",
              boxShadow:"0 24px 64px rgba(0,0,0,.14)",
              position:"relative", zIndex:1, display:"block",
            }}
          />
          <div style={{
            position:"absolute", bottom:"30px", right:"-28px", zIndex:2,
            background:T.g2, borderRadius:"20px", padding:"18px 24px",
            boxShadow:`0 12px 36px ${T.g2}50`,
            animation:"float 4.5s ease-in-out infinite",
          }}>
            <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:"32px", fontWeight:"700", color:T.wh, lineHeight:1 }}>20+</div>
            <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:"11px", color:`${T.g5}cc`, fontWeight:"500", marginTop:"4px" }}>Years Expert</div>
          </div>
          <div style={{
            position:"absolute", top:"28px", left:"-28px", zIndex:2,
            background:T.cr, border:`1px solid ${T.gol}60`,
            borderRadius:"14px", padding:"12px 18px",
            boxShadow:"0 6px 20px rgba(0,0,0,.08)",
            animation:"float 5.5s ease-in-out infinite 1s",
          }}>
            <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:"12px", fontWeight:"600", color:T.g2 }}>🌿 Zero Side Effects</div>
          </div>
        </div>

        {/* Text */}
        <div className="reveal-r" style={{ flex:1, minWidth:"280px" }}>
          <div style={{
            display:"inline-block",
            fontFamily:"'Plus Jakarta Sans', sans-serif",
            fontSize:"11px", fontWeight:"700",
            letterSpacing:"0.14em", textTransform:"uppercase",
            color:T.gol, marginBottom:"14px",
          }}>About Our Clinic</div>

          <h2 style={{
            fontFamily:"'Cormorant Garamond', serif",
            fontSize:"clamp(32px, 3.5vw, 48px)", fontWeight:"700",
            lineHeight:1.15, color:T.ink, margin:"0 0 24px",
          }}>
            Two Decades of<br />
            <em style={{ color:T.g2, fontStyle:"italic" }}>Healing Naturally</em>
          </h2>

          <p style={{
            fontFamily:"'Plus Jakarta Sans', sans-serif",
            fontSize:"16px", lineHeight:"1.85", color:T.il, marginBottom:"20px",
          }}>
            Dr. Somnath is a dedicated homeopathy practitioner with over 20 years
            of experience treating chronic conditions. Every consultation is personal —
            we take time to understand the whole patient, not just the symptoms.
          </p>
          <p style={{
            fontFamily:"'Plus Jakarta Sans', sans-serif",
            fontSize:"16px", lineHeight:"1.85", color:T.il, marginBottom:"36px",
          }}>
            Hundreds of patients have regained their health through our gentle,
            individualized treatment plans — safely, naturally, and permanently.
          </p>

          {[
            "Personalized consultation for every patient",
            "Specializes in chronic & lifestyle diseases",
            "Safe natural remedies — no dependency, no side effects",
            "Open Monday to Saturday, 9 AM – 6 PM",
          ].map((p, i) => (
            <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:"12px", marginBottom:"14px" }}>
              <div style={{
                width:"22px", height:"22px", flexShrink:0, marginTop:"1px",
                borderRadius:"6px", background:T.g5,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"12px", fontWeight:"700", color:T.g2,
              }}>✓</div>
              <span style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:"15px", color:T.im, lineHeight:"1.6" }}>{p}</span>
            </div>
          ))}

          <a href="/appointment" style={{
            display:"inline-block", marginTop:"32px",
            fontFamily:"'Plus Jakarta Sans', sans-serif",
            fontSize:"14px", fontWeight:"600",
            padding:"13px 32px", borderRadius:"50px",
            background:T.g2, color:T.wh, textDecoration:"none",
            boxShadow:`0 8px 24px ${T.g2}40`,
            transition:"transform .2s, box-shadow .2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 14px 36px ${T.g2}55`; }}
          onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=`0 8px 24px ${T.g2}40`; }}>
            Meet Dr. Somnath →
          </a>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TREATMENTS
// ══════════════════════════════════════════════════════════════════════════════
function Treatments() {
  const cards = [
    { icon:"🧠", name:"Stress & Anxiety",  desc:"Restore emotional balance and calm with gentle constitutional remedies — no dependency.", color:"#e8f5e9" },
    { icon:"🫁", name:"Respiratory",       desc:"Asthma, allergies, recurring infections — deep healing at the source.",                  color:"#e3f2fd" },
    { icon:"🌿", name:"Skin Disorders",    desc:"Eczema, psoriasis, acne — treating root cause, not suppressing symptoms.",               color:"#f3e5f5" },
    { icon:"🦴", name:"Joint & Arthritis", desc:"Lasting pain relief and reduced inflammation through targeted homeopathic care.",         color:"#fff3e0" },
    { icon:"🩺", name:"Digestive Health",  desc:"IBS, acidity, constipation — healing your gut gently, from the inside.",                color:"#e8f5e9" },
    { icon:"💪", name:"Immunity Boost",    desc:"Strengthen your body's natural defences for lasting resistance to illness.",             color:"#fce4ec" },
  ];

  return (
    <section className="section-pad" style={{ padding:"100px 32px", background:T.cr }}>
      <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
        <div className="reveal" style={{ textAlign:"center", marginBottom:"64px" }}>
          <div style={{
            fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:"11px", fontWeight:"700",
            letterSpacing:"0.14em", textTransform:"uppercase", color:T.gol, marginBottom:"12px",
          }}>What We Treat</div>
          <h2 style={{
            fontFamily:"'Cormorant Garamond', serif",
            fontSize:"clamp(30px, 3.8vw, 46px)", fontWeight:"700",
            color:T.ink, margin:"0 0 16px",
          }}>Conditions We Specialize In</h2>
          <p style={{
            fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:"16px",
            color:T.il, maxWidth:"480px", margin:"0 auto", lineHeight:"1.7",
          }}>Every ailment has a root. We find it — and heal from there.</p>
        </div>
        <div className="treat-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"24px" }}>
          {cards.map((c, i) => (
            <div key={i} className="treat-card reveal" style={{
              background:T.wh, borderRadius:"20px", padding:"32px 28px",
              border:"1px solid #eaf3ec",
              transition:"transform .25s, box-shadow .25s",
              animationDelay:`${i * .07}s`, cursor:"default",
            }}>
              <div style={{
                width:"56px", height:"56px", borderRadius:"16px",
                background:c.color, display:"flex", alignItems:"center",
                justifyContent:"center", fontSize:"26px", marginBottom:"20px",
              }}>{c.icon}</div>
              <h3 style={{
                fontFamily:"'Cormorant Garamond', serif",
                fontSize:"20px", fontWeight:"600", color:T.ink, margin:"0 0 10px",
              }}>{c.name}</h3>
              <p style={{
                fontFamily:"'Plus Jakarta Sans', sans-serif",
                fontSize:"14px", lineHeight:"1.75", color:T.il, margin:0,
              }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// HOW IT WORKS
// ══════════════════════════════════════════════════════════════════════════════
function HowItWorks() {
  const steps = [
    { num:"01", icon:"📱", title:"Book Online",      desc:"Choose your date and time. Get instant confirmation with your queue token." },
    { num:"02", icon:"🩺", title:"Consultation",     desc:"Dr. Somnath listens carefully to your full history before prescribing."     },
    { num:"03", icon:"💊", title:"Receive Remedy",   desc:"Get your personalized homeopathic remedy. Track your healing progress."     },
    { num:"04", icon:"🌱", title:"Ongoing Wellness", desc:"Follow-up at your pace. We're with you every step of the way."             },
  ];

  return (
    <section className="section-pad" style={{
      padding:"100px 32px", position:"relative", overflow:"hidden",
      background:`linear-gradient(160deg, ${T.g1} 0%, #0d4a24 100%)`,
    }}>
      <div style={{
        position:"absolute", inset:0, opacity:0.15,
        backgroundImage:`radial-gradient(circle, ${T.g5} 1px, transparent 1px)`,
        backgroundSize:"36px 36px",
      }} />
      <div style={{
        position:"absolute", right:"-200px", top:"-200px",
        width:"600px", height:"600px", borderRadius:"50%",
        border:`1px solid ${T.g4}18`,
      }} />

      <div style={{ maxWidth:"1100px", margin:"0 auto", position:"relative", zIndex:1 }}>
        <div className="reveal" style={{ textAlign:"center", marginBottom:"72px" }}>
          <div style={{
            fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:"11px", fontWeight:"700",
            letterSpacing:"0.14em", textTransform:"uppercase", color:T.gol, marginBottom:"12px",
          }}>Simple Process</div>
          <h2 style={{
            fontFamily:"'Cormorant Garamond', serif",
            fontSize:"clamp(30px, 3.8vw, 46px)", fontWeight:"700", color:T.wh, margin:0,
          }}>Your Path to Better Health</h2>
        </div>

        <div className="step-grid reveal" style={{
          display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"32px", marginBottom:"60px",
        }}>
          {steps.map((s, i) => (
            <div key={i} style={{ textAlign:"center", position:"relative" }}>
              {i < steps.length - 1 && (
                <div style={{
                  position:"absolute", top:"32px", left:"calc(50% + 32px)",
                  width:"calc(100% - 64px)", height:"1px",
                  background:`linear-gradient(to right, ${T.g4}40, transparent)`,
                }} />
              )}
              <div className="step-dot" style={{
                width:"64px", height:"64px", borderRadius:"50%",
                border:`2px solid ${T.g4}50`, background:`${T.g4}15`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"26px", margin:"0 auto 20px",
                transition:"transform .2s, background .2s", cursor:"default",
              }}>{s.icon}</div>
              <div style={{
                fontFamily:"'Cormorant Garamond', serif", fontStyle:"italic",
                fontSize:"48px", color:`${T.gol}30`, lineHeight:1, marginBottom:"8px",
              }}>{s.num}</div>
              <h3 style={{
                fontFamily:"'Cormorant Garamond', serif",
                fontSize:"20px", fontWeight:"600", color:T.wh, margin:"0 0 10px",
              }}>{s.title}</h3>
              <p style={{
                fontFamily:"'Plus Jakarta Sans', sans-serif",
                fontSize:"14px", lineHeight:"1.7", color:`${T.g5}aa`, margin:0,
              }}>{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="reveal" style={{ textAlign:"center" }}>
          <a href="/appointment" style={{
            display:"inline-block",
            fontFamily:"'Plus Jakarta Sans', sans-serif",
            fontSize:"16px", fontWeight:"700",
            padding:"16px 48px", borderRadius:"50px",
            background:T.gol, color:T.wh, textDecoration:"none",
            boxShadow:`0 8px 28px ${T.gol}50`,
            transition:"transform .2s, box-shadow .2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow=`0 16px 40px ${T.gol}65`; }}
          onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=`0 8px 28px ${T.gol}50`; }}>
            Start Your Journey Today →
          </a>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TESTIMONIALS
// ══════════════════════════════════════════════════════════════════════════════
function Testimonials() {
  const reviews = [
    { name:"Priya S.",  loc:"Thane",       tag:"Skin",        stars:5, text:"I had chronic eczema for 8 years. After 3 months with Dr. Somnath, my skin cleared up completely. No steroids, no side effects — just healing." },
    { name:"Ramesh K.", loc:"Mumbai",      tag:"Respiratory", stars:5, text:"My asthma attacks went from weekly to zero in 4 months. Doctor listens deeply before prescribing anything. Truly outstanding care." },
    { name:"Anita M.",  loc:"Navi Mumbai", tag:"Digestive",   stars:5, text:"After years of digestive issues, I finally feel normal again. The treatment was gentle. I recommend Dr. Somnath to everyone I know." },
    { name:"Suresh P.", loc:"Kalyan",      tag:"Joints",      stars:5, text:"Arthritis was affecting my daily life. Homeopathy worked where everything else failed. 6 months in and I walk without pain again." },
    { name:"Meera R.",  loc:"Pune",        tag:"Stress",      stars:5, text:"Crippling anxiety for 3 years. After treatment here I feel like myself again. No dependency, no side effects. Life-changing." },
  ];

  const tagColor = { Skin:"#f3e5f5", Respiratory:"#e3f2fd", Digestive:"#e8f5e9", Joints:"#fff3e0", Stress:"#fce4ec" };
  const tagText  = { Skin:"#7b1fa2", Respiratory:"#1565c0", Digestive:"#2e7d32", Joints:"#e65100", Stress:"#c62828" };

  return (
    <section className="section-pad" style={{ padding:"100px 0", background:T.wh, overflow:"hidden" }}>
      <div className="reveal" style={{ textAlign:"center", marginBottom:"52px", padding:"0 32px" }}>
        <div style={{
          fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:"11px", fontWeight:"700",
          letterSpacing:"0.14em", textTransform:"uppercase", color:T.gol, marginBottom:"12px",
        }}>Patient Stories</div>
        <h2 style={{
          fontFamily:"'Cormorant Garamond', serif",
          fontSize:"clamp(30px, 3.8vw, 46px)", fontWeight:"700", color:T.ink, margin:0,
        }}>Real Healing, Real People</h2>
      </div>
      <div style={{
        display:"flex", gap:"22px", padding:"12px 32px 24px",
        overflowX:"auto", scrollbarWidth:"none",
      }} className="testi-wrap">
        <style>{`.testi-wrap::-webkit-scrollbar{display:none}`}</style>
        {reviews.map((r, i) => (
          <div key={i} style={{
            flexShrink:0, width:"clamp(280px, 36vw, 360px)",
            background:T.cr, borderRadius:"24px", padding:"32px 28px",
            border:"1px solid #eaf3ec", position:"relative",
          }}>
            <div style={{
              position:"absolute", top:"16px", right:"24px",
              fontFamily:"'Cormorant Garamond', serif",
              fontSize:"100px", lineHeight:1, color:`${T.g2}10`,
              userSelect:"none", pointerEvents:"none",
            }}>"</div>
            <span style={{
              display:"inline-block",
              background:tagColor[r.tag] || T.g5,
              color:tagText[r.tag] || T.g2,
              fontSize:"11px", fontWeight:"700",
              fontFamily:"'Plus Jakarta Sans', sans-serif",
              padding:"4px 12px", borderRadius:"20px",
              marginBottom:"16px", letterSpacing:"0.03em",
            }}>{r.tag}</span>
            <div style={{ color:"#f59e0b", fontSize:"14px", marginBottom:"12px" }}>
              {"★".repeat(r.stars)}
            </div>
            <p style={{
              fontFamily:"'Plus Jakarta Sans', sans-serif",
              fontSize:"14px", lineHeight:"1.8", color:T.im, margin:"0 0 24px",
            }}>"{r.text}"</p>
            <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
              <div style={{
                width:"44px", height:"44px", borderRadius:"50%", flexShrink:0,
                background:`linear-gradient(135deg, ${T.g4}, ${T.g2})`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontFamily:"'Plus Jakarta Sans', sans-serif",
                fontSize:"16px", fontWeight:"700", color:T.wh,
              }}>{r.name.charAt(0)}</div>
              <div>
                <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:"14px", fontWeight:"600", color:T.ink }}>{r.name}</div>
                <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:"12px", color:T.il }}>{r.loc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FEATURES
// ══════════════════════════════════════════════════════════════════════════════
function Features() {
  const feats = [
    { icon:"📱", title:"Online Booking",    desc:"Book appointments 24/7 from your phone. Instant confirmation + queue token."      },
    { icon:"🔢", title:"Live Queue System", desc:"Know exactly when it's your turn. No waiting room uncertainty ever again."         },
    { icon:"💊", title:"Medicine Store",    desc:"Order prescribed medicines online, delivered to your door or ready for pickup."    },
    { icon:"🔒", title:"Secure Records",    desc:"Your health history, always accessible, always private and secure."               },
  ];
  return (
    <section className="section-pad" style={{ padding:"100px 32px", background:T.cr2 }}>
      <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
        <div className="reveal" style={{ textAlign:"center", marginBottom:"60px" }}>
          <div style={{
            fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:"11px", fontWeight:"700",
            letterSpacing:"0.14em", textTransform:"uppercase", color:T.gol, marginBottom:"12px",
          }}>Our Platform</div>
          <h2 style={{
            fontFamily:"'Cormorant Garamond', serif",
            fontSize:"clamp(28px, 3.5vw, 44px)", fontWeight:"700", color:T.ink, margin:0,
          }}>Healthcare, Reimagined</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"24px" }} className="treat-grid reveal">
          {feats.map((f, i) => (
            <div key={i} style={{
              background:T.wh, borderRadius:"20px", padding:"32px",
              border:"1px solid #eaf3ec",
              display:"flex", gap:"20px", alignItems:"flex-start",
              transition:"transform .2s, box-shadow .2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 20px 48px rgba(11,61,31,.09)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="none"; }}>
              <div style={{
                width:"52px", height:"52px", flexShrink:0, borderRadius:"14px",
                background:T.g5, display:"flex", alignItems:"center",
                justifyContent:"center", fontSize:"24px",
              }}>{f.icon}</div>
              <div>
                <h3 style={{
                  fontFamily:"'Cormorant Garamond', serif",
                  fontSize:"20px", fontWeight:"600", color:T.ink, margin:"0 0 8px",
                }}>{f.title}</h3>
                <p style={{
                  fontFamily:"'Plus Jakarta Sans', sans-serif",
                  fontSize:"14px", lineHeight:"1.75", color:T.il, margin:0,
                }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CTA
// ══════════════════════════════════════════════════════════════════════════════
function CTA() {
  return (
    <section className="section-pad" style={{
      padding:"100px 32px",
      background:`linear-gradient(120deg, ${T.g1}, ${T.g3})`,
      position:"relative", overflow:"hidden",
    }}>
      <div style={{
        position:"absolute", inset:0, opacity:0.06,
        backgroundImage:`url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      <div className="reveal" style={{ maxWidth:"700px", margin:"0 auto", textAlign:"center", position:"relative", zIndex:1 }}>
        <div style={{ fontSize:"56px", marginBottom:"20px", animation:"float 4s ease-in-out infinite" }}>🌿</div>
        <h2 style={{
          fontFamily:"'Cormorant Garamond', serif",
          fontSize:"clamp(32px, 4.5vw, 56px)", fontWeight:"700",
          color:T.wh, margin:"0 0 20px", lineHeight:"1.15",
        }}>
          Ready to Start<br />
          <em style={{ fontStyle:"italic", color:T.g4 }}>Healing Naturally?</em>
        </h2>
        <p style={{
          fontFamily:"'Plus Jakarta Sans', sans-serif",
          fontSize:"17px", lineHeight:"1.75",
          color:"rgba(255,255,255,.75)", marginBottom:"44px",
        }}>
          Book your first consultation today. Your personalized healing journey
          starts with a single conversation.
        </p>
        <div style={{ display:"flex", gap:"14px", justifyContent:"center", flexWrap:"wrap" }}>
          <a href="/appointment" style={{
            fontFamily:"'Plus Jakarta Sans', sans-serif",
            fontSize:"15px", fontWeight:"700",
            padding:"16px 44px", borderRadius:"50px",
            background:T.g4, color:T.g1, textDecoration:"none",
            boxShadow:`0 8px 32px ${T.g4}50`,
            transition:"transform .2s, box-shadow .2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px) scale(1.02)"; e.currentTarget.style.boxShadow=`0 16px 48px ${T.g4}65`; }}
          onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=`0 8px 32px ${T.g4}50`; }}>
            Book Free Consultation
          </a>
          <a href="tel:+919752440622" style={{
            fontFamily:"'Plus Jakarta Sans', sans-serif",
            fontSize:"15px", fontWeight:"600",
            padding:"16px 40px", borderRadius:"50px",
            background:"rgba(255,255,255,.12)", backdropFilter:"blur(8px)",
            border:"1px solid rgba(255,255,255,.28)", color:T.wh,
            textDecoration:"none", transition:"background .2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,.22)"}
          onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,.12)"}>
            📞 +91 97524 40622
          </a>
        </div>
        <div className="cta-grid" style={{
          display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"20px", marginTop:"56px",
        }}>
          {[
            { icon:"🏥", title:"No Referral Needed", sub:"Walk in or book online"  },
            { icon:"💊", title:"Zero Side Effects",  sub:"Pure natural remedies"   },
            { icon:"🕐", title:"Mon – Sat",          sub:"9:00 AM – 6:00 PM"       },
          ].map((item, i) => (
            <div key={i} style={{
              background:"rgba(255,255,255,.1)", backdropFilter:"blur(8px)",
              border:"1px solid rgba(255,255,255,.15)",
              borderRadius:"16px", padding:"22px 18px",
            }}>
              <div style={{ fontSize:"26px", marginBottom:"10px" }}>{item.icon}</div>
              <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:"13px", fontWeight:"600", color:T.wh }}>{item.title}</div>
              <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontSize:"12px", color:"rgba(255,255,255,.55)", marginTop:"4px" }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// HOME — MAIN EXPORT (NO Navbar, NO Footer — handled globally in App.js)
// ══════════════════════════════════════════════════════════════════════════════
export default function Home() {
  useScrollReveal();
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <main>
        <Hero />
        <TrustBar />
        <About />
        <Treatments />
        <HowItWorks />
        <Testimonials />
        <Features />
        <CTA />
      </main>
    </>
  );
}