import React, { useState } from "react";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! Ask me anything about clinic 😊", user: true },
  ]);
  const [input, setInput] = useState("");

  const getReply = (msg) => {
    msg = msg.toLowerCase();

    if (msg.includes("timing"))
      return "Clinic is open from 10 AM to 6 PM";

    if (msg.includes("fee"))
      return "Consultation fee is ₹200";

    if (msg.includes("treatment"))
      return "We treat migraine, skin issues, digestion and more.";

    if (msg.includes("appointment"))
      return "You can book appointment from website or WhatsApp.";

    return "Sorry, please contact on WhatsApp for more info.";
  };

  const sendMessage = () => {
    if (!input) return;

    const userMsg = { text: input, user: true };
    const botMsg = { text: getReply(input), user: false };

    setMessages([...messages, userMsg, botMsg]);
    setInput("");
  };

  return (
    <div>
      {/* Button */}
      <div style={styles.button} onClick={() => setOpen(!open)}>
        💬
      </div>

      {open && (
        <div style={styles.chatbox}>
          <div style={styles.messages}>
            {messages.map((msg, i) => (
              <p
                key={i}
                style={{
                  textAlign: msg.user ? "right" : "left",
                  margin: "5px 0",
                }}
              >
                {msg.text}
              </p>
            ))}
          </div>

          <input
            style={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type message..."
          />

          <button style={styles.sendBtn} onClick={sendMessage}>
            Send
          </button>
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
    zIndex: 9999,
  },

  chatbox: {
    position: "fixed",
    bottom: "80px",
    right: "20px",
    width: "260px",
    background: "white",
    padding: "10px",
    borderRadius: "10px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  },

  messages: {
    maxHeight: "150px",
    overflowY: "auto",
    fontSize: "14px",
  },

  input: {
    width: "100%",
    padding: "8px",
    marginTop: "5px",
  },

  sendBtn: {
    marginTop: "5px",
    width: "100%",
    padding: "8px",
    background: "#166534",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
};