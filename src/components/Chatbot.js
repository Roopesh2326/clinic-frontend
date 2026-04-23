import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// --- THE SMART BRAIN: Added Hinglish/Hindi Keywords ---
const BRAIN = {
  TIMING: {
    patterns: ["open", "time", "timing", "schedule", "close", "hour", "medical", "store", "samay", "vakt", "kab"],
    response: () => {
      const hour = new Date().getHours();
      const status = (hour >= 10 && hour < 20) ? "🟢 We are currently OPEN." : "🔴 We are currently CLOSED.";
      return `${status} Both our Clinic and Medical Store operate from 10:00 AM to 8:00 PM, Monday to Saturday. (Clinic aur Medical dono subah 10 se raat 8 baje tak khule hain).`;
    }
  },
  HISTORY_RECORDS: {
    patterns: ["history", "previous", "record", "receipt", "detail", "old order", "past", "raseed", "purana"],
    response: () => "Once you log in, your dashboard provides full transparency:\n• 📦 Complete Order History\n• 🧾 Downloadable Digital Receipts\n• 📅 Detailed Appointment Logs\n• 💊 Specific Medicine dosages\n\n(Aap login karke apni purani sari details aur raseed dekh sakte hain.)"
  },
  BENEFITS: {
    patterns: ["benefit", "register", "join", "account", "sign up", "why", "member", "fayda", "fayde"],
    response: () => "Registration is free and highly recommended! Here is what you get: \n• 📜 Access to Digital Health Records\n• ⚡ Instant Smart Token Generation\n• 🛒 Secure Online Medicine Ordering\n• 🕒 Track live queue position from your phone so you don't have to wait at the clinic.\n\nType 'Register Now' if you'd like to create an account!",
  },
  TOKEN: {
    patterns: ["token", "queue", "wait", "number", "turn", "line", "system", "intezar"],
    response: () => "Our Smart Token System syncs with your phone. Once you book, you get a live token number. You can track the status in real-time, so you only arrive when it's your turn! (Aap live line dekh sakte hain aur apne turn par clinic aa sakte hain.)"
  },
  GREETING: {
    patterns: ["hi", "hello", "hey", "greet", "namaste", "kaise"],
    response: () => "Namaste! I am Dr. Somnath's Virtual Assistant. How can I help you today?"
  }
};

