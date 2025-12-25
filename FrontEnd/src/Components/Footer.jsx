// File: src/Components/Footer.jsx
import "./Footer.css";
import { Link } from "react-router-dom";
import { FaYoutube, FaLinkedin, FaFacebook, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="div1">
        <h1>CORA Health.com</h1>
      </div>

      <div className="div2">
        <ul>
          <li><Link className="nav-link active" aria-current="page" to="/">Home</Link></li>
          <li><Link className="nav-link active" aria-current="page" to="/about">About</Link></li>
          <li><Link className="nav-link active" aria-current="page" to="/faq">FAQ</Link></li>
          <li><Link className="nav-link active" aria-current="page" to="/team">Our Team</Link></li>
          <li><Link className="nav-link active" aria-current="page" to="/contact">Contact Us</Link></li>
        </ul>
      </div>

      <div className="div3">
        <ul>
          <li><a href="#" aria-label="YouTube"><FaYoutube /></a></li>
          <li><a href="#" aria-label="LinkedIn"><FaLinkedin /></a></li>
          <li><a href="#" aria-label="Facebook"><FaFacebook /></a></li>
          <li><a href="#" aria-label="X / Twitter"><FaXTwitter /></a></li>
          <li><a href="#" aria-label="Instagram"><FaInstagram /></a></li>
        </ul>
      </div>

      <div className="div4">
        <p>Copyright © 2025 | Designed By Team CORA Health</p>
      </div>
    </footer>
  );
}
