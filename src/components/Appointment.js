import { useState } from "react";

export default function Appointment() {
  const [form, setForm] = useState({
    name: "",
    age: "",
    problem: "",
    contact: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        "https://clinic-backend-mxto.onrender.com/appointments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(form)
        }
      );

      const data = await res.json();
      alert(data.message||"Appointment booked successfully!");

      //  RESET FORM
      setForm({
        name: "",
        age: "",
        problem: "",
        contact: ""
      });

    } catch (error) {
      console.log(error);
      alert("Error submitting form");
    }
  };

  return (
    <div style={{ padding: "60px 20px", background: "#f8fafc" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
        Book Appointment
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: "600px",
          margin: "auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "15px"
        }}
      >
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={form.name}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <input
          type="number"
          name="age"
          placeholder="Age"
          value={form.age}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <textarea
          name="problem"
          placeholder="Describe your problem"
          value={form.problem}
          onChange={handleChange}
          required
          style={{ ...inputStyle, gridColumn: "span 2" }}
        />

        <input
          type="text"
          name="contact"
          placeholder="Contact Number"
          value={form.contact}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <button
          style={{
            gridColumn: "span 2",
            padding: "12px",
            background: "#166534",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          Submit
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  padding: "10px",
  borderRadius: "5px",
  border: "1px solid #ccc"
};