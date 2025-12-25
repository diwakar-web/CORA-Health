// src/Pages/Contact.jsx
import "./Contact.css";
import Header from "../Components/Header";
import Footer from "../Components/Footer";

import usePageInstructions from "../hooks/usePageInstructions.js";

export default function Contact() {
  // Register spoken instructions
  usePageInstructions(() => {
    return `
      You are on the Contact Us page.
      Here you can find our email addresses and phone numbers if you need help or want to share suggestions.
      You can email us or tap the phone numbers to call directly from your device.
      Thank you for helping us improve CORA Health.
      Use the header links to go back to Home or other pages.
    `;
  });

  return (
    <>
      <Header />
      <div className="contact-container">
        <div className="contact-box">
          <h1>We Welcome Your Suggestions and Reviews!</h1>

          <p className="contact-text">
            At <b>CORA Health</b>, we value your feedback and ideas to make our
            platform even better. Feel free to reach out to us through the
            following channels:
          </p>

          <div className="contact-info">
            <h3>Email Us:</h3>
            <p>
              <a href="mailto:diwakarrajeshnagar@gmail.com">
                diwakarrajeshnagar@gmail.com
              </a>
            </p>
            <p>
              <a href="mailto:dhruvrai2804@gmail.com">
                dhruvrai2804@gmail.com
              </a>
            </p>

            <h3>Contact Numbers:</h3>
            <p>
              <a href="tel:9906251573">+91 9906251573</a>
            </p>
            <p>
              <a href="tel:9369803223">+91 9369803223</a>
            </p>
          </div>

          <p className="thank-text">
            Thank you for taking the time to share your thoughts — your feedback
            helps us grow and improve!
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
