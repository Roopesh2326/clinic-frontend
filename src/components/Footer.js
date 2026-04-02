import React from "react";
import { Box, Container, Grid, Typography, Link } from "@mui/material";

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <Container maxWidth="lg" style={styles.containerInner}>
        <Grid container spacing={4} style={styles.gridSection}>

          {/* ABOUT US */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" style={styles.sectionTitle}>
              📋 About Us
            </Typography>
            <Typography variant="body2" style={styles.text}>
              Dr. Loknath Clinic is dedicated to providing holistic homeopathic healthcare with natural remedies. We believe in treating the root cause rather than just symptoms.
            </Typography>
            <Typography variant="body2" style={styles.text}>
              <strong>Mission:</strong> Healing with nature, caring with compassion.
            </Typography>
          </Grid>

          {/* CONTACT + QUICK LINKS SIDE BY SIDE */}
          <Grid item xs={12} md={6}>
            <Box style={styles.contactQuickWrapper}>

              {/* CONTACT */}
              <Box style={styles.contactColumn}>
                <Typography variant="h6" style={styles.sectionTitle}>
                  📞 Contact Us
                </Typography>
                <Typography style={styles.text}>📍 Delhi, India</Typography>
                <Typography style={styles.text}>📱 +91 9752-44-4444</Typography>
                <Typography style={styles.text}>✉️ info@clinic.com</Typography>
                <Typography style={styles.text}>🕐 10 AM - 6 PM, Mon-Sat</Typography>
              </Box>

              {/* QUICK LINKS */}
              <Box style={styles.quickLinksWrapper}>
                <Typography style={styles.quickLinksTitle}>
                  Quick Links
                </Typography>

                <ul style={styles.list}>
                  <li><Link href="/store" style={styles.link}>Store</Link></li>
                  <li><Link href="/remedies" style={styles.link}>Remedies</Link></li>
                  <li><Link href="/treatments" style={styles.link}>Treatments</Link></li>
                  <li><Link href="/appointment" style={styles.link}>Book Appointment</Link></li>
                  <li><Link href="/health-tips" style={styles.link}>Health Tips</Link></li>
                </ul>
              </Box>

            </Box>
          </Grid>

        </Grid>

        {/* BOTTOM */}
        <Box style={styles.bottom}>
          <Typography style={styles.text}>
            &copy; 2026 Dr. Loknath Clinic. All rights reserved.
          </Typography>
          <Typography style={styles.text}>
            Made with ❤️ by Roopesh Deep
          </Typography>
        </Box>
      </Container>
    </footer>
  );
}

const styles = {
  footer: {
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    color: "white",
    padding: "50px 0 20px",
  },

  containerInner: {
    padding: "0 20px",
  },

  gridSection: {
    marginBottom: "30px",
  },

  sectionTitle: {
    fontWeight: "700",
    marginBottom: "15px",
    color: "#4ade80",
  },

  text: {
    marginBottom: "10px",
    color: "#e2e8f0",
  },

  /* 🔥 MAIN FIX */
  contactQuickWrapper: {
    display: "flex",
    gap: "40px",
    flexWrap: "wrap",
  },

  contactColumn: {
    flex: "1",
    minWidth: "200px",
  },

  quickLinksWrapper: {
    flex: "1",
    minWidth: "200px",
    background: "rgba(255,255,255,0.05)",
    padding: "15px",
    borderRadius: "10px",
  },

  quickLinksTitle: {
    color: "#4ade80",
    fontWeight: "600",
    marginBottom: "10px",
  },

  /* 🔥 REMOVE BUTTON LOOK */
  list: {
    listStyle: "none",
    padding: 0,
  },

  link: {
    color: "#e2e8f0",
    textDecoration: "none",
    display: "block",
    marginBottom: "8px",
    transition: "0.3s",
  },

  bottom: {
    textAlign: "center",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    paddingTop: "20px",
  },
};