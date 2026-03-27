import React from "react";
import Hero from "../components/Hero";
import About from "../components/About";
import Treatments from "../components/Treatments";
import Appointment from "../components/Appointment";
import Contact from "../components/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Treatments />
      <Appointment />
      <Contact />
    </>
  );
}