import React from "react";
import Hero from "../components/Hero";
import Remedies from "../components/Remedies";
import Testmonials from "../components/Testmonials";
import HealthTips from "../components/HealthTips";
import About from "../components/About";
import Treatments from "../components/Treatments";
import Appointment from "../components/Appointment";
import QuickActions from "../components/QuickActions";
import DoctorProfiles from "../components/DoctorProfiles";
import FaqSection from "../components/FaqSection";

export default function Home() {
  return (
    <>
      <Hero />
      <QuickActions />
      <DoctorProfiles />
      <div id="remedies"><Remedies /></div>
      <div id="treatments"><Treatments /></div>
      <Testmonials />
      <HealthTips />
      <FaqSection />
      <div id="about"><About /></div>
      <div id="appointment"><Appointment /></div>
    </>
  );
}