import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const safeReadArray = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function Admin() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [data, setData] = useState([]);
  const [notice, setNotice] = useState("");
  const [users, setUsers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newMedicine, setNewMedicine] = useState({
    name: "",
    desc: "",
    price: "",
    category: "",
    img: "",
  });
  const [imgPreview, setImgPreview] = useState("");

  // 🔐 PROTECT ADMIN
  useEffect(() => {
    try {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      const role = (localStorage.getItem("role") || "").toLowerCase().trim();
      if (isLoggedIn !== "true" || role !== "admin") {
        navigate("/login", { replace: true });
        return;
      }
      setAuthChecked(true);
    } catch {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // 📥 FETCH DATA
  useEffect(() => {
    const fetchData = () => {
      // appointments
      fetch("https://clinic-backend-mxto.onrender.com/appointments", {
        credentials: "include",
      })
        .then((res) => {
          if (!res.ok) throw new Error("Unauthorized");
          return res.json();
        })
        .then((data) => setData(Array.isArray(data) ? data : []))
        .catch(() => setData([]));

      // users
      fetch("https://clinic-backend-mxto.onrender.com/users")
        .then((res) => res.json())
        .then((data) => setUsers(Array.isArray(data) ? data : []))
        .catch(() => setUsers([]));

      // local
      setMedicines(safeReadArray("medicines"));
      setOrders(safeReadArray("orders"));
    };

    fetchData();
    window.addEventListener("storage", fetchData);

    return () => window.removeEventListener("storage", fetchData);
  }, []);

  // 📊 SAFE DATA
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeUsers = Array.isArray(users) ? users : [];

  const totalPatients = data.length;
  const totalOrders = safeOrders.length;
  const totalMedicines = medicines.length;

  const totalRevenue = safeOrders.reduce(
    (sum, order) => sum + Number(order?.total || 0),
    0
  );

  // 📢 NOTICE
  const updateNotice = async () => {
    try {
      await fetch("https://clinic-backend-mxto.onrender.com/notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: notice }),
      });
      alert("Notice updated");
      setNotice("");
    } catch {
      alert("Error updating notice");
    }
  };

  // ➕ ADD MEDICINE
  const addMedicine = () => {
    if (!newMedicine.name || !newMedicine.price) {
      alert("Fill required fields");
      return;
    }

    const updated = [...medicines, newMedicine];
    setMedicines(updated);
    localStorage.setItem("medicines", JSON.stringify(updated));

    setNewMedicine({ name: "", desc: "", price: "", category: "", img: "" });
    setImgPreview("");
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
    const price = prompt("Edit price", m.price);

    if (!name || !price) return;

    const updated = medicines.map((item, i) =>
      i === index ? { ...item, name, price } : item
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
  console.log("DATA:", data);
  console.log("USERS:", users);
  console.log("ORDERS:", orders);

  if (!authChecked) {
    return (
      <div style={{ padding: "30px", textAlign: "center" }}>
        <h3>Loading admin dashboard...</h3>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Admin Panel</h2>

      {/* 📊 DASHBOARD */}
      <div style={styles.dashboard}>
        <div style={styles.dashboardCard}>
          <h3>👥 Patients</h3>
          <p>{totalPatients}</p>
        </div>

        <div style={styles.dashboardCard}>
          <h3>📦 Orders</h3>
          <p>{totalOrders}</p>
        </div>

        <div style={styles.dashboardCard}>
          <h3>💰 Revenue</h3>
          <p>₹{totalRevenue}</p>
        </div>

        <div style={styles.dashboardCard}>
          <h3>💊 Medicines</h3>
          <p>{totalMedicines}</p>
        </div>
      </div>

      {/* 🔔 NOTICE */}
      <div style={styles.box}>
        <h3>Update Notice</h3>
        <input
          value={notice}
          onChange={(e) => setNotice(e.target.value)}
          placeholder="Enter notice"
          style={styles.input}
        />
        <button style={styles.btn} onClick={updateNotice}>
          Update
        </button>
      </div>

      {/* 👥 USERS (FIXED INSIDE RETURN) */}
      <h3 style={{ marginTop: "30px" }}>👥 Registered Users</h3>

      {safeUsers.length === 0 ? (
        <p>No users found</p>
      ) : (
        safeUsers.map((user, index) => (
          <div key={index} style={styles.listCard}>
            <p><b>{user.name}</b></p>
            <p>{user.email}</p>
            <p>{user.phone}</p>
          </div>
        ))
      )}

      {/* 💊 ADD MEDICINE */}
      <div style={styles.box}>
        <h3>Add Medicine</h3>

        <input
          placeholder="Name"
          value={newMedicine.name}
          onChange={(e) =>
            setNewMedicine({ ...newMedicine, name: e.target.value })
          }
          style={styles.input}
        />

        <input
          placeholder="Price"
          value={newMedicine.price}
          onChange={(e) =>
            setNewMedicine({ ...newMedicine, price: e.target.value })
          }
          style={styles.input}
        />

        <input type="file" onChange={handleImageSelect} />

        {imgPreview && <img src={imgPreview} width="80" />}

        <button onClick={addMedicine}>Add</button>
      </div>

      {/* 📋 MEDICINES */}
      <h3>Medicines</h3>
      {medicines.map((m, i) => (
        <div key={i} style={styles.listCard}>
          <p>{m.name}</p>
          <p>₹{m.price}</p>

          <button onClick={() => editMedicine(i)}>Edit</button>
          <button onClick={() => deleteMedicine(i)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: { padding: "30px" },
  heading: { color: "#166534" },

  dashboard: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },

  dashboardCard: {
    background: "#166534",
    color: "white",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
  },

  box: {
    marginTop: "20px",
    padding: "20px",
    background: "#f0fdf4",
    borderRadius: "10px",
  },

  input: {
    display: "block",
    margin: "10px 0",
    padding: "10px",
  },

  btn: {
    padding: "10px",
    background: "#166534",
    color: "white",
    border: "none",
  },

  listCard: {
    border: "1px solid #ddd",
    padding: "10px",
    marginTop: "10px",
  },
};