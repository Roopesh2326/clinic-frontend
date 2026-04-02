import React from "react";
import { Box, Container, Grid, Typography, Link } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";

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

          {/* CONTACT US */}
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
            <Box style={styles.socialIcons}>
              <a href="#" style={styles.icon}><FacebookIcon style={styles.iconColor} /></a>
              <a href="#" style={styles.icon}><TwitterIcon style={styles.iconColor} /></a>
              <a href="#" style={styles.icon}><LinkedInIcon style={styles.iconColor} /></a>
              <a href="#" style={styles.icon}><InstagramIcon style={styles.iconColor} /></a>
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
  bottom: {
    textAlign: "center",
    paddingTop: "20px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
  },
};