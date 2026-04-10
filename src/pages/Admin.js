import { useEffect, useState } from "react";
import axios from "axios";
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
  const [noticeHours, setNoticeHours] = useState("");
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
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [seenOrderIds, setSeenOrderIds] = useState(() => {
    try {
      const raw = localStorage.getItem("seenOrderIds");
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

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

      // orders from backend
      axios
        .get("https://clinic-backend-mxto.onrender.com/orders", {
          withCredentials: true,
        })
        .then((res) => setOrders(sanitizeObjectArray(res.data)))
        .catch(() => setOrders(() => setOrders([])));

      // local medicines
      setMedicines(sanitizeObjectArray(safeReadArray("medicines")));
    };

    fetchData();

    // 🔔 POLL every 15s for new orders
    const interval = setInterval(() => {
      axios
        .get("https://clinic-backend-mxto.onrender.com/orders", { withCredentials: true })
        .then((res) => {
          const fetched = sanitizeObjectArray(res.data);
          setOrders(fetched);
          // count orders admin hasn't seen yet
          const unseen = fetched.filter((o) => !seenOrderIds.includes(o._id));
          setNewOrdersCount(unseen.length);
        })
        .catch(() => {});
    }, 15000);

    window.addEventListener("storage", fetchData);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", fetchData);
    };
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
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
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
        credentials: "include",
        body: JSON.stringify({ message: notice, expiresInHours: noticeHours }),
      });
      alert("Notice updated");
      setNotice("");
      setNoticeHours("");
    } catch {
      alert("Error updating notice");
    }
  };

  const clearNotice = async () => {
    try {
      await fetch("https://clinic-backend-mxto.onrender.com/notice", {
        method: "DELETE",
        credentials: "include",
      });
      alert("Notice deleted");
      setNotice("");
      setNoticeHours("");
    } catch {
      alert("Error deleting notice");
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

  // ❌ DELETE MEDICINE
  const deleteMedicine = (index) => {
    const updated = medicines.filter((_, i) => i !== index);
    setMedicines(updated);
    localStorage.setItem("medicines", JSON.stringify(updated));
  };

  // ✏️ EDIT MEDICINE
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

  // 🧾 RECEIPT (same as user side, no jsPDF needed)
  const generateReceipt = (order) => {
    if (!order) return;
    const receiptWin = window.open("", "_blank");
    const items = Array.isArray(order.items) ? order.items : [];
    const itemsHtml = items
      .map(
        (item) =>
          `<tr>
            <td style="padding:6px 10px;">${item.name || "-"}</td>
            <td style="padding:6px 10px;">₹${item.price || 0}</td>
            <td style="padding:6px 10px;">${item.quantity || 1}</td>
          </tr>`
      )
      .join("");

    const orderId = order._id
      ? order._id.toString().slice(-6).toUpperCase()
      : String(order.id || "N/A");
    const orderDate = order.createdAt
      ? new Date(order.createdAt).toLocaleString()
      : order.date || "N/A";

    receiptWin.document.write(`
      <html>
        <head><title>Receipt #${orderId}</title></head>
        <body style="font-family: Arial, sans-serif; padding: 30px; max-width: 600px; margin: auto;">
          <h2 style="color:#166534; text-align:center;">Digital Clinic</h2>
          <p style="text-align:center; color:#555;">Order Receipt</p>
          <hr style="border-color:#166534;" />
          <p><strong>Order ID:</strong> #${orderId}</p>
          <p><strong>Date:</strong> ${orderDate}</p>
          <p><strong>Customer:</strong> ${order.userId?.name || order.userId?.email || "N/A"}</p>
          <p><strong>Payment:</strong> ${order.paymentMethod || "Cash"}</p>
          <p><strong>Status:</strong> ${order.status || "Pending"}</p>
          <table border="1" cellpadding="0" cellspacing="0"
            style="border-collapse:collapse; width:100%; margin-top:15px; font-size:14px;">
            <thead style="background:#f0fdf4;">
              <tr>
                <th style="padding:8px 10px; text-align:left;">Medicine</th>
                <th style="padding:8px 10px; text-align:left;">Price</th>
                <th style="padding:8px 10px; text-align:left;">Qty</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <h3 style="text-align:right; margin-top:15px;">Total: ₹${order.total}</h3>
          <hr />
          <p style="text-align:center; color:#888; font-size:12px;">
            Thank you for choosing Digital Clinic!
          </p>
          <script>window.onload = () => { window.print(); }<\/script>
        </body>
      </html>
    `);
    receiptWin.document.close();
  };

  // ✏️ UPDATE ORDER STATUS
  const updateOrderStatus = (orderId, newStatus) => {
    axios
      .patch(
        `https://clinic-backend-mxto.onrender.com/orders/${orderId}/status`,
        { status: newStatus },
        { withCredentials: true }
      )
      .then((res) => {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId ? { ...o, status: res.data.order?.status || newStatus } : o
          )
        );
      })
      .catch(() => alert("Failed to update order status"));
  };

  // 🔔 MARK ALL ORDERS AS SEEN
  const markAllSeen = () => {
    const allIds = safeOrders.map((o) => o._id).filter(Boolean);
    localStorage.setItem("seenOrderIds", JSON.stringify(allIds));
    setSeenOrderIds(allIds);
    setNewOrdersCount(0);
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
      <h2 style={styles.heading}>
        Admin Panel
        {newOrdersCount > 0 && (
          <span
            onClick={markAllSeen}
            title="New orders — click to mark as seen"
            style={styles.notifBell}
          >
            🔔 {newOrdersCount} New {newOrdersCount === 1 ? "Order" : "Orders"}
          </span>
        )}
      </h2>

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
        <input
          value={noticeHours}
          onChange={(e) => setNoticeHours(e.target.value)}
          placeholder="Auto delete in hours (optional)"
          style={styles.input}
        />
        <button style={styles.btn} onClick={updateNotice}>
          Update
        </button>
        <button
          style={{ ...styles.btn, marginLeft: "10px", background: "#dc2626" }}
          onClick={clearNotice}
        >
          Delete Notice
        </button>
      </div>

      {/* 👥 REGISTERED USERS */}
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

      {/* 📦 ORDERS */}
      <h3 style={{ marginTop: "30px" }}>📦 Order Management</h3>
      {safeOrders.length === 0 ? (
        <p>No orders yet</p>
      ) : (
        safeOrders.map((order, idx) => {
          const orderId = order._id
            ? order._id.toString().slice(-6).toUpperCase()
            : String(idx + 1);
          const orderDate = order.createdAt
            ? new Date(order.createdAt).toLocaleString()
            : "-";
          const isNew = !seenOrderIds.includes(order._id);

          return (
            <div
              key={order._id || idx}
              style={{
                ...styles.listCard,
                borderLeft: isNew ? "4px solid #166534" : "1px solid #ddd",
                background: isNew ? "#f0fdf4" : "#fff",
              }}
            >
              {isNew && (
                <span style={styles.newBadge}>🆕 New</span>
              )}
              <p><b>Order ID:</b> #{orderId}</p>
              <p><b>Customer:</b> {order.userId?.name || order.userId?.email || "Unknown"}</p>
              <p><b>Date:</b> {orderDate}</p>
              <p><b>Payment:</b> {order.paymentMethod || "Cash"}</p>
              <p>
                <b>Items:</b>{" "}
                {(Array.isArray(order.items) ? order.items : []).map((item, i) => (
                  <span key={i} style={{ marginRight: "8px", fontSize: "13px" }}>
                    {item.name} (₹{item.price})
                  </span>
                ))}
              </p>
              <p><b>Total:</b> ₹{order.total}</p>

              {/* STATUS DROPDOWN */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px", flexWrap: "wrap" }}>
                <label style={{ fontWeight: "bold" }}>Status:</label>
                <select
                  value={order.status || "Pending"}
                  onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                  style={styles.select}
                >
                  <option>Pending</option>
                  <option>Approved</option>
                  <option>Out for Delivery</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>
                </select>

                {/* RECEIPT BUTTON */}
                <button
                  style={{ ...styles.btn, background: "#0f6e56" }}
                  onClick={() => generateReceipt(order)}
                >
                  🧾 Print Receipt
                </button>
              </div>
            </div>
          );
        })
      )}

      {/* 💊 ADD MEDICINE */}
      <div style={styles.box}>
        <h3>Add Medicine</h3>
        <input
          placeholder="Name"
          value={newMedicine.name}
          onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
          style={styles.input}
        />
        <input
          type="number"
          min="1"
          step="1"
          placeholder="Price"
          value={newMedicine.price}
          onChange={(e) => setNewMedicine({ ...newMedicine, price: e.target.value })}
          style={styles.input}
        />
        <input type="file" onChange={handleImageSelect} />
        {imgPreview && <img src={imgPreview} alt="Medicine preview" width="80" />}
        <button style={styles.btn} onClick={addMedicine}>Add</button>
      </div>

      {/* 📋 MEDICINES LIST */}
      <h3>💊 Medicines</h3>
      {safeMedicines.length === 0 ? (
        <p>No medicines added yet</p>
      ) : (
        safeMedicines.map((m, i) => (
          <div key={i} style={styles.listCard}>
            <p><b>{m.name}</b></p>
            <p>₹{m.price}</p>
            <button style={{ ...styles.btn, marginRight: "8px" }} onClick={() => editMedicine(i)}>Edit</button>
            <button style={{ ...styles.btn, background: "#dc2626" }} onClick={() => deleteMedicine(i)}>Delete</button>
          </div>
        ))
      )}
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
    cursor: "pointer",
  },
  listCard: {
    border: "1px solid #ddd",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "8px",
    background: "#fff",
  },
  notifBell: {
    marginLeft: "15px",
    background: "#dc2626",
    color: "white",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "14px",
    cursor: "pointer",
    verticalAlign: "middle",
  },
  newBadge: {
    display: "inline-block",
    background: "#166534",
    color: "white",
    padding: "2px 8px",
    borderRadius: "10px",
    fontSize: "11px",
    marginBottom: "6px",
  },
  select: {
    padding: "6px 10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
    cursor: "pointer",
  },
};