export default function Chatbot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Greetings! I'm your Digital Health Assistant. How can I assist you today?", sender: "bot", time: new Date() }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const analyzeIntent = (text) => {
    const lowerText = text.toLowerCase();
    const words = lowerText.split(" ");
    let bestMatch = { key: null, score: 0 };

    Object.keys(BRAIN).forEach(key => {
      let score = 0;
      BRAIN[key].patterns.forEach(p => {
        if (lowerText.includes(p)) score += 2;
        words.forEach(w => { if (w === p) score += 3; }); 
      });
      if (score > bestMatch.score) bestMatch = { key, score };
    });

    return bestMatch.score > 1 ? BRAIN[bestMatch.key].response() : null;
  };

  const handleSend = async (val) => {
    const text = val || input;
    if (!text.trim()) return;

    setMessages(prev => [...prev, { text, sender: "user", time: new Date() }]);
    setInput("");
    setIsTyping(true);

    const lowerText = text.toLowerCase();
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    setTimeout(() => {
      // 1. FORCED REDIRECTION: Only on explicit "Go to" commands
      if (lowerText === "register now" || lowerText === "sign up now") {
         setMessages(prev => [...prev, { text: "Taking you to the Registration page...", sender: "bot", time: new Date() }]);
         setTimeout(() => { setIsOpen(false); navigate("/signup"); }, 1200);
      }
      // 2. SOFT INTERCEPT: Benefits (Explains first, doesn't redirect)
      else if (lowerText.includes("benefit") || lowerText.includes("fayda") || lowerText.includes("why join")) {
        const reply = BRAIN.BENEFITS.response();
        setMessages(prev => [...prev, { text: reply, sender: "bot", time: new Date() }]);
      }
      // 3. BOOKING LOGIC
      else if (lowerText.includes("book") || lowerText.includes("appointment")) {
        setMessages(prev => [...prev, { text: "Opening the Appointment booking section...", sender: "bot", time: new Date() }]);
        setTimeout(() => { setIsOpen(false); navigate("/appointment"); }, 1500);
      } 
      // 4. HISTORY LOGIC
      else if (lowerText.includes("history") || lowerText.includes("purana") || lowerText.includes("raseed")) {
        if (isLoggedIn) {
          setMessages(prev => [...prev, { text: "Opening your Order History...", sender: "bot", time: new Date() }]);
          setTimeout(() => { setIsOpen(false); navigate("/my-orders"); }, 1500);
        } else {
          setMessages(prev => [...prev, { text: "To view history, track tokens, or see receipts, you need a secure account. \n\nRegistration takes 30 seconds. Type 'Register Now' to get started!", sender: "bot", time: new Date() }]);
        }
      }
      // 5. DEFAULT BRAIN
      else {
        const reply = analyzeIntent(text) || "I'm still learning! Ask about 'Clinic Timing', 'Token System', or 'Registration Benefits'.";
        setMessages(prev => [...prev, { text: reply, sender: "bot", time: new Date() }]);
      }
      setIsTyping(false);
    }, 1000);
  };

  return (
    <>
      <div style={styles.icon} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "✕" : "💬"}
      </div>

      {isOpen && (
        <div style={styles.chatbox}>
          <div style={styles.header}>
            <div style={styles.statusDot} />
            <div style={{ flex: 1 }}>
              <b style={{ display: "block", fontSize: "14px" }}>Clinic Assistant</b>
              <small style={{ opacity: 0.8 }}>⚡ Online</small>
            </div>
          </div>

          <div style={styles.messages} ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} style={m.sender === "user" ? styles.userRow : styles.botRow}>
                <div style={m.sender === "user" ? styles.userMsg : styles.botMsg}>
                  {m.text}
                  <span style={styles.timeTag}>{m.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
            {isTyping && <div style={styles.typing}>AI is typing...</div>}
          </div>

          <div style={styles.actionRow}>
            {["Registration Benefits", "Clinic Timing", "Token System?"].map(btn => (
              <button key={btn} onClick={() => handleSend(btn)} style={styles.pill}>{btn}</button>
            ))}
          </div>

          <div style={styles.inputArea}>
            <input 
              style={styles.input} 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder="Type your question..." 
            />
            <button style={styles.send} onClick={() => handleSend()}>🚀</button>
          </div>
        </div>
      )}
      <style>{`
        @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </>
  );
}

const styles = {
  icon: { position: "fixed", bottom: "30px", right: "30px", width: "60px", height: "60px", background: "linear-gradient(135deg, #166534, #22c55e)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "24px", cursor: "pointer", zIndex: 10000, boxShadow: "0 10px 25px rgba(22, 101, 52, 0.4)" },
  chatbox: { position: "fixed", bottom: "100px", right: "30px", width: "340px", height: "500px", background: "white", borderRadius: "20px", display: "flex", flexDirection: "column", boxShadow: "0 15px 50px rgba(0,0,0,0.15)", zIndex: 10000, overflow: "hidden", border: "1px solid #f1f5f9", animation: "popIn 0.25s ease-out" },
  header: { padding: "15px 20px", background: "#166534", color: "white", display: "flex", alignItems: "center", gap: "12px" },
  statusDot: { width: "8px", height: "8px", background: "#4ade80", borderRadius: "50%", boxShadow: "0 0 10px #4ade80" },
  messages: { flex: 1, padding: "15px", overflowY: "auto", background: "#f8fafc", display: "flex", flexDirection: "column" },
  botRow: { display: "flex", justifyContent: "flex-start", marginBottom: "12px" },
  userRow: { display: "flex", justifyContent: "flex-end", marginBottom: "12px" },
  botMsg: { background: "white", padding: "12px 16px", borderRadius: "0 15px 15px 15px", maxWidth: "85%", fontSize: "13px", color: "#334155", boxShadow: "0 2px 5px rgba(0,0,0,0.05)", whiteSpace: "pre-line", lineHeight: "1.5" },
  userMsg: { background: "#166534", padding: "12px 16px", borderRadius: "15px 15px 0 15px", maxWidth: "85%", fontSize: "13px", color: "white", lineHeight: "1.5" },
  timeTag: { display: "block", fontSize: "8px", opacity: 0.5, marginTop: "5px", textAlign: "right" },
  typing: { fontSize: "11px", color: "#166534", fontStyle: "italic", padding: "0 15px 10px" },
  actionRow: { display: "flex", gap: "6px", padding: "0 15px 12px", overflowX: "auto", scrollbarWidth: "none" },
  pill: { background: "white", border: "1px solid #e2e8f0", color: "#64748b", padding: "6px 14px", borderRadius: "20px", fontSize: "11px", cursor: "pointer", whiteSpace: "nowrap", fontWeight: "600" },
  inputArea: { padding: "12px 15px", borderTop: "1px solid #f1f5f9", display: "flex", gap: "10px", alignItems: "center" },
  input: { flex: 1, border: "none", background: "#f1f5f9", padding: "10px 15px", borderRadius: "10px", outline: "none", fontSize: "13px" },
  send: { background: "none", border: "none", cursor: "pointer", fontSize: "18px" }
};