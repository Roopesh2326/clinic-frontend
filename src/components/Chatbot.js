import React, { useState } from "react";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");

  const options = [
    "Clinic Timing",
    "Consultation Fees",
    "Available Treatments",
    "Contact Doctor"
  ];

  //  BOT LOGIC
  const getBotReply = (text) => {
    text = text.toLowerCase();

    if (text.includes("time") || text.includes("timing")) return "Clinic is open from 10 AM to 8 PM.";
    if (text.includes("fee") || text.includes("fees")) return "Consultation fee is ₹200.";
    if (text.includes("treatment"))
      return "We treat skin, digestion, stress and more.";
    if (text.includes("contact") || text.includes("call"))
      return "Contact on WhatsApp: 9752440622";

    return "Sorry, I didn't understand. Please choose an option.";
  };

  //  OPTION CLICK
  const handleOptionClick = (option) => {
    const reply = getBotReply(option);

    setMessages([
      ...messages,
      { text: option, sender: "user" },
      { text: reply, sender: "bot" }
    ]);
  };

  //  SEND MESSAGE
  const handleSend = () => {
    if (!input.trim()) return;

    const reply = getBotReply(input);

    setMessages([
      ...messages,
      { text: input, sender: "user" },
      { text: reply, sender: "bot" }
    ]);

    setInput("");
  };

  return (
    <>
      {/* ICON */}
      <div style={styles.icon} onClick={() => setIsOpen(!isOpen)}>
        💬
      </div>

      {/* CHATBOX */}
      {isOpen && (
        <div style={styles.chatbox}>
          <h4>Chat with us</h4>

          <div style={styles.messages}>
            {messages.map((msg, i) => (
              <p
                key={i}
                style={{
                  textAlign: msg.sender === "user" ? "right" : "left"
                }}
              >
                {msg.text}
              </p>
            ))}
          </div>

          {/* OPTIONS */}
          <div style={styles.options}>
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleOptionClick(opt)}
                style={styles.optionBtn}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* 🔥 INPUT BOX */}
          <div style={styles.inputBox}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              style={styles.input}
            />

            <button onClick={handleSend} style={styles.sendBtn}>
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  icon: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "60px",
    height: "60px",
    background: "#166534",
    color: "white",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    cursor: "pointer",
    zIndex: 9999
  },

  chatbox: {
    position: "fixed",
    bottom: "90px",
    right: "20px",
    width: "300px",
    background: "white",
    borderRadius: "10px",
    padding: "10px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
    zIndex: 9999
  },

  messages: {
    height: "150px",
    overflowY: "auto",
    fontSize: "14px",
    marginBottom: "10px"
  },

  options: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    marginBottom: "10px"
  },

  optionBtn: {
    padding: "6px",
    borderRadius: "6px",
    border: "none",
    background: "#166534",
    color: "white",
    cursor: "pointer",
    fontSize: "12px"
  },

  inputBox: {
    display: "flex",
    gap: "5px"
  },

  input: {
    flex: 1,
    padding: "6px",
    borderRadius: "6px",
    border: "1px solid #ccc"
  },

  sendBtn: {
    padding: "6px 10px",
    border: "none",
    background: "#166534",
    color: "white",
    borderRadius: "6px",
    cursor: "pointer"
  }
};