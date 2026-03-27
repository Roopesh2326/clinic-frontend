export default function Testimonials() {
  const reviews = [
    "Very effective treatment, highly recommended!",
    "Doctor listens carefully and gives proper solution.",
    "Best homeopathy clinic, great results."
  ];

  return (
    <div style={{ padding: "80px 20px", background: "#f8fafc" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
        What Our Patients Say
      </h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
        maxWidth: "900px",
        margin: "auto"
      }}>
        {reviews.map((item, index) => (
          <div key={index} style={{
            padding: "20px",
            background: "white",
            borderRadius: "8px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
          }}>
            <p>"{item}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}