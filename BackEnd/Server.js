// server.js — safer verbose version for debugging
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Sequelize, DataTypes } = require("sequelize");

const app = express();

// Basic global error handlers so crashes are visible in logs
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err && err.stack ? err.stack : err);
});
process.on("unhandledRejection", (reason, p) => {
  console.error("UNHANDLED REJECTION at:", p, "reason:", reason);
});

// Print a minimal env summary (no secrets)
console.log("Starting server.js");
console.log("NODE_ENV:", process.env.NODE_ENV || "undefined");
console.log("PORT:", process.env.PORT || 5000);
console.log("FRONTEND_ORIGIN:", process.env.FRONTEND_ORIGIN || "http://localhost:5173");
console.log("GOOGLE_CLIENT_ID present?:", !!process.env.GOOGLE_CLIENT_ID);
console.log("DB_HOST:", process.env.DB_HOST || "127.0.0.1");
console.log("DB_PORT:", process.env.DB_PORT || 3306);
console.log("DB_NAME:", process.env.DB_NAME || "coraHealth");

// Optional Google verification
let OAuth2Client, googleClient;
try {
  OAuth2Client = require("google-auth-library").OAuth2Client;
  if (process.env.GOOGLE_CLIENT_ID) {
    googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    console.log("Google verification enabled (GOOGLE_CLIENT_ID found).");
  } else {
    console.log("GOOGLE_CLIENT_ID not set — running in dev mode (no verification).");
  }
} catch (e) {
  console.log("google-auth-library not installed — running in dev mode.");
}

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ---------------- Integrate MediBot (converted from nlp/server.js) ----------------
try {
  console.log("Attempting to load ./medibot/botRoutes ...");
  const initMediBot = require("./medibot/botRoutes");
  if (typeof initMediBot === "function") {
    try {
      initMediBot(app);
      console.log("medibot/botRoutes loaded and initialized.");
    } catch (err) {
      console.error("medibot/botRoutes initialization threw an error:", err && err.stack ? err.stack : err);
    }
  } else {
    console.warn("mediBot/botRoutes did not export a function. MediBot not initialized.");
  }
} catch (err) {
  console.error("Failed to load MediBot module (require failed):", err && err.stack ? err.stack : err);
}
// ----------------------------------------------------------------------------------

// ---------------- Sequelize (MySQL) ----------------
const sequelize = new Sequelize(
  process.env.DB_NAME || "coraHealth",
  process.env.DB_USER || "root",
  process.env.DB_PASS || "0000",
  {
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    dialect: "mysql",
    logging: (msg) => {
      // Only log important messages to avoid noise
      console.log("[Sequelize]", msg);
    },
  }
);

// Member model
const Member = sequelize.define(
  "Member",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.STRING, allowNull: false },
    sonEmail: { type: DataTypes.STRING, allowNull: true },
    photoUrl: { type: DataTypes.TEXT("medium") },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    age: { type: DataTypes.INTEGER, allowNull: false },
    sex: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.TEXT, allowNull: false },
    relationship: { type: DataTypes.STRING, allowNull: false },
    medication: { type: DataTypes.STRING, allowNull: false },
    days: { type: DataTypes.INTEGER, allowNull: false },
    timesPerDay: { type: DataTypes.INTEGER, allowNull: false },
    medicationTimes: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        const raw = this.getDataValue("medicationTimes");
        return raw ? JSON.parse(raw) : [];
      },
      set(val) {
        this.setDataValue("medicationTimes", JSON.stringify(val || []));
      },
    },
  },
  {
    tableName: "members",
    timestamps: true,
  }
);

// Helper: verify token
async function verifyIdToken(idToken) {
  if (!idToken) return null;
  if (googleClient) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      return payload || null;
    } catch (err) {
      console.error("Google verify failed:", err && err.message ? err.message : err);
      return null;
    }
  }
  try {
    const parts = idToken.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(base64, "base64").toString("utf8");
    const obj = JSON.parse(json);
    return obj || null;
  } catch (err) {
    console.error("Dev token parse failed:", err && err.message ? err.message : err);
    return null;
  }
}

