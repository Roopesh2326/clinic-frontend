export default function Treatments() {
  const treatments = [
    "Migraine 🤕",
    "Skin Problems 🧴",
    "Digestive Issues 🍽️",
    "Allergies 🤧",
    "Chronic Diseases 🧬",
    "Hair Fall 💇‍♂️"
  ];

  return (
    <div style={{ padding: "60px 20px", background: "#f1f5f9" }}>
      <h2 style={{ textAlign: "center", marginBottom: "40px" }}>
        Treatments We Offer
      </h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",  // 🔥 FIX HERE
        gap: "20px",
        maxWidth: "900px",
        margin: "auto"
      }}>
        {treatments.map((item, index) => (
          <div key={index} style={{
            padding: "30px",
            background: "white",
            borderRadius: "10px",
            textAlign: "center",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            transition: "0.3s",
            cursor: "pointer",
          }}>
            <h3>{item}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}