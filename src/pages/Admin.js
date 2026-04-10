import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const sanitizeObjectArray = (items) => {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => item && typeof item === "object");
};

export default function Admin() {
  const navigate = useNavigate();

  const [authChecked, setAuthChecked] = useState(false);
  const [orders, setOrders] = useState([]);
  const [newOrdersCount, setNewOrdersCount] = useState(0);

  const [seenOrderIds, setSeenOrderIds] = useState(() => {
    try {
      const raw = localStorage.getItem("seenOrderIds");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // 🔐 AUTH CHECK
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const role = (localStorage.getItem("role") || "").toLowerCase();

    if (isLoggedIn !== "true" || role !== "admin") {
      navigate("/login");
    } else {
      setAuthChecked(true);
    }
  }, [navigate]);

  // 📥 FETCH ORDERS
  useEffect(() => {
    const fetchOrders = () => {
      axios
        .get("https://clinic-backend-mxto.onrender.com/orders", {
          withCredentials: true,
        })
        .then((res) => {
          const data = sanitizeObjectArray(res.data);
          setOrders(data);

          const unseen = data.filter((o) => !seenOrderIds.includes(o._id));
          setNewOrdersCount(unseen.length);
        })
        .catch(() => setOrders([]));
    };

    fetchOrders();

    const interval = setInterval(fetchOrders, 15000);

    return () => clearInterval(interval);
  }, [seenOrderIds]);

  const safeOrders = sanitizeObjectArray(orders);

  // 💰 TOTAL REVENUE
  const totalRevenue = safeOrders.reduce(
    (sum, o) => sum + Number(o?.total || 0),
    0
  );

  // 🔔 MARK SEEN
  const markAllSeen = () => {
    const ids = safeOrders.map((o) => o._id);
    localStorage.setItem("seenOrderIds", JSON.stringify(ids));
    setSeenOrderIds(ids);
    setNewOrdersCount(0);
  };

  // 🧾 RECEIPT
  const generateReceipt = (order) => {
    const win = window.open("", "_blank");

    const itemsHtml = (order.items || [])
      .map(
        (item) =>
          `<tr>
            <td>${item.name}</td>
            <td>₹${item.price}</td>
          </tr>`
      )
      .join("");

    win.document.write(`
      <html>
        <body style="font-family: Arial; padding:20px;">
          <h2>Clinic Receipt</h2>
          <p><b>Order ID:</b> ${order._id}</p>
          <p><b>Total:</b> ₹${order.total}</p>
          <p><b>Status:</b> ${order.status || "Pending"}</p>

          <table border="1" style="width:100%; margin-top:10px;">
            <tr><th>Item</th><th>Price</th></tr>
            ${itemsHtml}
          </table>
        </body>
      </html>
    `);

    win.document.close();
    win.print();
  };

  if (!authChecked) {
    return <h3 style={{ textAlign: "center" }}>Loading...</h3>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>
        Admin Panel{" "}
        {newOrdersCount > 0 && (
          <span
            onClick={markAllSeen}
            style={{ color: "green", cursor: "pointer", marginLeft: "10px" }}
          >
            🔔 {newOrdersCount}
          </span>
        )}
      </h2>

      <h3>💰 Total Revenue: ₹{totalRevenue}</h3>

      <h3 style={{ marginTop: "20px" }}>📦 Orders</h3>

      {safeOrders.length === 0 ? (
        <p>No orders yet</p>
      ) : (
        safeOrders.map((order, i) => (
          <div
            key={i}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              margin: "10px 0",
              borderRadius: "8px",
            }}
          >
            <p><b>ID:</b> {order._id}</p>
            <p><b>Total:</b> ₹{order.total}</p>
            <p><b>Status:</b> {order.status || "Pending"}</p>

            <button onClick={() => generateReceipt(order)}>
              🧾 Print Receipt
            </button>
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