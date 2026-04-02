import { useEffect, useState } from "react";

export default function Admin() {
  const [data, setData] = useState([]);
  const [notice, setNotice] = useState("");
  const [users, setUsers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newMedicine, setNewMedicine] = useState({ name: "", desc: "", price: "", img: "" });
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: notice }),
      });

      alert("Notice updated successfully");
      setNotice("");
    } catch (error) {
      alert("Error updating notice");
    }
  };

  // 📥 FETCH DATA
  useEffect(() => {
    const fetchData = () => {
      fetch("https://clinic-backend-mxto.onrender.com/appointments")
        .then((res) => res.json())
        .then((data) => setData(data))
        .catch(() => console.log("Error fetching appointments"));

      const loadedUsers = JSON.parse(localStorage.getItem("users")) || [];
      setUsers(loadedUsers);

      const loadedMedicines = JSON.parse(localStorage.getItem("medicines")) || [];
      setMedicines(loadedMedicines);

      const loadedOrders = JSON.parse(localStorage.getItem("orders")) || [];
      setOrders(loadedOrders);
    };

    fetchData();

    // 🔄 Real-time updates - check every 2 seconds for new orders
    const interval = setInterval(fetchData, 2000);

    // Also listen for storage changes from other tabs
    const onStorage = () => fetchData();
    window.addEventListener("storage", onStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const addMedicine = () => {
    if (!newMedicine.name || !newMedicine.desc || !newMedicine.price || !newMedicine.img) {
      alert("Please fill all medicine details and upload an image");
      return;
    }

    const updated = [...medicines, { ...newMedicine }];
    setMedicines(updated);
    localStorage.setItem("medicines", JSON.stringify(updated));
    setNewMedicine({ name: "", desc: "", price: "", img: "" });
    setImgPreview("");
    alert("Medicine added successfully");
  };

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

  const viewReceipt = (order) => {
    const receipt = window.open("", "_blank");
    const itemsHtml = order.items
      .map((item) => `<tr><td>${item.name}</td><td>${item.price}</td><td>${item.desc || "-"}</td></tr>`)
      .join("");

    receipt.document.write(`
      <html>
      <head><title>Receipt #${order.id}</title></head>
      <body style="font-family: Arial, sans-serif; padding:20px;">
        <h2>Clinic Shop Receipt</h2>
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Date:</strong> ${order.date}</p>
        <p><strong>Payment:</strong> ${order.paymentMethod}</p>
        <p><strong>Total:</strong> ₹${order.total}</p>
        <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;">
          <thead><tr><th>Medicine</th><th>Price</th><th>Description</th></tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p><strong>Status:</strong> ${order.status}</p>
      </body>
      </html>
    `);
    receipt.document.close();
    receipt.focus();
    receipt.print();
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Admin Panel</h2>
      <p style={styles.subTitle}>Registered users: {users.length} | Registered medicines: {medicines.length} | Orders placed: {orders.length} | Total sales: ₹{totalSales}</p>

      {/* 🔔 ORDER NOTIFICATIONS */}
      <div style={styles.notificationBox}>
        <h3>Order Notifications</h3>
        {orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          orders.slice(-5).reverse().map((order, index) => (
            <div key={index} style={styles.notificationItem}>
              <strong>#{order.id} just placed</strong> • ₹{order.total} • {order.items.length} item(s)
              <button onClick={() => viewReceipt(order)} style={styles.smallBtn}>Receipt</button>
            </div>
          ))
        )}
      </div>

      {/* 🔥 NOTICE SECTION */}
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

      {/* 👥 REGISTERED USERS */}
      <h3 style={{ marginTop: "30px" }}>Registered Users</h3>
      {users.length === 0 ? (
        <p>No registered users yet.</p>
      ) : (
        users.map((user, index) => (
          <div key={index} style={styles.card}>
            <p><b>{user.name}</b> ({user.role})</p>
            <p>{user.email}</p>
            <p>{user.phone}</p>
          </div>
        ))
      )}

      {/* 💰 TOTAL BUYING HISTORY */}
      <h3 style={{ marginTop: "30px" }}>Total Buying History</h3>
      {orders.length === 0 ? (
        <p>No orders placed yet.</p>
      ) : (
        orders.map((order, index) => (
          <div key={index} style={styles.card}>
            <p><b>Order #{order.id}</b></p>
            <p><strong>Date:</strong> {order.date}</p>
            <p><strong>Method:</strong> {order.paymentMethod}</p>
            <p><strong>Total:</strong> ₹{order.total}</p>
            <p><strong>Items:</strong> {order.items.map(item => item.name).join(", ")}</p>
            <button onClick={() => viewReceipt(order)} style={styles.smallBtn}>Download Receipt</button>
          </div>
        ))
      )}

      {/* 💊 MANAGE MEDICINES */}
      <div style={styles.medicineBox}>
        <h3>Add New Medicine</h3>

        <input
          placeholder="Name"
          value={newMedicine.name}
          onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
          style={styles.input}
        />

        <input
          placeholder="Description"
          value={newMedicine.desc}
          onChange={(e) => setNewMedicine({ ...newMedicine, desc: e.target.value })}
          style={styles.input}
        />

        <input
          placeholder="Price (₹)"
          value={newMedicine.price}
          onChange={(e) => setNewMedicine({ ...newMedicine, price: e.target.value })}
          style={styles.input}
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          style={styles.input}
        />

        {imgPreview && (
          <img src={imgPreview} alt="Preview" style={styles.imgPreview} />
        )}

        <button style={styles.btn} onClick={addMedicine}>Add Medicine</button>
      </div>

      {medicines.length > 0 && (
        <>
          <h3 style={{ marginTop: "30px" }}>Registered Medicines</h3>
          {medicines.map((medicine, index) => (
            <div key={index} style={styles.card}>
              {medicine.img && <img src={medicine.img} alt={medicine.name} style={styles.medicineImg} />}
              <p><b>{medicine.name}</b></p>
              <p>{medicine.desc}</p>
              <p>₹{medicine.price}</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
  },

  heading: {
    marginBottom: "10px",
    color: "#166534",
  },

  subTitle: {
    marginBottom: "20px",
    color: "#065f46",
  },

  notificationBox: {
    background: "#d1fae5",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
  },

  notificationItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
    padding: "8px",
    border: "1px solid #a7f3d0",
    borderRadius: "6px",
    background: "white",
  },

  card: {
    border: "1px solid #ddd",
    padding: "15px",
    marginBottom: "10px",
    borderRadius: "10px",
    background: "#f9fafb",
  },

  medicineBox: {
    marginTop: "30px",
    background: "#f0fdf4",
    padding: "20px",
    borderRadius: "10px",
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
    cursor: "pointer",
  },

  smallBtn: {
    padding: "6px 12px",
    background: "#1d4ed8",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },

  medicineImg: {
    width: "80px",
    height: "80px",
    objectFit: "cover",
    borderRadius: "8px",
    marginBottom: "8px",
  },

  imgPreview: {
    width: "120px",
    height: "120px",
    objectFit: "cover",
    borderRadius: "8px",
    marginBottom: "10px",
  },
};