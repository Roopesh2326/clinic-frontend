import React from "react";
import Hero from "../components/Hero";
import Remedies from "../components/Remedies";
import Testmonials from "../components/Testmonials";
import HealthTips from "../components/HealthTips";
import About from "../components/About";
import Treatments from "../components/Treatments";
import Appointment from "../components/Appointment";
import Contact from "../components/Contact";
import Store from "../components/Store";

export default function Home() {
  return (
    <>
      <Hero />
      <Remedies />
      <Testmonials />
      <HealthTips />
      <About />
      <Treatments />
      <Appointment />
      <Store />
      <Contact />
    </>
  );
}