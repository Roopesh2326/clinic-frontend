import React from "react";
import { Box, Container, Grid, Typography, Link } from "@mui/material";

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <Container maxWidth="lg" style={styles.containerInner}>
        <Grid container spacing={4} style={styles.gridSection}>
          {/* ABOUT US */}
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" style={styles.sectionTitle}>
              📋 About Us
            </Typography>
            <Typography variant="body2" style={styles.text}>
              Dr. Loknath Clinic is dedicated to providing holistic homeopathic healthcare with natural remedies. We believe in treating the root cause rather than just symptoms. Our experienced practitioners are committed to your wellness journey.
            </Typography>
            <Typography variant="body2" style={styles.text}>
              <strong>Mission:</strong> Healing with nature, caring with compassion.
            </Typography>
          </Grid>

          {/* CONTACT + QUICK SECTION */}
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" style={styles.sectionTitle}>
              📞 Contact Us
            </Typography>
            <Typography variant="body2" style={styles.text}>
              📍 Delhi, India
            </Typography>
            <Typography variant="body2" style={styles.text}>
              📱 +91 9752-44-4444
            </Typography>
            <Typography variant="body2" style={styles.text}>
              ✉️ info@clinic.com
            </Typography>
            <Typography variant="body2" style={styles.text}>
              🕐 10 AM - 6 PM, Mon-Sat
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box style={styles.quickLinksWrapperStandalone}>
              <Typography variant="h6" style={styles.quickLinksTitle}>Quick Links</Typography>
              <ul style={styles.quickLinksBulletList}>
                <li><Link href="/store" style={styles.quickLink}>Store</Link></li>
                <li><Link href="/remedies" style={styles.quickLink}>Remedies</Link></li>
                <li><Link href="/treatments" style={styles.quickLink}>Treatments</Link></li>
                <li><Link href="/appointment" style={styles.quickLink}>Book Appointment</Link></li>
                <li><Link href="/health-tips" style={styles.quickLink}>Health Tips</Link></li>
              </ul>
            </Box>
          </Grid>
        </Grid>

        {/* BOTTOM */}
        <Box style={styles.bottom}>
          <Typography variant="body2" style={styles.text}>
            &copy; 2026 Dr. Loknath Clinic. All rights reserved.
          </Typography>
          <Typography variant="body2" style={styles.text}>
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
    padding: "50px 0 20px 0",
    marginTop: "60px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
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
    fontSize: "18px",
  },
  text: {
    marginBottom: "12px",
    lineHeight: "1.6",
    color: "#e2e8f0",
  },
  socialIcons: {
    display: "flex",
    gap: "12px",
    marginTop: "12px",
  },
  icon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  iconColor: {
    color: "#4ade80",
    fontSize: "24px",
  },
  contactQuickWrapper: {
    display: "flex",
    gap: "26px",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  contactQuickColumn: {
    flex: "1 1 260px",
  },
  quickLinksWrapper: {
    flex: "1 1 240px",
    background: "rgba(255,255,255,0.06)",
    borderRadius: "12px",
    padding: "14px",
    border: "1px solid rgba(255,255,255,0.17)",
  },
  quickLinksTitle: {
    fontSize: "16px",
    color: "#4ade80",
    marginBottom: "10px",
    fontWeight: 700,
  },
  quickLinksRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  quickLinksWrapperStandalone: {
    background: "rgba(255,255,255,0.06)",
    borderRadius: "12px",
    padding: "18px",
    border: "1px solid rgba(255,255,255,0.17)",
  },
  quickLinksRowWrap: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  quickLink: {
    color: "#e2e8f0",
    background: "rgba(77, 220, 135, 0.16)",
    border: "1px solid rgba(77, 220, 135, 0.3)",
    borderRadius: "8px",
    padding: "8px 14px",
    fontWeight: 600,
    textDecoration: "none",
    transition: "all 0.2s ease",
    display: "inline-block",
  },
  quickLinksBulletList: {
    listStyleType: "disc",
    margin: "8px 0 0 20px",
    padding: 0,
    color: "#e2e8f0",
    lineHeight: 1.8,
  },
  quickLinkHover: {
    background: "rgba(77, 220, 135, 0.32)",
  },
  bottom: {
    textAlign: "center",
    paddingTop: "20px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
  },
};