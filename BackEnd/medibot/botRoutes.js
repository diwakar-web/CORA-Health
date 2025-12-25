// BackEnd/mediBot/botRoutes.js (updated)
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { getBestAnswer } = require("./nlp");

const MEMORY_FILE = path.join(__dirname, "chat_memory.json");

let memory = {};

if (fs.existsSync(MEMORY_FILE)) {
  try {
    memory = JSON.parse(fs.readFileSync(MEMORY_FILE, "utf8"));
  } catch (e) {
    console.error("Could not parse chat_memory.json, starting fresh:", e && e.message ? e.message : e);
    memory = {};
  }
}

function saveMemory() {
  try {
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));
  } catch (e) {
    console.error("Failed saving chat memory:", e && e.message ? e.message : e);
  }
}

module.exports = function initMediBot(app) {
  // Chatbot route
  app.post("/api/medi-bot", (req, res) => {
    try {
      const { message, session_id } = req.body || {};
      const userMsg = typeof message === "string" ? message.trim() : "";

      if (!userMsg) {
        return res.status(400).json({ error: "Missing message in request body" });
      }

      let sid = session_id || uuidv4();
      if (!memory[sid]) memory[sid] = [];

      // store user message
      memory[sid].push({ role: "user", message: userMsg });

      // get best answer (may return object or null)
      let replyObj = null;
      try {
        replyObj = getBestAnswer(userMsg);
      } catch (err) {
        console.error("getBestAnswer threw an exception:", err && err.message ? err.message : err);
        replyObj = null;
      }

      // default reply
      let replyText = "Sorry, I am not fully sure about that. Please consult a medical professional for accurate information.";
      let meta = {};

      if (typeof replyObj === "string") {
        replyText = replyObj;
      } else if (replyObj && typeof replyObj === "object") {
        // prefer replyObj.answer, fallback to other fields
        replyText = replyObj.answer || replyObj.reply || replyObj.text || replyText;

        // include metadata if present
        if (replyObj.score !== undefined) meta.score = replyObj.score;
        if (replyObj.matchedQuestion) meta.matchedQuestion = replyObj.matchedQuestion;

        // include tags (array) if present
        if (Array.isArray(replyObj.tags) && replyObj.tags.length > 0) {
          meta.tags = replyObj.tags;

          // choose first tag as suggested specialty (frontend can show CTA)
          const suggested = String(replyObj.tags[0] || "").trim();
          if (suggested) {
            meta.suggestedSpecialty = suggested;
            // build redirect url to your DocMap route (frontend uses this)
            meta.redirectUrl = `/dm?specialty=${encodeURIComponent(suggested)}`;
          }
        }
      }

      // store reply as string
      memory[sid].push({ role: "bot", message: replyText });

      // keep only last 20 items
      memory[sid] = memory[sid].slice(-20);
      saveMemory();

      return res.json({
        session_id: sid,
        reply: replyText,
        meta,
        history: memory[sid],
      });
    } catch (err) {
      console.error("POST /api/medi-bot error:", err && err.message ? err.message : err);
      return res.status(500).json({ error: "Server error" });
    }
  });

  console.log("MediBot routes loaded ✔");
};
