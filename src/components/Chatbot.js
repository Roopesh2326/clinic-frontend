import React, { useState } from "react";

export default function Chatbot() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {/* Floating Button */}
      <div
        style={styles.button}
        onClick={() => setOpen(!open)}
      >
        💬
      </div>

      {/* Chat Box */}
      {open && (
        <div style={styles.chatbox}>
          <h3>Chat with us</h3>
          <p>Hello! How can we help you?</p>

          <a
            href="https://wa.me/919752440622"
            target="_blank"
            rel="noreferrer"
          >
            <button style={styles.chatBtn}>
              Chat on WhatsApp
            </button>
          </a>
        </div>
      )}
    </div>
  );
}

const styles = {
  button: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: "#166534",
    color: "white",
    padding: "15px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "20px",
  },

  chatbox: {
    position: "fixed",
    bottom: "80px",
    right: "20px",
    width: "250px",
    background: "white",
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  },

  chatBtn: {
    marginTop: "10px",
    padding: "10px",
    width: "100%",
    background: "#25D366",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};