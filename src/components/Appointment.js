import { useState } from "react";

export default function Appointment() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const savedName = localStorage.getItem("name") || "";
  const savedPhone = localStorage.getItem("phone") || "";
  const savedEmail = localStorage.getItem("email") || "";

  const [form, setForm] = useState({
    name: savedName,
    age: "",
    problem: "",
    contact: savedPhone,
    date: "",
    time: "",
    email: savedEmail,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookedToken, setBookedToken] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ Include userId if user is logged in so history can be fetched later
      const userId = localStorage.getItem("userId") || null;

      const payload = {
        ...form,
        userId,
        bookedAt: new Date().toISOString(),
      };

      const res = await fetch(
        "https://clinic-backend-mxto.onrender.com/appointment",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      let data;
      try { data = await res.json(); } catch { data = {}; }

      if (!res.ok) {
      alert(data?.message || data?.error || "Could not book appointment");
  return;
}

// NEW: save token from response
      setBookedToken(data.tokenStr || null);
      setSuccess(true);
      setForm({ name: savedName, age: "", problem: "", contact: savedPhone, date: "", time: "", email: savedEmail });
      setTimeout(() => { setSuccess(false); setBookedToken(null); }, 6000);

    } catch (error) {
      console.error(error);
      alert("Error submitting form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get tomorrow as min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div id="appointment" style={styles.wrapper}>
      <div style={styles.container}>

        {/* HEADER */}
        <div style={styles.header}>
          <h2 style={styles.title}>📅 Book an Appointment</h2>
          <p style={styles.subtitle}>
            Fill in your details and we'll confirm your appointment shortly.
          </p>
          {isLoggedIn && (
            <div style={styles.loggedInBadge}>
              ✅ Logged in — your appointment will be saved to your account
            </div>
          )}
        </div>

        {/* SUCCESS MESSAGE */}
        {success && (
          <div style={styles.successBox}>
            <div style={{ fontSize: "16px", marginBottom: "8px" }}>✅ Appointment booked successfully!</div>
            {bookedToken && (
              <div style={{ marginTop: "10px", display: "inline-block", background: "white", border: "2px solid #166534", borderRadius: "10px", padding: "10px 24px" }}>
                <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Your Queue Token</div>
                <div style={{ fontSize: "32px", fontWeight: "700", color: "#166534", letterSpacing: "0.05em" }}>{bookedToken}</div>
                <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>Show this token at the clinic</div>
              </div>
            )}
            <div style={{ fontSize: "13px", color: "#555", marginTop: "10px" }}>We'll contact you to confirm your appointment.</div>
          </div>
)}
        {/* FORM */}
        <form onSubmit={handleSubmit} style={styles.form}>

          {/* Row 1 */}
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Full Name *</label>
              <input
                type="text" name="name" placeholder="Enter your full name"
                value={form.name} onChange={handleChange} required
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Age *</label>
              <input
                type="number" name="age" placeholder="Your age"
                value={form.age} onChange={handleChange} required min="1" max="120"
                style={styles.input}
              />
            </div>
          </div>

          {/* Row 2 */}
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Contact Number *</label>
              <input
                type="tel" name="contact" placeholder="Your phone number"
                value={form.contact} onChange={handleChange} required
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Email (optional)</label>
              <input
                type="email" name="email" placeholder="Your email address"
                value={form.email} onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          {/* Row 3 */}
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Preferred Date *</label>
              <input
                type="date" name="date" value={form.date}
                onChange={handleChange} required min={minDate}
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Preferred Time *</label>
              <select name="time" value={form.time} onChange={handleChange} required style={styles.input}>
                <option value="">Select a time slot</option>
                <option value="09:00">9:00 AM</option>
                <option value="09:30">9:30 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="10:30">10:30 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="11:30">11:30 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="14:00">2:00 PM</option>
                <option value="14:30">2:30 PM</option>
                <option value="15:00">3:00 PM</option>
                <option value="15:30">3:30 PM</option>
                <option value="16:00">4:00 PM</option>
                <option value="16:30">4:30 PM</option>
                <option value="17:00">5:00 PM</option>
              </select>
            </div>
          </div>

          {/* Problem */}
          <div style={{ ...styles.field, gridColumn: "span 2" }}>
            <label style={styles.label}>Describe Your Problem *</label>
            <textarea
              name="problem" placeholder="Please describe your symptoms or reason for visit..."
              value={form.problem} onChange={handleChange} required rows={4}
              style={{ ...styles.input, resize: "vertical" }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "⏳ Booking..." : "📅 Book Appointment"}
          </button>
        </form>

        {/* INFO */}
        <div style={styles.infoRow}>
          <div style={styles.infoBox}>
            <span style={{ fontSize: "20px" }}>📞</span>
            <div>
              <div style={styles.infoTitle}>Call us directly</div>
              <div style={styles.infoText}>+91 97524 40622</div>
            </div>
          </div>
          <div style={styles.infoBox}>
            <span style={{ fontSize: "20px" }}>🕐</span>
            <div>
              <div style={styles.infoTitle}>Clinic hours</div>
              <div style={styles.infoText}>Mon–Sat: 9 AM – 6 PM</div>
            </div>
          </div>
          <div style={styles.infoBox}>
            <span style={{ fontSize: "20px" }}>📍</span>
            <div>
              <div style={styles.infoTitle}>Location</div>
              <div style={styles.infoText}>Visit us at the clinic</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    padding: "60px 20px",
    background: "linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%)",
  },
  container: {
    maxWidth: "760px",
    margin: "0 auto",
    background: "white",
    borderRadius: "16px",
    padding: "40px",
    boxShadow: "0 4px 24px rgba(22,101,52,0.1)",
  },
  header: { textAlign: "center", marginBottom: "32px" },
  title: { color: "#166534", fontSize: "28px", fontWeight: "700", margin: "0 0 8px" },
  subtitle: { color: "#6b7280", fontSize: "15px", margin: "0 0 12px" },
  loggedInBadge: {
    display: "inline-block",
    background: "#dcfce7", color: "#166534",
    padding: "6px 16px", borderRadius: "20px",
    fontSize: "13px", fontWeight: "600",
  },
  successBox: {
    background: "#dcfce7", color: "#166534",
    border: "1px solid #86efac",
    borderRadius: "10px", padding: "14px 20px",
    marginBottom: "24px", textAlign: "center",
    fontWeight: "600", fontSize: "15px",
  },
  form: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  row: {
    display: "contents",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px", fontWeight: "600",
    color: "#374151",
  },
  input: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1.5px solid #d1d5db",
    fontSize: "14px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  submitBtn: {
    gridColumn: "span 2",
    padding: "14px",
    background: "linear-gradient(135deg, #166534, #16a34a)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "700",
    marginTop: "8px",
  },
  infoRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    marginTop: "32px",
    borderTop: "1px solid #e5e7eb",
    paddingTop: "24px",
  },
  infoBox: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "12px", background: "#f8fafc",
    borderRadius: "10px",
  },
  infoTitle: { fontSize: "12px", color: "#888", fontWeight: "600" },
  infoText: { fontSize: "13px", color: "#111", fontWeight: "600" },
};