import React, { useEffect, useState } from "react";

export default function NoticeBar() {
    const [notice, setNotice] = useState("");

    useEffect(() => {
        fetch("https://clinic-backend-mxto.onrender.com/notice")
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data && data.message) {
                    setNotice(data.message);
                }
            })
            .catch(() => setNotice(""));
    }, []);

    if (!notice) return null;

    return (
        <div style={styles.bar}>
           📢 {notice}
        </div>
    );
}

const styles = {
    bar: {
        background: "#166534",
        color: "white",
        padding: "12px 10px",
        textAlign: "center",
        fontSize: "14px",
        fontWeight: "600",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    },
};