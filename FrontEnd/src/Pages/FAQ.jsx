// src/Pages/FAQ.jsx
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import "./FAQ.css";
import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

import usePageInstructions from "../hooks/usePageInstructions.js";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  // Register spoken instructions for FAQ
  usePageInstructions(() => {
    return `
      You are on the Frequently Asked Questions page.
      Tap or click any question to expand it and hear the answer.
      Tap the question again to collapse it.
      Use this page to learn about CORA Health, MediBot, DocMap, security, features, and how to use the platform.
      If you still need help, go to the Contact Us page from the header.
    `;
  });

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "1. What is CORA Health?",
      answer:
        "CORA Health is a digital healthcare platform that helps users connect with doctors, find nearby healthcare facilities, and receive smart health assistance through AI-powered features.",
    },
    {
      question: "2. How does CORA Health help patients?",
      answer:
        "CORA Health bridges the gap between patients and doctors by offering features like MediBot, DocMap, and appointment scheduling in one unified system.",
    },
    {
      question: "3. Is CORA Health free to use?",
      answer:
        "Yes, most features like MediBot and DocMap are completely free to use. Premium features may be added later for extended services.",
    },
    {
      question: "4. How do I find doctors nearby?",
      answer:
        "You can use our 'Find Medical Experts' feature powered by Google Maps to quickly locate healthcare professionals based on specialization and pincode.",
    },
    {
      question: "5. What is MediBot?",
      answer:
        "MediBot is CORA Health’s intelligent chatbot designed to provide instant responses to health-related queries and guide you to suitable specialists.",
    },
    {
      question: "6. Is my data safe on CORA Health?",
      answer:
        "Absolutely. We use advanced encryption and secure servers to protect all user data and maintain complete privacy of health information.",
    },
    {
      question: "7. Do I need to sign up to use CORA Health?",
      answer:
        "You can explore some features without signing up, but creating an account unlocks personalized recommendations and health tracking features.",
    },
    {
      question: "8. Can I book appointments through CORA Health?",
      answer:
        "Yes, you can directly connect and book appointments with doctors available in your area using the integrated DocMap feature.",
    },
    {
      question: "9. What is DocMap?",
      answer:
        "DocMap is a feature of CORA Health that uses map-based search to help users find hospitals, clinics, and doctors nearby in real time.",
    },
    {
      question: "10. Can I access CORA Health on mobile?",
      answer:
        "Yes, CORA Health is fully responsive and mobile-friendly, allowing you to access all features seamlessly on your smartphone or tablet.",
    },
    {
      question: "11. How is CORA Health different from other platforms?",
      answer:
        "Unlike typical health websites, CORA Health integrates AI, real-time maps, and smart reminders, focusing on simplicity, reliability, and user privacy.",
    },
    {
      question: "12. Does CORA Health provide emergency help?",
      answer:
        "While CORA Health helps you find nearby doctors and hospitals, it is not an emergency response service. In emergencies, contact local authorities or hospitals directly.",
    },
    {
      question: "13. Who developed CORA Health?",
      answer:
        "CORA Health was developed by a team of passionate computer science students who wanted to make healthcare accessible and smarter using technology.",
    },
    {
      question: "14. How can I contact CORA Health support?",
      answer:
        "You can reach our support team via the 'Contact Us' page or by emailing us directly through the contact information provided on the website.",
    },
  ];

  return (
    <>
      <Header />
      <div className="faq-container">
        <h2 className="faq-title">Frequently Asked Questions</h2>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div
              className={`faq-item ${openIndex === index ? "open" : ""}`}
              key={index}
            >
              <div
                className="faq-question"
                onClick={() => toggleFAQ(index)}
                role="button"
                aria-expanded={openIndex === index}
              >
                <h3>{faq.question}</h3>
                {openIndex === index ? (
                  <FaChevronUp className="icon" />
                ) : (
                  <FaChevronDown className="icon" />
                )}
              </div>

              {openIndex === index && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
