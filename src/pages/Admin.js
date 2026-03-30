import { useEffect, useState } from "react";

export default function Admin() {
  const [data, setData] = useState([]);
  const [notice, setNotice] = useState("");

  // 🔐 PROTECT ADMIN PAGE
  useEffect(() => {
    if (!localStorage.getItem("isLoggedIn")) {
      window.location.href = "/login";
    }
  }, []);

  // 📢 UPDATE NOTICE
  const updateNotice = async () => {
    try {
      await fetch("https://clinic-backend-mxto.onrender.com/notice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: notice }),
      });

      alert("Notice updated successfully");
      setNotice(""); // clear input
    } catch (error) {
      alert("Error updating notice");
    }
  };

  // 📥 FETCH APPOINTMENTS
  useEffect(() => {
    fetch("https://clinic-backend-mxto.onrender.com/appointments")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch(() => console.log("Error fetching appointments"));
  }, []);

  return (
    <div style={styles.container}>
      
      {/* 🔥 NOTICE SECTION */}
      <h2 style={styles.heading}>Admin Panel</h2>

      <div style={styles.noticeBox}>
        <h3>Update Notice</h3>

        <input
          placeholder="Enter notice (e.g. Clinic closed today)"
          value={notice}
          onChange={(e) => setNotice(e.target.value)}
          style={styles.input}
        />

        <button style={styles.btn} onClick={updateNotice}>
          Update Notice
        </button>
      </div>

      {/* 📋 APPOINTMENTS */}
      <h3 style={{ marginTop: "30px" }}>Appointments</h3>

      {data.length === 0 ? (
        <p>No appointments yet</p>
      ) : (
        data.map((item, index) => (
          <div key={index} style={styles.card}>
            <p><b>Name:</b> {item.name}</p>
            <p><b>Age:</b> {item.age}</p>
            <p><b>Problem:</b> {item.problem}</p>
            <p><b>Contact:</b> {item.contact}</p>
          </div>
        ))
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
  },

  heading: {
    marginBottom: "20px",
    color: "#166534",
  },

  noticeBox: {
    background: "#f0fdf4",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "20px",
  },

  input: {
    padding: "10px",
    width: "300px",
    marginRight: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },

  btn: {
    padding: "10px 20px",
    background: "#166534",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },

  card: {
    border: "1px solid #ddd",
    padding: "15px",
    marginBottom: "10px",
    borderRadius: "10px",
    background: "#f9fafb",
  },
};