// src/pages/Home.jsx (or wherever your Home file lives)
import React from "react";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import "./Home.css";
import { Link } from "react-router-dom";
import HomeCard from "../Components/HomeCard";
import Card from "../Components/Card";
import CORA from "../assets/CORA.png";
import gif1 from "../assets/gif1.gif";
import gif2 from "../assets/gif2.gif";
import update from "../assets/update.gif";
import reminder from "../assets/reminder.gif";
import security from "../assets/security.gif";
import market from "../assets/market.gif";

import usePageInstructions from "../hooks/usePageInstructions";

export default function Home() {
  // Register spoken instructions for this page
  usePageInstructions(() => {
    return (
      // single string — keep it simple & clear for TTS
      `Welcome to Cora Health. This is the home page of CORA, and it shows the main features:
      First card: MediBot. Press MediBot or go to the MediBot page to enter symptoms and get AI-powered health insights.
      Second card: DocMap. Press DocMap to find trusted doctors near you; you can filter by specialty and distance.
      Third card: Medicine Reminders. Set personalized medicine reminders and enable WhatsApp notifications.
      Fourth card: Secure Records. Upload prescriptions and reports safely into our website.
      Fifth card: Accessible Anywhere. Use Cora on desktop or mobile.
      Sixth card: Continuous Improvement. Provide feedback to help us improve.
      To log in, press the Log In button near the bottom. Use the header links for Home, MediBot, DocMap, About, FAQ and Contact Us.
      If you need help, open the FAQ page or contact support.`
    );
  });

  return (
    <>
      <Header />
      <HomeCard />
      <div className="box">
        <Card
          title="🤖MediBot"
          points={[
            "Enter your symptoms and get instant AI-powered health insights.",
            "Suggests possible conditions with easy-to-understand explanations.",
            "Guides you on which type of doctor or specialist to consult.",
          ]}
          img={gif2}
          link="/mb"
        />

        <Card
          className="card"
          title="🩺DocMap"
          points={[
            "Locate trusted doctors near you based on specialty (e.g., cardiologist, neurologist).",
            "Powered by Google Maps API for accurate, location-based results.",
            "Filter by distance, ratings, and availability.",
          ]}
          img={gif1}
          link="/dm"
        />
        <Card
          title="🔔Medicine Reminders"
          points={[
            "Set personalized reminders for your prescribed medicines.",
            "Get WhatsApp notifications so you never miss a dose.",
            "Caretaker alert system if reminders are repeatedly missed.",
          ]}
          img={reminder}
          link="/faq"
        />
        <Card
          title="🔒Secure Records"
          points={[
            "Upload and store prescriptions, reports, and medical history securely.",
            "End-to-end encryption ensures privacy of health data.",
            "Generate a unique emergency QR code for quick access when needed.",
          ]}
          img={security}
          link="/About"
        />
        <Card
          title="🌍Accessible Anywhere"
          points={[
            "Easy-to-use platform available anytime, anywhere.",
            "Works seamlessly across devices (desktop, mobile, tablet).",
            "Designed to be simple, reliable, and user-friendly for all age groups.",
          ]}
          img={market}
          link="/About"
        />
        <Card
          title="⚡Continuous Improvement"
          points={[
            "AI model learns and improves with every interaction.",
            "Updated medical data ensures accurate results over time.",
            "Patient feedback helps enhance performance and trust.",
          ]}
          img={update}
          link="/team"
        />
      </div>

      <div className="log">
        <Link to="/login" className="login-btn">
          Log In
        </Link>
      </div>

      <Footer />
    </>
  );
}
