import { useEffect, useState } from "react";

export default function Admin() {
  const [data, setData] = useState([]);
  const [notice, setNotice] = useState("");
  const [users, setUsers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newMedicine, setNewMedicine] = useState({ name: "", desc: "", price: "", category: "", img: "" });
  const [imgPreview, setImgPreview] = useState("");

  // 🔐 PROTECT ADMIN PAGE
  useEffect(() => {
    if (!localStorage.getItem("isLoggedIn") || localStorage.getItem("role") !== "admin") {
      window.location.href = "/login";
    }
  }, []);

  // 📢 UPDATE NOTICE
  const updateNotice = async () => {
    try {
      await fetch("https://clinic-backend-mxto.onrender.com/notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: notice }),
      });

      alert("Notice updated successfully");
      setNotice("");
    } catch {
      alert("Error updating notice");
    }
  };

  const totalPatients = data.length;
  const totalOrders = orders.length;
  const totalMedicines = medicines.length;

  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

  // 📥 FETCH DATA
  useEffect(() => {
    const fetchData = () => {
      fetch("https://clinic-backend-mxto.onrender.com/appointments")
        .then((res) => res.json())
        .then((data) => setData(data))
        .catch(() => console.log("Error fetching appointments"));

      fetch("https://clinic-backend-mxto.onrender.com/users")
        .then((res) => res.json())
        .then((data) => {
          console.log("USERS:", data);
          setUsers(data);
        })
        .catch(err => console.log(err));
      setMedicines(JSON.parse(localStorage.getItem("medicines")) || []);
      setOrders(JSON.parse(localStorage.getItem("orders")) || []);
    };

    fetchData();

    const interval = setInterval(fetchData, 2000);
    window.addEventListener("storage", fetchData);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", fetchData);
    };
  }, []);

  // ➕ ADD MEDICINE
  const addMedicine = () => {
    if (!newMedicine.name || !newMedicine.desc || !newMedicine.price || !newMedicine.category || !newMedicine.img) {
      alert("Please fill all details");
      return;
    }

    const updated = [...medicines, newMedicine];
    setMedicines(updated);
    localStorage.setItem("medicines", JSON.stringify(updated));

    setNewMedicine({ name: "", desc: "", price: "", category: "", img: "" });
    setImgPreview("");
    alert("Medicine added");
  };

  // ❌ DELETE
  const deleteMedicine = (index) => {
    const updated = medicines.filter((_, i) => i !== index);
    setMedicines(updated);
    localStorage.setItem("medicines", JSON.stringify(updated));
  };

  // ✏️ EDIT
  const editMedicine = (index) => {
    const m = medicines[index];

    const name = prompt("Edit name", m.name);
    const desc = prompt("Edit description", m.desc);
    const price = prompt("Edit price", m.price);
    const category = prompt("Edit category", m.category);

    if (!name || !price) return;

    const updated = medicines.map((item, i) =>
      i === index ? { ...item, name, desc, price, category } : item
    );

    setMedicines(updated);
    localStorage.setItem("medicines", JSON.stringify(updated));
  };

  // 🖼 IMAGE
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewMedicine({ ...newMedicine, img: reader.result });
      setImgPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  <h3 style={{ marginTop: "30px" }}>👥 Registered Users</h3>

{users.length === 0 ? (
  <p>No users found</p>
) : (
  users.map((user, index) => (
    <div key={index} style={styles.card}>
      <p><b>{user.name}</b></p>
      <p>{user.email}</p>
      <p>{user.phone}</p>
    </div>
  ))
)}

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Admin Panel</h2>

      <div style={styles.dashboard}>
  <div style={styles.card}>
    <h3>👥 Patients</h3>
    <p>{totalPatients}</p>
  </div>

  <div style={styles.card}>
    <h3>📦 Orders</h3>
    <p>{totalOrders}</p>
  </div>

  <div style={styles.card}>
    <h3>💰 Revenue</h3>
    <p>₹{totalRevenue}</p>
  </div>

  <div style={styles.card}>
    <h3>💊 Medicines</h3>
    <p>{totalMedicines}</p>
  </div>
</div>
      {/* 🔔 NOTICE */}
      <div style={styles.noticeBox}>
        <h3>Update Notice</h3>
        <input
          placeholder="Enter notice"
          value={notice}
          onChange={(e) => setNotice(e.target.value)}
          style={styles.input}
        />
        <button style={styles.btn} onClick={updateNotice}>Update</button>
      </div>

      {/* 💊 ADD MEDICINE */}
      <div style={styles.medicineBox}>
        <h3>Add Medicine</h3>

        <input placeholder="Name" value={newMedicine.name}
          onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
          style={styles.input}/>

        <input placeholder="Description" value={newMedicine.desc}
          onChange={(e) => setNewMedicine({ ...newMedicine, desc: e.target.value })}
          style={styles.input}/>

        <input placeholder="Price" value={newMedicine.price}
          onChange={(e) => setNewMedicine({ ...newMedicine, price: e.target.value })}
          style={styles.input}/>

        <input placeholder="Category" value={newMedicine.category}
          onChange={(e) => setNewMedicine({ ...newMedicine, category: e.target.value })}
          style={styles.input}/>

        <input type="file" onChange={handleImageSelect} style={styles.input} />

        {imgPreview && <img src={imgPreview} alt="preview" style={styles.imgPreview} />}

        <button style={styles.btn} onClick={addMedicine}>Add Medicine</button>
      </div>

      {/* 📋 MEDICINES LIST */}
      <h3 style={{ marginTop: "30px" }}>Registered Medicines</h3>

      {medicines.map((medicine, index) => (
        <div key={index} style={styles.card}>
          {medicine.img && <img src={medicine.img} alt={medicine.name} style={styles.medicineImg} />}

          <p><b>{medicine.name}</b></p>
          <p>{medicine.desc}</p>
          <p><strong>Category:</strong> {medicine.category}</p>
          <p>₹{medicine.price}</p>

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button onClick={() => editMedicine(index)} style={styles.smallBtn}>
              Edit
            </button>

            <button
              onClick={() => deleteMedicine(index)}
              style={{ ...styles.smallBtn, background: "red" }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: { padding: "40px" },
  heading: { color: "#166534" },

  medicineBox: {
    marginTop: "30px",
    background: "#f0fdf4",
    padding: "20px",
    borderRadius: "10px",
  },

  dashboard: {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "20px",
  marginTop: "20px",
  marginBottom: "30px",
},

card: {
  background: "linear-gradient(135deg, #166534, #22c55e)",
  color: "white",
  padding: "20px",
  borderRadius: "12px",
  textAlign: "center",
  boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
},

  noticeBox: {
    background: "#f0fdf4",
    padding: "20px",
    borderRadius: "10px",
  },

  input: {
    padding: "10px",
    width: "300px",
    marginBottom: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    display: "block",
  },

  btn: {
    padding: "10px 20px",
    background: "#166534",
    color: "white",
    border: "none",
    borderRadius: "5px",
  },

  smallBtn: {
    padding: "6px 12px",
    background: "#1d4ed8",
    color: "white",
    border: "none",
    borderRadius: "5px",
  },

  card: {
    border: "1px solid #ddd",
    padding: "15px",
    marginBottom: "10px",
    borderRadius: "10px",
  },

  medicineImg: {
    width: "80px",
    borderRadius: "8px",
    marginBottom: "8px",
  },

  imgPreview: {
    width: "100px",
    marginBottom: "10px",
  },
};