function normalizeMedicationTimes(input) {
  if (!input && input !== "") return [];
  if (Array.isArray(input)) return input;
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return [];
    try {
      if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || trimmed.startsWith("{")) {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (err) {}
    return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function isDataImageUrl(s) {
  return typeof s === "string" && s.startsWith("data:image/");
}

// Routes (same as your file)
app.get("/health", (req, res) => res.json({ ok: true }));
app.get("/api/members", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const payload = (await verifyIdToken(token)) || { sub: "dev-guest" };
    const userId = payload.sub || "dev-guest";
    const members = await Member.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });
    res.json({ members });
  } catch (err) {
    console.error("GET /api/members error:", err && err.stack ? err.stack : err);
    res.status(500).json({ message: "Server error" });
  }
});
app.post("/api/members", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const payload = (await verifyIdToken(token)) || { sub: "dev-guest" };
    const userId = payload.sub || "dev-guest";
    const sonEmailFromToken = payload.email || null;
    const body = req.body;
    const required = ["firstName","lastName","age","sex","phone","address","relationship","medication","timesPerDay","days"];
    for (const k of required) {
      if (!body[k]) return res.status(400).json({ message: `Missing required field: ${k}` });
    }
    const medTimes = normalizeMedicationTimes(body.medicationTimes);
    const newMember = await Member.create({
      userId,
      sonEmail: sonEmailFromToken || body.sonEmail || null,
      photoUrl: body.photoUrl || "",
      firstName: body.firstName,
      lastName: body.lastName,
      age: Number(body.age),
      sex: body.sex,
      phone: body.phone,
      address: body.address,
      relationship: body.relationship,
      medication: body.medication,
      timesPerDay: Number(body.timesPerDay),
      days: Number(body.days),
      medicationTimes: medTimes,
    });
    res.json({ success: true, member: newMember });
  } catch (err) {
    console.error("POST /api/members error:", err && err.stack ? err.stack : err);
    res.status(500).json({ message: "Server error" });
  }
});
app.put("/api/members/:id", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const payload = (await verifyIdToken(token)) || { sub: "dev-guest" };
    const userId = payload.sub || "dev-guest";
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ message: "Not found" });
    if (member.userId !== userId) return res.status(403).json({ message: "Forbidden" });
    const updates = req.body;
    if (updates.medicationTimes !== undefined) updates.medicationTimes = normalizeMedicationTimes(updates.medicationTimes);
    if (updates.sonEmail !== undefined) updates.sonEmail = updates.sonEmail || null;
    await member.update(updates);
    res.json({ success: true, member });
  } catch (err) {
    console.error("PUT /api/members/:id error:", err && err.stack ? err.stack : err);
    res.status(500).json({ message: "Server error" });
  }
});
app.delete("/api/members/:id", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const payload = (await verifyIdToken(token)) || { sub: "dev-guest" };
    const userId = payload.sub || "dev-guest";
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ message: "Not found" });
    if (member.userId !== userId) return res.status(403).json({ message: "Forbidden" });
    await member.destroy();
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/members/:id error:", err && err.stack ? err.stack : err);
    res.status(500).json({ message: "Server error" });
  }
});

// debug route to check status
app.get("/debug", (req, res) => {
  res.json({
    ok: true,
    db: {
      host: process.env.DB_HOST || "127.0.0.1",
      name: process.env.DB_NAME || "coraHealth",
    },
    googleVerification: !!process.env.GOOGLE_CLIENT_ID,
  });
});

const PORT = process.env.PORT || 5000;

// Start server but continue even if DB fails (logs error)
async function start() {
  try {
    await sequelize.authenticate();
    console.log("MySQL connected.");
    await sequelize.sync({ alter: true });
    console.log("Sequelize synced.");
  } catch (err) {
    console.error("DB connection failed (will continue running):", err && err.stack ? err.stack : err);
    // DON'T exit — keep server up so we can debug via /debug and logs
  }

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start();

