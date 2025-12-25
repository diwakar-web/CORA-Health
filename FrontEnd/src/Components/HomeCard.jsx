import { Link } from "react-router-dom";
import "./HomeCard.css"
export default function HomeCard() {
    return(<div className="main">
        <h1>
            Welcome to CORA Health, Where Smarter Healthcare Begins.
        </h1>
        <div className="main-button">
            <h1>
            Check Symptoms Instantly, Find Trusted Doctors Nearby, And Manage Your Health With Ease — All In One Place.
        </h1>
        <button >
            <Link className="nav-link" to="/">
                Get Started
              </Link>
        </button>

        </div>
        <div className="ribbon">
      <div className="ribbon-track">
        <div className="ribbon-content">
          🤖 AI Symptom Checker – Get quick health insights.🩺 Doctor Finder – Connect with the right specialist. 🔔 Medicine Reminders – Never miss a dose again. 🔒 Secure Records – Your health data, fully protected.
        </div>
        <div className="ribbon-content">
          🤖 AI Symptom Checker – Get quick health insights. 🩺 Doctor Finder – Connect with the right specialist. 🔔 Medicine Reminders – Never miss a dose again. 🔒 Secure Records – Your health data, fully protected.
        </div>
      </div>
    </div>

    <div className="more">
        <h1>
            Because your health deserves clarity, trust, and care — all in one place.

        </h1>  
        
    </div>
    </div>)
}