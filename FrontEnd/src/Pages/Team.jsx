// src/Pages/Team.jsx
import React from "react";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import "./Team.css";
import profile from "../assets/profile.png";

import usePageInstructions from "../hooks/usePageInstructions.js";

export default function Team() {
  // Register spoken instructions for this page
  usePageInstructions(() => {
    return `
      You are on the Team page of CORA Health.
      Here you can learn about the people behind the project.
      The first card is Diwakar , a computer science student and developer focused on web development, IoT, and usable design.
      The second card is Dhruv , a programmer and designer interested in AI and web applications.
      Use the header links to return to Home, MediBot, DocMap, FAQ, or Contact Us.
      Press the Hear Instructions button again to repeat this message.
    `;
  });

  return (
    <>
      <Header />
      <main className="team-container" aria-labelledby="team-heading">
        <h1 id="team-heading" className="team-title">Our Team</h1>

        <div className="team-members">
          {/* Member 1 */}
          <article className="team-card" aria-label="Team member Diwakar Nagar">
            <div className="member-photo">
              <img src={profile} alt="Diwakar Nagar" />
            </div>
            <div className="member-name">
              <h2>Diwakar Nagar</h2>
            </div>
            <div className="member-intro">
              <p>
                A passionate Computer Science student and developer focused on
                creating innovative tech solutions. Experienced in web
                development, IoT, and creative digital design, Diwakar believes in
                merging technology with real-world usability.
              </p>
            </div>
          </article>

          {/* Member 2 */}
          <article className="team-card" aria-label="Team member Dhruv Rai">
            <div className="member-photo">
              <img src={profile} alt="Dhruv Rai" />
            </div>
            <div className="member-name">
              <h2>Dhruv Rai</h2>
            </div>
            <div className="member-intro">
              <p>
                A detail-oriented programmer and designer with a deep interest in
                AI and modern web applications. Dhruv aims to make healthcare
                smarter and more accessible through efficient and human-centered
                software.
              </p>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
