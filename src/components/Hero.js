import React from "react";

export default function Hero() {
  return (
    <div
      style={{
        height: "80vh",
        position: "relative",
        backgroundImage:
          "url('https://images.unsplash.com/photo-1588776814546-1ffcf47267a5')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.5)", // ✅ fixed
        }}
      ></div>

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column", // ✅ fixed
          justifyContent: "center",
          alignItems: "center", // ✅ added
          height: "100%",
          color: "white",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "40px", marginBottom: "10px" }}>
          Trusted Homeopathy Care
        </h1>

        <p style={{ marginBottom: "20px" }}>
          Natural healing with personalized treatment
        </p>

        <button
          style={{
            padding: "12px 25px",
            fontSize: "16px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Book Appointment
        </button>
      </div>
    </div>
  );
}