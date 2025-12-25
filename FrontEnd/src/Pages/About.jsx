// src/Pages/About.jsx
import React from "react";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import "./About.css";
import { FaRobot, FaUserMd, FaPills, FaLock } from "react-icons/fa";

import usePageInstructions from "../hooks/usePageInstructions.js";

export default function About() {
  // Register spoken instructions for the About page
  usePageInstructions(() => {
    return `
      You are on the About page of CORA Health.
      This page explains who we are, what we offer, and our vision.
      In the About Us section, you will find information about our mission to make healthcare smarter and more accessible.
      In What We Offer, we list features like AI Symptom Checker, Doctor Finder, Medicine Reminders, and Secure Health Records.
      In Our Vision, we describe plans for online consultations, wearable integration, and a trusted healthcare ecosystem.
      Use the header links to go back to Home, MediBot, DocMap, FAQ, or Contact Us.
      Press the Hear Instructions button in the header if you would like this message read again.
    `;
  });

  return (
    <>
      <Header />

      <main className="about-container" aria-labelledby="about-heading">
        {/* About Us */}
        <section className="about-section" aria-label="About us">
          <h2 id="about-heading" className="section-heading">About Us</h2>
          <p>
            CORA Health is a healthcare innovation project created with a simple yet powerful
            mission: to make healthcare smarter, more accessible, and patient-friendly
            through technology. In today’s world, timely medical guidance can make a huge difference,
            so we built a platform that bridges the gap between patients and doctors while ensuring
            trust, reliability, and ease of use.
          </p>
          <p>
            At the heart of CORA Health lies our belief that technology should empower people,
            not confuse them. Too often, individuals struggle to understand their symptoms,
            waste precious time searching for the right doctors, or miss doses of prescribed
            medicines due to busy schedules. CORA Health addresses all of these problems by
            combining AI intelligence, intuitive design, and secure digital infrastructure
            into one unified solution.
          </p>
        </section>

        {/* What We Offer */}
        <section className="offer-section" aria-label="What we offer">
          <h2 className="section-heading">What We Offer</h2>
          <ul>
            <li>
              <FaRobot className="icon" aria-hidden="true" />{" "}
              <strong>AI Symptom Checker</strong> – Instantly get preliminary health insights by describing your symptoms in simple language.
            </li>
            <li>
              <FaUserMd className="icon" aria-hidden="true" />{" "}
              <strong>Doctor Finder</strong> – Use our map-based search to quickly locate specialists such as cardiologists, dermatologists, neurologists, and more.
            </li>
            <li>
              <FaPills className="icon" aria-hidden="true" />{" "}
              <strong>Medicine Reminders</strong> – Never miss your prescriptions again with smart notifications that keep you on track.
            </li>
            <li>
              <FaLock className="icon" aria-hidden="true" />{" "}
              <strong>Secure Health Records</strong> – Safely store, manage, and access your personal medical history with complete privacy.
            </li>
          </ul>
        </section>

        {/* Our Vision */}
        <section className="vision-section" aria-label="Our vision">
          <h2 className="section-heading">Our Vision</h2>
          <p>
            CORA Health is not just a project, but the foundation for a larger vision. We see it evolving into a platform where people can:
          </p>
          <ul>
            <li>Instantly consult certified doctors online.</li>
            <li>Receive personalized health suggestions backed by AI and data analytics.</li>
            <li>Integrate with wearables and IoT devices for real-time health monitoring.</li>
            <li>Build a trusted ecosystem where healthcare is not a privilege, but an accessible right for everyone.</li>
          </ul>
          <p>
            By merging innovation, compassion, and reliability, we strive to create a digital
            healthcare companion that people can trust in their everyday lives.
          </p>
          <h3 className="tagline">CORA Health – Bringing healthcare closer to you.</h3>
        </section>
      </main>

      <Footer />
    </>
  );
}
