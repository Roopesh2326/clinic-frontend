import React, { useEffect, useState } from "react";

export default function NoticeBar() {
    const [notice, setNotice] = useState("");

    useEffect(() => {
        fetch("https://clinic-backend-mxto.onrender.com/notice")
            .then((res) => res.json())
            .then((data) => {
                if (data) setNotice(data.message);
            })
            .catch(() => console.log("Error fetching notice"));
    }), [];

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
        padding: "10px",
        textAlign: "center",
        fontsize: "14px",
    },
};