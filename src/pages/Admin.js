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

const sanitizeObjectArray = (items) => {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => item && typeof item === "object");
};

export default function Admin() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [appointments, setAppointments] = useState([]);
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
  const [userSearch, setUserSearch] = useState("");

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
        .then((res) => (res.ok ? res.json() : []))
        .then((payload) => setAppointments(sanitizeObjectArray(payload)))
        .catch(() => setAppointments([]));

      // users
      fetch("https://clinic-backend-mxto.onrender.com/users", {
        credentials: "include",
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((payload) => setUsers(sanitizeObjectArray(payload)))
        .catch(() => setUsers([]));

      // local
      setMedicines(sanitizeObjectArray(safeReadArray("medicines")));
      setOrders(sanitizeObjectArray(safeReadArray("orders")));
    };

    fetchData();
    window.addEventListener("storage", fetchData);

    return () => window.removeEventListener("storage", fetchData);
  }, []);

  // 📊 SAFE DATA
  const safeOrders = sanitizeObjectArray(Array.isArray(orders) ? orders : []);
  const safeUsers = sanitizeObjectArray(Array.isArray(users) ? users : []);

  const safeAppointments = sanitizeObjectArray(appointments);
  const safeMedicines = sanitizeObjectArray(medicines);
  const filteredUsers = safeUsers.filter((user) => {
    const q = userSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      String(user?.name || "").toLowerCase().includes(q) ||
      String(user?.email || "").toLowerCase().includes(q) ||
      String(user?.phone || "").toLowerCase().includes(q) ||
      String(user?.role || "").toLowerCase().includes(q)
    );
  });
  const totalPatients = safeAppointments.length;
  const totalOrders = safeOrders.length;
  const totalMedicines = safeMedicines.length;
  const totalAdmins = safeUsers.filter((u) => u.role === "admin").length;

  const totalRevenue = safeOrders.reduce(
    (sum, order) => sum + Number(order?.total || 0),
    0
  );

  const exportUsersCsv = () => {
    if (!safeUsers.length) {
      alert("No users to export");
      return;
    }

    const headers = ["Name", "Email", "Phone", "Role", "User ID", "Joined Date"];
    const rows = safeUsers.map((u) => [
      u.name || "",
      u.email || "",
      u.phone || "",
      u.role || "",
      u._id || "",
      u.createdAt ? new Date(u.createdAt).toLocaleString() : "",
    ]);
    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `registered-users-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

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
    const m = safeMedicines[index];
    if (!m) return;

    const name = prompt("Edit name", m.name);
    const price = prompt("Edit price", m.price);

    if (!name || !price) return;

    const updated = safeMedicines.map((item, i) =>
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
        <div style={styles.dashboardCard}>
          <h3>🛡️ Admin Accounts</h3>
          <p>{totalAdmins}</p>
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
      <div style={styles.box}>
        <input
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          placeholder="Search user by name/email/phone/role"
          style={styles.input}
        />
        <button style={styles.btn} onClick={exportUsersCsv}>
          Export Users CSV
        </button>
      </div>

      {filteredUsers.length === 0 ? (
        <p>No users found</p>
      ) : (
        filteredUsers.map((user, index) => (
          <div key={index} style={styles.listCard}>
            <p><b>Name:</b> {user.name || "-"}</p>
            <p><b>Email:</b> {user.email || "-"}</p>
            <p><b>Phone:</b> {user.phone || "-"}</p>
            <p><b>Role:</b> {user.role || "-"}</p>
            <p><b>User ID:</b> {user._id || "-"}</p>
            <p><b>Joined:</b> {user.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}</p>
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

        {imgPreview && <img src={imgPreview} alt="Medicine preview" width="80" />}

        <button onClick={addMedicine}>Add</button>
      </div>

      {/* 📋 MEDICINES */}
      <h3>Medicines</h3>
      {safeMedicines.map((m, i) => (
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