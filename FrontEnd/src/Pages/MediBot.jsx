// src/Pages/MediBot.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import "./MediBot.css";
import usePageInstructions from "../hooks/usePageInstructions.js";

const MEDI_SESSION_KEY = "medi_session_id";

function resolveApiBase() {
  try { if (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL; } catch {}
  try { if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL; } catch {}
  try { if (typeof window !== "undefined" && window.__env && window.__env.API_BASE) return window.__env.API_BASE; } catch {}
  return "http://localhost:5000";
}
const API_BASE = resolveApiBase();

/**
 * Keyword mapping: list of arrays of keywords (lowercased) -> specialty label
 * Extend this list as needed. Supports English, Hindi (Devanagari), Hinglish tokens.
 */
const KEYWORD_MAP = [
  { keywords: ["heart", "cardiac", "chest pain", "heart attack", "cardio", "दिल", "dil", "heartburn","cardiologist"], specialty: "Cardiologist" },
  { keywords: ["fever", "bukhar", "bukhaar", "feverish"], specialty: "General Physician" },
  { keywords: ["skin", "rash", "derma", "chamdi", "skin infection", "daane"], specialty: "Dermatologist" },
  { keywords: ["brain", "headache", "migraine", "sar dard", "sir dard", "sir dard", "माइग्रेन"], specialty: "Neurologist" },
  { keywords: ["stomach", "胃", "pet", "pet dard", "pet pain", "abdomen", "tummy", "ulcer"], specialty: "Gastroenterologist" },
  { keywords: ["child", "pediatric", "bachcha", "bacha", "kids"], specialty: "Pediatrician" },
  { keywords: ["pregnancy", "pregnant", "garbha", "delivery", "gyne"], specialty: "Gynecologist" },
  { keywords: ["diabetes", "sugar", "blood sugar", "diabetic", "shakar"], specialty: "Endocrinologist" },
  // add more mappings as needed
];

/** utility: return specialty string if any keyword matches the text */
function detectSpecialtyFromText(text) {
  if (!text) return null;
  const s = text.toLowerCase();
  for (const map of KEYWORD_MAP) {
    for (const kw of map.keywords) {
      if (!kw) continue;
      // word boundary match for short keywords; substring OK for longer phrases
      const pattern = kw.match(/\s/) ? kw : `\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`;
      const regex = new RegExp(pattern, "i");
      if (regex.test(s)) return map.specialty;
    }
  }
  return null;
}

export default function MediBot() {
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState([]); // { who: "user"|"bot", text }
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => {
    try { return localStorage.getItem(MEDI_SESSION_KEY) || ""; } catch { return ""; }
  });

  // specialty suggested based on last exchange (string or null)
  const [suggestedSpecialty, setSuggestedSpecialty] = useState(null);

  const chatRef = useRef(null);
  const navigate = useNavigate();

  // TTS instructions
  useEffect(() => {
    try {
      usePageInstructions(() => `
        You are on the MediBot page.
        Describe your symptoms...
      `);
    } catch (err) {}
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [history, loading]);

  async function sendToBot(message, sid) {
    const res = await fetch(`${API_BASE}/api/medi-bot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, session_id: sid || "" }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Server ${res.status}`);
    }
    return res.json();
  }

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    const text = (query || "").trim();
    if (!text) return;

    // optimistic display
    setHistory((h) => [...h, { who: "user", text }]);
    setQuery("");
    setLoading(true);

    // check for direct specialty keywords in user query (fast path)
    const userDetected = detectSpecialtyFromText(text);

    try {
      const data = await sendToBot(text, sessionId);

      if (data && data.session_id) {
        try { localStorage.setItem(MEDI_SESSION_KEY, data.session_id); } catch {}
        setSessionId(data.session_id);
      }

      const replyText = data && (typeof data.reply === "string" ? data.reply : (data.reply?.answer || ""));
      setHistory((h) => [...h, { who: "bot", text: replyText || "Sorry, no answer right now." }]);

      // detect specialty in bot reply or user query (prioritize explicit detection)
      const botDetected = detectSpecialtyFromText(replyText || "");
      const specialty = userDetected || botDetected || detectSpecialtyFromText(text);
      setSuggestedSpecialty(specialty);
    } catch (err) {
      console.error(err);
      setHistory((h) => [...h, { who: "bot", text: "⚠️ MediBot is currently unavailable. Try again later." }]);
      // still attempt to suggest from user text
      setSuggestedSpecialty(userDetected);
    } finally {
      setLoading(false);
    }
  };

  // when user clicks the special button, go to DocMap with specialty param
  const handleGotoDocMap = () => {
    if (!suggestedSpecialty) return;
    // navigate to DocMap route (assuming path is '/dm' or '/DocMap' — adjust to your route)
    // we used /dm in your App.jsx earlier. Add query param specialty.
    const encoded = encodeURIComponent(suggestedSpecialty);
    navigate(`/dm?specialty=${encoded}`);
  };

  // small "clear suggestion" helper if user continues conversation
  useEffect(() => {
    if (query && suggestedSpecialty) {
      // keep suggestion only if recent; if user types again reset suggestion
      setSuggestedSpecialty(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <>
      <Header />
      <div className="medi-page">
        <div className="medi-wrapper">
          <h1 className="mb-title">MediBot</h1>

          <div className="chat-area">
            <div className="chat-box" ref={chatRef} role="log" aria-live="polite">
              {history.length === 0 && !loading && (
                <div style={{ textAlign: "center", color: "#777", padding: "10px 0" }}>
                  Describe your symptom or question below 👇
                </div>
              )}

              {history.map((m, i) => (
                <div className={`chat-row ${m.who}`} key={i}>
                  <div className="label">{m.who === "user" ? "You" : "MediBot"}:</div>
                  <div className={`bubble ${m.who}`}>
                    <div className="bubble-text">{m.text}</div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="chat-row bot">
                  <div className="label">MediBot:</div>
                  <div className="bubble bot"><div className="bubble-text">MediBot is thinking…</div></div>
                </div>
              )}
            </div>

            <form className="input-row" onSubmit={handleSubmit}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe your symptoms or ask a question..."
                aria-label="MediBot input"
                disabled={loading}
              />
              <button type="submit" disabled={loading || !query.trim()}>Send</button>
            </form>

            {/* Suggestion CTA - appears when specialty detected */}
            {suggestedSpecialty && (
              <div className="suggestion-cta">
                <div className="cta-text">
                  Looks like this is related to <strong>{suggestedSpecialty}</strong>.
                </div>
                <button className="cta-button" onClick={handleGotoDocMap}>
                  Click here to find {suggestedSpecialty} in DocMap
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}
