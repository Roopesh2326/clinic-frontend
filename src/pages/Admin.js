import { useEffect, useState } from "react";

export default function Admin() {
  const [data, setData] = useState([]);

  //  PROTECT ADMIN PAGE
  useEffect(() => {
    if (!localStorage.getItem("isLoggedIn")) {
      window.location.href = "/login";
    }
  }, []);

  //  FETCH DATA
  useEffect(() => {
    fetch("http://localhost:5000/appointments")
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Appointments</h2>

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

  card: {
    border: "1px solid #ddd",
    padding: "15px",
    marginBottom: "10px",
    borderRadius: "10px",
    background: "#f9fafb",
  },
};