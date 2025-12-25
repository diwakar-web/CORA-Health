// File: src/Pages/AddMember.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AddMember.css";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import usePageInstructions from "../hooks/usePageInstructions.js";

// decode JWT-lite (clientside)
function decodeJwt(token) {
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

// parse possible medicationTimes shapes
function safeParseJson(value) {
  if (!value && value !== "") return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const t = value.trim();
      if ((t.startsWith("[") && t.endsWith("]")) || t.startsWith("{")) return JSON.parse(t);
      return t.length ? t.split(",").map(s => s.trim()).filter(Boolean) : [];
    } catch {
      return value.length ? value.split(",").map(s => s.trim()).filter(Boolean) : [];
    }
  }
  return [];
}

// image compression helper (optional)
function compressImage(file, maxWidth = 1200, quality = 0.7) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
        const dataUrl = canvas.toDataURL(mime, quality);
        resolve(dataUrl);
      } catch (e) {
        reject(e);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

export default function AddMember() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const preloaded = location.state?.member || null;
  const isEdit = Boolean(id);

  const idToken = localStorage.getItem("idToken");
  const decoded = decodeJwt(idToken);
  const loggedInEmail = decoded?.email || "";

  const [form, setForm] = useState({
    photoUrl: "",
    firstName: "",
    lastName: "",
    age: "",
    sex: "",
    phone: "",
    address: "",
    relationship: "",
    medication: "",
    timesPerDay: "",
    days: "",
    medicationTimes: [],
    sonEmail: loggedInEmail || "",
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  usePageInstructions(() => `
    Add Member page. Upload optional photo, enter member details and medication schedule.
    Press Save to add or Update to edit existing member.
  `);

  // load member when editing
  useEffect(() => {
    if (!isEdit) return;

    if (preloaded) {
      const loadedTimes = safeParseJson(preloaded.medicationTimes ?? []);
      const count = preloaded.timesPerDay ? Number(preloaded.timesPerDay) : loadedTimes.length || 0;

      setForm({
        photoUrl: preloaded.photoUrl || preloaded.photo || "",
        firstName: preloaded.firstName || "",
        lastName: preloaded.lastName || "",
        age: preloaded.age ?? "",
        sex: preloaded.sex || "",
        phone: preloaded.phone || "",
        address: preloaded.address || "",
        relationship: preloaded.relationship || "",
        medication: preloaded.medication || "",
        timesPerDay: String(count || ""),
        days: preloaded.days ?? "",
        medicationTimes: loadedTimes.length ? loadedTimes : Array(count).fill(""),
        sonEmail: preloaded.sonEmail || loggedInEmail || "",
      });

      setPhotoPreview(preloaded.photoUrl || preloaded.photo || null);
      return;
    }

    const loadMember = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const headers = idToken ? { Authorization: `Bearer ${idToken}` } : {};
        const res = await axios.get(`/api/members/${id}`, { headers });
        const data = res.data?.member || res.data || {};
        const loadedTimes = safeParseJson(data.medicationTimes ?? []);
        const count = data.timesPerDay ? Number(data.timesPerDay) : loadedTimes.length || 0;

        setForm({
          photoUrl: data.photoUrl || data.photo || "",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          age: data.age ?? "",
          sex: data.sex || "",
          phone: data.phone || "",
          address: data.address || "",
          relationship: data.relationship || "",
          medication: data.medication || "",
          timesPerDay: String(count || ""),
          days: data.days ?? "",
          medicationTimes: loadedTimes.length ? loadedTimes : Array(count).fill(""),
          sonEmail: data.sonEmail || loggedInEmail || "",
        });
        setPhotoPreview(data.photoUrl || data.photo || null);
      } catch (err) {
        console.error("Failed to load member:", err);
        setLoadError(err.response ? `${err.response.status} ${err.response.statusText}` : "Network error");
      } finally {
        setLoading(false);
      }
    };

    loadMember();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit, preloaded]);

  // generic change handler
  const change = (e) => {
    const { name, value } = e.target;
    if (name === "timesPerDay") {
      const count = Number(value) || 0;
      setForm(prev => {
        const arr = Array.isArray(prev.medicationTimes) ? prev.medicationTimes.slice(0, count) : [];
        while (arr.length < count) arr.push("");
        return { ...prev, timesPerDay: value, medicationTimes: arr };
      });
      return;
    }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const changeTime = (index, value) => {
    setForm(prev => {
      const updated = [...prev.medicationTimes];
      updated[index] = value;
      return { ...prev, medicationTimes: updated };
    });
  };

  // handle file input
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 1200, 0.7);
      if (compressed) {
        setForm(prev => ({ ...prev, photoUrl: compressed }));
        setPhotoPreview(compressed);
      }
    } catch (err) {
      console.error("image compress failed", err);
    }
  };

  // validation
  const validate = () => {
    const e = {};
    if (!form.firstName?.trim()) e.firstName = "First name required.";
    if (!form.lastName?.trim()) e.lastName = "Last name required.";
    if (!form.age || Number(form.age) <= 0) e.age = "Valid age required.";
    if (!form.sex) e.sex = "Select sex.";
    if (!/^\d{10}$/.test(form.phone || "")) e.phone = "Enter 10-digit phone.";
    if (!form.address?.trim()) e.address = "Address required.";
    if (!form.relationship?.trim()) e.relationship = "Relation required.";
    if (!form.medication?.trim()) e.medication = "Medication required.";
    if (!form.days || Number(form.days) <= 0) e.days = "Valid days required.";
    if (!form.timesPerDay || Number(form.timesPerDay) <= 0) e.timesPerDay = "Times/day required.";
    if (!form.sonEmail) e.sonEmail = "Unable to read your login email. Please re-login.";

    const count = Number(form.timesPerDay) || 0;
    if (!Array.isArray(form.medicationTimes) || form.medicationTimes.length !== count)
      e.medicationTimes = "Set medication times.";
    else if (form.medicationTimes.some(t => !t))
      e.medicationTimes = "All medication times required.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // save/create member
  const save = async () => {
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      const headers = idToken ? { Authorization: `Bearer ${idToken}` } : {};
      let res;
      if (isEdit) {
        res = await axios.put(`/api/members/${id}`, form, { headers });
      } else {
        res = await axios.post(`/api/members`, form, { headers });
      }

      if (res.data?.success) {
        const member = res.data.member;
        // store fallback for MyAccount
        try {
          localStorage.setItem("lastNewMember", JSON.stringify({ id: member.id, firstName: member.firstName, createdAt: new Date().toISOString() }));
        } catch (e) { /* ignore */ }

        // navigate with state so MyAccount always shows the card after create/update
        navigate("/my-account", { state: { newMember: member } });
      } else {
        setErrors(s => ({ ...s, global: res.data?.message || "Save failed (no reason from server)" }));
      }
    } catch (err) {
      console.error("Save error:", err);
      setErrors(s => ({ ...s, global: err.response?.data?.message || "Server error" }));
    }
  };

  const clearForm = () => {
    setForm({
      photoUrl: "",
      firstName: "",
      lastName: "",
      age: "",
      sex: "",
      phone: "",
      address: "",
      relationship: "",
      medication: "",
      timesPerDay: "",
      days: "",
      medicationTimes: [],
      sonEmail: loggedInEmail || "",
    });
    setPhotoPreview(null);
    setErrors({});
  };

  return (
    <>
      <Header />
      <div className="addmember-wrap redesigned">
        <h2 className="addmember-title">{isEdit ? "Edit Family Member" : "Add New Family Member"}</h2>

        <div className="addmember-card redesigned-card">
          <div className="left-col">
            <label className="field-label">Photo (optional)</label>
            <div className="photo-uploader">
              {photoPreview ? (
                <img src={photoPreview} alt="preview" className="photo-preview" />
              ) : (
                <div className="photo-placeholder">PNG / JPG</div>
              )}

              <input type="file" accept="image/png, image/jpeg, image/jpg, image/webp" onChange={handleFile} className="file-input" />
              {errors.photo && <div className="error">{errors.photo}</div>}
            </div>

            <label className="field-label">Medication Details</label>
            <input className="text-input" type="text" name="medication" value={form.medication} onChange={change} />
            {errors.medication && <div className="error">{errors.medication}</div>}

            <div className="row-two">
              <div>
                <label className="field-label">For how many days *</label>
                <input className="text-input" type="number" name="days" min="1" value={form.days} onChange={change} />
                {errors.days && <div className="error">{errors.days}</div>}
              </div>

              <div>
                <label className="field-label">Times per day *</label>
                <input className="text-input" type="number" name="timesPerDay" min="1" value={form.timesPerDay} onChange={change} />
                {errors.timesPerDay && <div className="error">{errors.timesPerDay}</div>}
              </div>
            </div>

            {form.medicationTimes.length > 0 && (
              <div className="times-grid">
                {form.medicationTimes.map((t, i) => (
                  <div key={i} className="time-row">
                    <label className="field-label">Time #{i + 1}</label>
                    <input className="text-input" type="time" value={t} onChange={(e) => changeTime(i, e.target.value)} />
                  </div>
                ))}
                {errors.medicationTimes && <div className="error">{errors.medicationTimes}</div>}
              </div>
            )}
          </div>

          <div className="right-col">
            {loading && <div className="info-text">Loading member...</div>}
            {loadError && <div className="error">{loadError}</div>}

            <label className="field-label">First Name *</label>
            <input className="text-input" type="text" name="firstName" value={form.firstName} onChange={change} />
            {errors.firstName && <div className="error">{errors.firstName}</div>}

            <label className="field-label">Last Name *</label>
            <input className="text-input" type="text" name="lastName" value={form.lastName} onChange={change} />
            {errors.lastName && <div className="error">{errors.lastName}</div>}

            <label className="field-label">Age *</label>
            <input className="text-input" type="number" name="age" min="0" value={form.age} onChange={change} />
            {errors.age && <div className="error">{errors.age}</div>}

            <label className="field-label">Sex *</label>
            <select className="text-input" name="sex" value={form.sex} onChange={change}>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.sex && <div className="error">{errors.sex}</div>}

            <label className="field-label">Phone (10 digits) *</label>
            <input className="text-input" type="tel" name="phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} />
            {errors.phone && <div className="error">{errors.phone}</div>}

            <label className="field-label">Relation *</label>
            <input className="text-input" type="text" name="relationship" value={form.relationship} onChange={change} />
            {errors.relationship && <div className="error">{errors.relationship}</div>}

            <label className="field-label">Address *</label>
            <textarea className="text-input textarea" name="address" rows="3" value={form.address} onChange={change} />
            {errors.address && <div className="error">{errors.address}</div>}

            {errors.global && <div className="error">{errors.global}</div>}

            <div className="form-actions redesigned-actions">
              <button type="button" className="save-btn" onClick={save}>
                {isEdit ? "Update" : "Save"}
              </button>
              {!isEdit && (
                <button type="button" className="clear-btn" onClick={clearForm}>
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
