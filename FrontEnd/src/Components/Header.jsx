import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [imgError, setImgError] = useState(false);
  const utteranceRef = useRef(null);
  const dropdownRef = useRef(null);
  const navRef = useRef(null);
  const navigate = useNavigate();

  const decodeToken = (token) => {
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("idToken");
      setIsAuth(!!token);

      const payload = decodeToken(token);
      if (payload) {
        setUser({
          name: payload.name,
          sub: payload.sub,
          email: payload.email,
          picture: payload.picture,
        });
      } else {
        setUser(null);
      }
      setImgError(false); // reset image error when user changes
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);

    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  // close nav if clicking outside (mobile)
  useEffect(() => {
    const onDocClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setNavOpen(false);
      }
    };
    if (navOpen) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [navOpen]);

  // close mobile nav on resize to desktop width
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 900 && navOpen) setNavOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [navOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("idToken");
    window.dispatchEvent(new Event("storage"));
    navigate("/");
  };

  const initials = user?.name
    ? user.name.split(" ").map((x) => x[0]).join("").toUpperCase()
    : "U";

  // resolves common src formats (absolute, relative, data)
  const resolveImageSrc = (src) => {
    if (!src) return null;
    if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) {
      return src;
    }
    if (src.startsWith("/")) {
      return `${window.location.origin}${src}`;
    }
    return `${window.location.origin}/${src}`;
  };

  /* ---------------- Text-to-Speech logic ---------------- */

  const getCurrentInstructions = () => {
    try {
      if (typeof window.getCoraInstructions === "function") {
        const s = window.getCoraInstructions();
        if (typeof s === "string" && s.trim().length > 0) return s.trim();
      }
      return "No spoken instructions are available for this page. If you need help, please visit the FAQ or contact support.";
    } catch (e) {
      return "Sorry, I could not retrieve the instructions for this page.";
    }
  };

  const speakText = (text) => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    setPaused(false);

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length) {
      const en = voices.find(v => v.lang && v.lang.startsWith("en")) || voices[0];
      if (en) utter.voice = en;
    }

    utter.onstart = () => setSpeaking(true);
    utter.onend = () => { setSpeaking(false); setPaused(false); };
    utter.onerror = () => { setSpeaking(false); setPaused(false); };
    utter.onpause = () => setPaused(true);
    utter.onresume = () => setPaused(false);

    utteranceRef.current = utter;
    window.speechSynthesis.speak(utter);
  };

  const handleSpeakClick = () => {
    const text = getCurrentInstructions();
    if (!text) return;
    if (speaking && !paused) {
      window.speechSynthesis.pause();
      setPaused(true);
      return;
    } else if (speaking && paused) {
      window.speechSynthesis.resume();
      setPaused(false);
      return;
    }
    speakText(text);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  };

  useEffect(() => {
    return () => {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    };
  }, []);

  /* ---------------- end TTS logic ---------------- */

  // JSX helpers to render avatar image + fallback
  const AvatarImg = ({ size = 36, className = "" }) => {
    const src = resolveImageSrc(user?.picture);
    // If we had a previous error or no src, show initials
    if (!src || imgError) {
      return <span className={`avatar-initials ${className}`} style={{ width: size, height: size }}>{initials}</span>;
    }
    return (
      <img
        src={src}
        alt="User"
        referrerPolicy="no-referrer"
        onError={(e) => {
          // hide broken image and show initials fallback
          e.currentTarget.style.display = "none";
          setImgError(true);
        }}
        style={{ width: size, height: size, objectFit: "cover", display: "block", borderRadius: "50%" }}
        className={`avatar-img ${className}`}
      />
    );
  };

  return (
    <nav className="navbar navbar-expand-lg" style={{ padding: "10px" }}>
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          CORA Health
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          aria-controls="navbarNavDropdown"
          aria-expanded={navOpen}
          aria-label="Toggle navigation"
          onClick={(e) => {
            e.stopPropagation();
            setNavOpen(prev => !prev);
          }}
        >
          <p>MENU ☰</p>
          
        </button>

        <div
          ref={navRef}
          className={`collapse navbar-collapse ${navOpen ? "show" : ""}`}
          id="navbarNavDropdown"
        >
          <ul className="navbar-nav">
            <li className="nav-item"><Link className="nav-link" to="/" onClick={() => setNavOpen(false)}>Home</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/mb" onClick={() => setNavOpen(false)}>MediBot</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/dm" onClick={() => setNavOpen(false)}>DocMap</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/about" onClick={() => setNavOpen(false)}>About</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/faq" onClick={() => setNavOpen(false)}>FAQ</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/contact" onClick={() => setNavOpen(false)}>Contact Us</Link></li>
          </ul>
        </div>

        <div className="login" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="speak-wrap" aria-hidden={false}>
            <button
              className="speak-btn"
              onClick={handleSpeakClick}
              title="Hear instructions for this page"
              aria-pressed={speaking && !paused}
            >
              <span className="speak-icon" aria-hidden="true">🔊</span>
              <span>{ speaking ? (paused ? "Resume" : "Pause") : "Hear Instructions" }</span>
            </button>

            {speaking && (
              <div className="speak-controls" role="group" aria-label="Speech controls">
                <button className="speak-control-btn" onClick={handleStop} aria-label="Stop speaking">Stop</button>
              </div>
            )}
          </div>

          {!isAuth ? (
            <Link className="signup-btn nav-link" to="/login">Sign Up</Link>
          ) : (
            <div className="account-wrapper" ref={dropdownRef}>
              <button
                className="account-button"
                onClick={() => setOpen(!open)}
              >
                <div className="account-avatar">
                  {/* small avatar in header */}
                  <AvatarImg size={36} />
                </div>
                <span style={{ color: "#000", fontWeight: 600 }}>My Account ▾</span>
              </button>

              {open && (
                <div className="account-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">
                      {/* larger avatar inside dropdown */}
                      <AvatarImg size={60} />
                    </div>

                    <div className="dropdown-info">
                      <div className="dropdown-name">{user?.name}</div>
                      <div className="dropdown-email">{user?.email}</div>
                      <div className="dropdown-id"><b>ID:</b> {user?.sub}</div>
                    </div>
                  </div>

                  <hr />

                  <Link
                    to="/my-account"
                    className="dropdown-item"
                    onClick={() => { setOpen(false); setNavOpen(false); }}
                  >
                    View Dashboard
                  </Link>

                  <button className="dropdown-item logout" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
