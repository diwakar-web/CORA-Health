# CORA Health

## 🩺 Overview
**CORA Health** is an AI-enhanced, web-based healthcare assistance system designed to support users during the early stages of medical decision-making. The platform helps users understand symptoms, identify appropriate medical specialists, locate nearby doctors, manage medication schedules, and access emergency health information through a unified digital solution.

The system acts as an **early-assistance tool**, not a diagnostic or treatment platform.

---

## 🎯 Objectives
- Provide AI-based symptom understanding using natural language input  
- Recommend suitable medical specialists based on symptoms  
- Enable area-wise doctor discovery using location services  
- Improve medication adherence through automated reminders  
- Notify caretakers when medication confirmations are missed  
- Provide quick emergency access to essential medical records via QR code  

---

## 🚩 Problem Statement
Users often feel confused when symptoms appear and are unsure which type of doctor to consult. Existing platforms either provide symptom checking or doctor search, but rarely integrate both. Additionally, elderly and chronic patients frequently miss medications due to lack of monitoring.

CORA Health addresses these issues by combining **AI guidance**, **location-based doctor mapping**, and **automated reminder systems** into a single platform.

---

## ✨ Key Features
- 🤖 **AI Symptom Checker** – interprets symptoms and suggests relevant specialists  
- 🗺️ **DocMap** – finds nearby doctors using Google Maps API  
- ⏰ **Medicine Reminder System** – Telegram-based reminders with confirmation tracking  
- 👨‍👩‍👧 **Caretaker Alerts** – automatic alerts when reminders are missed  
- 🆘 **Emergency QR Health ID** – instant access to critical medical details  
- 🔐 **Secure Health Records** – encrypted storage of sensitive information  
- 👴 **Elderly-friendly UI** – simple and intuitive interface  

---

## 🏗️ System Architecture
CORA Health follows a modular, layered architecture:

- **Frontend Layer:** User interaction and UI (React / Next.js)
- **Backend Layer:** Business logic, authentication, APIs (Node.js / FastAPI)
- **AI Layer:** Symptom analysis using NLP-based models
- **Integration Layer:** Google Maps API, Telegram API
- **Data Layer:** Encrypted storage of user and health data (MongoDB / PostgreSQL)

---

## 🛠️ Technologies Used
**Frontend**
- React / Next.js  
- Tailwind CSS  

**Backend**
- Node.js / Express  
- FastAPI or Django (optional)  

**AI & APIs**
- NLP-based symptom analysis (e.g., GPT / Infermedica-style logic)  
- Google Maps API (doctor discovery)  
- Telegram Business API (reminders & alerts)  
- QR Code Generator  

**Tools**
- Git & GitHub  
- VS Code  
- Postman  

---

## 🧪 Testing
The system was tested using:
- Unit Testing  
- Integration Testing  
- System Testing  
- User Acceptance Testing (UAT)  

Tests verified symptom mapping accuracy, reminder delivery, caretaker alerts, QR code access, and map-based doctor search functionality.

---

## 📈 Results & Discussion
- Fast response time for AI symptom analysis  
- Accurate location-based doctor lookup  
- Reliable Telegram reminder and alert delivery  
- Secure and organized data storage  

**Limitations**
- Dependence on third-party APIs  
- Accuracy depends on quality of user input  
- Requires stable internet connectivity  

---

## 🔮 Future Scope
- Advanced AI symptom modeling  
- Wearable device integration  
- Teleconsultation features  
- Predictive health analytics  
- Enhanced caretaker workflows  

---

## ⚠️ Disclaimer
- This project is intended for **educational purposes only**  
- It does **not provide medical diagnosis or treatment**  
- Always consult a qualified healthcare professional for medical decisions  

---

## 👤 Contributors
- **Diwakar Nagar**  
- **Dhruv Rai**

---
⭐ CORA Health demonstrates the integration of AI, automation, and web technologies to improve early healthcare assistance.
