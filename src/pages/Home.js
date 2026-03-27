import React from "react";
import Hero from "../components/Hero";
import About from "../components/About";
import Treatments from "../components/Treatments";
import Appointment from "../components/Appointment";
import Contact from "../components/Contact";
import Testmonials from "../components/Testmonials";
import Remedies from "../components/Remedies";
import Store from "../components/Store";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Treatments />
      <Appointment />
      <Remedies />
      <Store />
      <Testmonials /> 
      <Contact />
    </>
  );
}