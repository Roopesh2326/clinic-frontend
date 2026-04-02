import React from "react";
import Hero from "../components/Hero";
import NoticeBar from "../components/NoticeBar";
import Remedies from "../components/Remedies";
import Testmonials from "../components/Testmonials";
import HealthTips from "../components/HealthTips";
import About from "../components/About";
import Treatments from "../components/Treatments";
import Appointment from "../components/Appointment";

export default function Home() {
  return (
    <>
      <NoticeBar />
      <Hero />
      <Remedies />
      <Testmonials />
      <HealthTips />
      <About />
      <Treatments />
      <Appointment />
    </>
  );
}