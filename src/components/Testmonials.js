import React from "react";
import Slider from "react-slick";

export default function Testimonials() {

  const data = [
    {
      review: "Homeopathy has significantly improved my quality of life. I'm grateful for the natural approach.",
      name: "Sarah M",
      img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
    },
    {
      review: "Excellent treatment! My migraine reduced within weeks.",
      name: "Rahul Sharma",
      img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop"
    },
    {
      review: "I was skeptical at first, but homeopathy worked wonders for my allergies.",
      name: "Emily R",
      img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop"
    },
    {
      review: "The doctor was very attentive and the remedies were effective. Highly recommend!",
      name: "Priya K",
      img: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop"    
    },
    {
      review: "Very caring doctor and effective medicines. Highly recommended!",
      name: "Priya Singh",
      img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop"
    }
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <div style={styles.section}>
      <h2 style={styles.heading}>Testimonials</h2>

      <div style={{ maxWidth: "1100px", margin: "auto" }}>
        <Slider {...settings}>
          {data.map((item, index) => (
            <div key={index}>
              <div style={styles.container}>
                <div data-aos="fade-right">
                  
                </div>
                <div style={styles.content}>
                  <p style={styles.review}>
                    {item.review}
                  </p>
                  <p style={styles.author}>{item.name}</p>
                </div>

                <div style={styles.profileContainer}>
                  <img
                    src={item.img}
                    alt={item.name}
                    style={styles.profileImage}
                  />
                  <p style={styles.profileName}>{item.name}</p>
                </div>

              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}

const styles = {
  section: {
    padding: "80px 20px",
    background: "#f8fafc",
  },

  heading: {
    fontSize: "36px",
    fontWeight: "700",
    textAlign: "left",
    marginBottom: "50px",
    color: "#166534",
    maxWidth: "1100px",
    margin: "0 auto 50px",
  },

  container: {
    display: "flex",
    alignItems: "center",
    gap: "40px",
    flexWrap: "wrap",
  },

  content: {
    flex: "1",
    minWidth: "300px",
  },

  review: {
    fontSize: "16px",
    lineHeight: "1.8",
    color: "#555",
    marginBottom: "20px",
  },

  author: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#166534",
  },

  profileContainer: {
    flex: "1",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: "200px",
  },

  profileImage: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: "15px",
    background: "#e6f4ea",
    padding: "5px",
    border: "3px solid #e6f4ea",
  },

  profileName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#166534",
  },
};