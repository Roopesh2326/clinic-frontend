import { useEffect, useState } from "react";

export default function Admin() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/appointments")
      .then(res => res.json())
      .then(data => setData(data));
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h2>Appointments</h2>

      {data.map((item, index) => (
        <div key={index} style={{
          border: "1px solid #ccc",
          padding: "10px",
          marginBottom: "10px"
        }}>
          <p><b>Name:</b> {item.name}</p>
          <p><b>Age:</b> {item.age}</p>
          <p><b>Problem:</b> {item.problem}</p>
          <p><b>Contact:</b> {item.contact}</p>
        </div>
      ))}
    </div>
  );
}