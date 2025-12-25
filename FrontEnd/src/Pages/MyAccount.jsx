// File: src/Pages/MyAccount.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import "./MyAccount.css";
import usePageInstructions from "../hooks/usePageInstructions.js";

/* Safely parse medicationTimes fields which might be Array or JSON string or CSV */
function safeParseJson(value) {
  if (!value && value !== "") return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const trimmed = value.trim();
      if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || trimmed.startsWith("{")) {
        return JSON.parse(trimmed);
      }
      return trimmed.length ? trimmed.split(",").map((s) => s.trim()).filter(Boolean) : [];
    } catch {
      return value.length ? value.split(",").map((s) => s.trim()).filter(Boolean) : [];
    }
  }
  return [];
}

export default function MyAccount() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // flash card
  const [flashMember, setFlashMember] = useState(null);
  const [visible, setVisible] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const idToken = localStorage.getItem("idToken");

  usePageInstructions(() => `
    You are on your Family Health Dashboard.
    This page shows all the members you have added, along with their details such as age, relationship, and total reminders.
  `);

  // load members
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const headers = {};
        if (idToken) headers.Authorization = `Bearer ${idToken}`;
        const res = await axios.get("/api/members", { headers });
        if (!mounted) return;
        const data = res.data?.members ?? res.data ?? [];
        setMembers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load members:", err);
        if (!mounted) return;
        if (err.response) setError(`${err.response.status} ${err.response.statusText}`);
        else if (err.request) setError("Network error. Backend unreachable.");
        else setError("Unknown error.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();

    // reload if lastNewMember changes in localStorage (other tab)
    const onStorage = (e) => {
      if (e.key === "lastNewMember" || e.key === "lastShownForMember") load();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      mounted = false;
      window.removeEventListener("storage", onStorage);
    };
  }, [idToken]);

  // flash logic
  useEffect(() => {
    try {
      const fromNav = location.state?.newMember ?? null;
      if (fromNav && fromNav.id) {
        setFlashMember({ id: fromNav.id, firstName: fromNav.firstName ?? "" });
        setVisible(true);
        try {
          localStorage.setItem("lastNewMember", JSON.stringify({ id: fromNav.id, firstName: fromNav.firstName ?? "", createdAt: new Date().toISOString() }));
        } catch (e) {}
        try { window.history.replaceState({}, document.title); } catch (e) {}
        return;
      }
      const raw = localStorage.getItem("lastNewMember");
      if (raw) {
        const obj = JSON.parse(raw);
        if (obj && obj.id) {
          const lastShown = localStorage.getItem("lastShownForMember");
          if (String(lastShown) !== String(obj.id)) {
            setFlashMember({ id: obj.id, firstName: obj.firstName ?? "" });
            setVisible(true);
          }
        }
      }
    } catch (e) {
      console.warn("Flash setup failed:", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const dismissFlash = () => {
    if (flashMember?.id) {
      try { localStorage.setItem("lastShownForMember", String(flashMember.id)); } catch (e) {}
    }
    setVisible(false);
    setFlashMember(null);
  };

  const computeReminderCount = (m) => {
    try {
      const medTimes = safeParseJson(m.medicationTimes);
      const days = Number(m.days) || 0;
      return (medTimes.length || 0) * days;
    } catch {
      return 0;
    }
  };

  return (
    <>
      <Header />
      <div className="myaccount-container">
        <div className="myaccount-card">

          {/* Flash card */}
          {visible && flashMember && (
            <div className="flash-card" role="status" aria-live="polite">
              <div className="flash-content">
                <div className="flash-text">
                  <div className="flash-sub">
                     Ask <strong>"{flashMember.firstName}"</strong> to open Telegram and start the Cora Reminder Bot.
                  </div>

                  <div className="flash-instruction">
                    Click <a className="flash-link" href="https://t.me/cora_reminder_bot" target="_blank" rel="noreferrer" style={{border:"1px solid black", borderRadius:"20px", padding:"2px"}}>Open in Telegram</a>
                    &nbsp;, Enable Notifications and send <code className="flash-code">/start {flashMember.id}</code>
                  </div>

                  <div className="flash-links" aria-hidden>
                    <a className="flash-link small" href="https://play.google.com/store/apps/details?id=org.telegram.messenger&pcampaignid=web_share" target="_blank" rel="noreferrer">Play Store</a>
                    <a className="flash-link small" href="https://apps.apple.com/us/app/telegram-messenger/id686449807" target="_blank" rel="noreferrer">App Store</a>
                  </div>
                </div>

                <div>
                  <button className="flash-close" onClick={dismissFlash} aria-label="Dismiss flash">✕</button>
                </div>
              </div>
            </div>
          )}

          <div className="header-row">
            <div>
              <h2 className="page-title">👋 Your Family Health Dashboard</h2>
              <div className="small">Manage all your family members and their reminders here.</div>
            </div>

            <div>
              <button className="add-btn" onClick={() => navigate("/add-member")}>+ Add Member</button>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              <div>Loading your family members…</div>
            </div>
          ) : error ? (
            <div className="empty-state">
              <div className="error-text">Error: {error}</div>
              <div style={{ marginTop: 12 }}>
                <button className="btn btn-ghost" onClick={() => window.location.reload()}>Retry</button>
              </div>
            </div>
          ) : members.length === 0 ? (
            <div className="empty-state">
              <p>No members added yet. Click <strong>Add Member</strong> to create one.</p>
              <div style={{ marginTop: 12 }}>
                <button className="add-btn" onClick={() => navigate("/add-member")}>Add New Member</button>
              </div>
            </div>
          ) : (
            <div className="members-list" role="list">
              {members.map((m) => (
                <div key={m.id} className="member-card" role="listitem">
                  <div className="avatar" aria-hidden>
                    {m.photoUrl ? (
                      <img className="member-avatar" src={m.photoUrl} alt={`${m.firstName} ${m.lastName}`} />
                    ) : (
                      <span>{(m.firstName || "P").charAt(0)}</span>
                    )}
                  </div>

                  <div className="member-info">
                    <div className="member-name">{m.firstName} {m.lastName}</div>

                    <div className="member-meta">
                      <div><strong>ID:</strong> {m.id}</div>
                      <div><strong>Age:</strong> {m.age}</div>
                      <div><strong>Relationship:</strong> {m.relationship}</div>
                      <div><strong>Reminders:</strong> {computeReminderCount(m)}</div>
                    </div>
                  </div>

                  <div className="member-actions" aria-hidden>
                    <Link to={`/add-member/${m.id}`} state={{ member: m }} className="btn btn-ghost">Edit</Link>
                    <button
                      className="btn btn-ghost"
                      onClick={async () => {
                        if (!confirm("Delete this member?")) return;
                        try {
                          const headers = {};
                          if (idToken) headers.Authorization = `Bearer ${idToken}`;
                          await axios.delete(`/api/members/${m.id}`, { headers });
                          setMembers(prev => prev.filter(x => x.id !== m.id));
                        } catch (err) {
                          console.error("Delete failed:", err);
                          alert("Delete failed");
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
