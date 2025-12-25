// reminderBot.js
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");
const TelegramBot = require("node-telegram-bot-api");
const nodemailer = require("nodemailer");
const cron = require("node-cron");

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error("Set TELEGRAM_BOT_TOKEN in .env");
  process.exit(1);
}
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// --- Sequelize connection (reuse your DB) ---
const sequelize = new Sequelize(
  process.env.DB_NAME || "coraHealth",
  process.env.DB_USER || "root",
  process.env.DB_PASS || "0000",
  {
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    dialect: "mysql",
    logging: false,
  }
);

// Member model must match your server model shape (includes sonEmail now)
const Member = sequelize.define("Member", {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  userId: DataTypes.STRING,
  sonEmail: DataTypes.STRING,
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  phone: DataTypes.STRING,
  relationship: DataTypes.STRING,
  medication: DataTypes.STRING,
  days: DataTypes.INTEGER,
  timesPerDay: DataTypes.INTEGER,
  medicationTimes: {
    type: DataTypes.TEXT,
    get() {
      const raw = this.getDataValue("medicationTimes");
      return raw ? JSON.parse(raw) : [];
    },
  },
}, { tableName: "members", timestamps: true });

// --- simple file persistence ---
const DATA_DIR = path.join(__dirname, "bot_data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const LINK_FILE = path.join(DATA_DIR, "linkings.json");
const SENT_FILE = path.join(DATA_DIR, "sent.json");
const POLL_MAP_FILE = path.join(DATA_DIR, "pollmap.json");

// load/save helpers
function loadJson(file, fallback = {}) {
  try {
    const raw = fs.readFileSync(file, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}
function saveJson(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2));
}

// persisted structures
let linkings = loadJson(LINK_FILE, {}); // { memberId: chatId }
let sent = loadJson(SENT_FILE, {}); // { "YYYY-MM-DD": { "<memberId>-HH:MM": true } }
let pollMap = loadJson(POLL_MAP_FILE, {}); // { pollId: { memberId, timeISO, answered } }

// --- Nodemailer setup ---
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// verify SMTP on startup (logs will show in PM2)
transporter.verify().then(() => {
  console.log("SMTP verified: ready to send emails.");
}).catch((err) => {
  console.error("SMTP verification failed:", err);
});

async function sendEmail(to, subject, text) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent ok to ${to}: ${info.messageId || JSON.stringify(info)}`);
    return info;
  } catch (err) {
    console.error(`Email send failed for ${to}:`, err);
    throw err;
  }
}

// --- Link flow: father messaging the bot ---
// Expected: father sends "/start <memberId>" or sends <memberId> as plain text
bot.onText(/\/start(?:\s+(\d+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const memberId = match && match[1] ? match[1] : null;
  if (!memberId) {
    return bot.sendMessage(chatId, "Welcome. To CORA Health, please send: /start <memberId>\n");
  }
  // confirm the member exists
  try {
    const member = await Member.findByPk(Number(memberId));
    if (!member) {
      return bot.sendMessage(chatId, `No member found with id ${memberId}.`);
    }
    linkings[memberId] = chatId;
    saveJson(LINK_FILE, linkings);
    return bot.sendMessage(chatId, `Linked to ${member.firstName} ${member.lastName} (member id ${memberId}). You will receive medication reminders.`);
  } catch (err) {
    console.error("Linking error:", err);
    return bot.sendMessage(chatId, "Server error while linking. Try again.");
  }
});

// also accept plain numbers
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  // ignore commands handled above
  if (!msg.text || msg.text.startsWith("/")) return;
  const text = msg.text.trim();
  if (/^\d+$/.test(text)) {
    const memberId = text;
    try {
      const member = await Member.findByPk(Number(memberId));
      if (!member) return bot.sendMessage(chatId, `No member found with id ${memberId}.`);
      linkings[memberId] = chatId;
      saveJson(LINK_FILE, linkings);
      return bot.sendMessage(chatId, `Linked to ${member.firstName} ${member.lastName} (member id ${memberId}). You will receive medication reminders.`);
    } catch (err) {
      console.error("Linking error:", err);
      return bot.sendMessage(chatId, "Server error while linking. Try again.");
    }
  }
});

// --- handle poll answers ---
bot.on("poll_answer", async (answer) => {
  try {
    const pollId = answer.poll_id;
    const optionIds = answer.option_ids; // array of chosen option indexes
    const entry = pollMap[pollId];
    if (!entry) {
      console.warn("Unknown poll answer for pollId", pollId);
      return;
    }
    const memberId = entry.memberId;
    // We assume options: 0 -> Yes, 1 -> No
    const choseYes = optionIds && optionIds.length && optionIds[0] === 0;

    const member = await Member.findByPk(Number(memberId));
    if (!member) return;

    const sonEmail = await findSonEmailForMember(member);

    if (choseYes) {
      // reply to father
      await bot.sendMessage(linkings[memberId], "Good to hear that, have a nice day! 😊");
      // email son
      if (sonEmail) {
        await sendEmail(sonEmail, `Medication taken for ${member.firstName}`, `${member.firstName} has taken their medication at ${new Date().toLocaleString()}.`);
      }
    } else {
      // No selected
      if (sonEmail) {
        await sendEmail(sonEmail, `ALERT: ${member.firstName} did NOT take medication`, `${member.firstName} answered NO to medication at ${new Date().toLocaleString()}.`);
      }
    }

    // mark answered so timeout doesn't trigger later
    entry.answered = true;
    pollMap[pollId] = entry;
    saveJson(POLL_MAP_FILE, pollMap);
  } catch (err) {
    console.error("poll_answer handler error:", err);
  }
});

// --- helper to derive son email ---
// Now prefer member.sonEmail, fallback to DEFAULT_SON_EMAIL
async function findSonEmailForMember(member) {
  try {
    if (member.sonEmail) return member.sonEmail;
    return process.env.DEFAULT_SON_EMAIL || null;
  } catch (err) {
    console.error("findSonEmailForMember error:", err);
    return process.env.DEFAULT_SON_EMAIL || null;
  }
}

// --- scheduling logic ---
// Helper to get HH:MM string from a Date object
function hhmmFromDate(d) {
  return d.toTimeString().slice(0,5);
}

function todayKey() {
  const d = new Date();
  return d.toISOString().slice(0,10);
}

// Cron job that runs every minute and checks for reminders
cron.schedule("* * * * *", async () => {
  try {
    await sequelize.authenticate();
    // fetch all members that have medicationTimes non-empty
    const members = await Member.findAll();
    const now = new Date();
    const curHHMM = hhmmFromDate(now); // "14:22"
    const curDateKey = todayKey();
    if (!sent[curDateKey]) sent[curDateKey] = {};

    for (const m of members) {
      const memberId = String(m.id);
      const medTimes = m.medicationTimes || [];
      // medTimes entries expected like "10:00" or "09:30"
      if (!Array.isArray(medTimes) || medTimes.length === 0) continue;

      if (!linkings[memberId]) continue; // father not linked

      for (const t of medTimes) {
        const timeStr = String(t).trim();
        if (timeStr === curHHMM) {
          const key = `${memberId}-${timeStr}`;
          if (sent[curDateKey][key]) {
            // already sent today at this time
            continue;
          }
          // send poll
          const chatId = linkings[memberId];
          const question = `Hi ${m.firstName}, did you take your medication (${m.medication}) scheduled for ${timeStr}?`;
          const options = ["Yes", "No"];
          const message = await bot.sendPoll(chatId, question, options, { is_anonymous: false });
          // store poll mapping
          const pollId = message.poll.id;
          pollMap[pollId] = { memberId, timeISO: new Date().toISOString(), answered: false };
          saveJson(POLL_MAP_FILE, pollMap);

          // schedule a 15-minute check (using setTimeout) to send email if unanswered
          setTimeout(async () => {
            try {
              const entry = pollMap[pollId];
              if (!entry) return;
              if (entry.answered) return;
              // unanswered -> send email to son
              const member = await Member.findByPk(Number(memberId));
              const sonEmail = await findSonEmailForMember(member);
              if (sonEmail) {
                await sendEmail(sonEmail, `ALERT: ${member.firstName} did NOT respond to reminder`, `${member.firstName} did not respond to medication reminder scheduled at ${timeStr}.`);
              }
              // Optionally send a Telegram message to father as a gentle nudge:
              await bot.sendMessage(chatId, `We didn't get a response. If you haven't taken your medication, please do so and ask someone to help if needed.`);
              // mark answered to avoid double notifications
              entry.answered = true;
              pollMap[pollId] = entry;
              saveJson(POLL_MAP_FILE, pollMap);
            } catch (e) {
              console.error("15-min timeout error:", e);
            }
          }, 15 * 60 * 1000); // 15 minutes

          // mark as sent for today
          sent[curDateKey][key] = true;
          saveJson(SENT_FILE, sent);
        }
      }
    }

    // optional: clear old sent keys older than 7 days
    const keys = Object.keys(sent);
    if (keys.length > 10) {
      // keep only last 7 days
      const keep = new Set(keys.slice(-7));
      const newSent = {};
      for (const k of keep) newSent[k] = sent[k];
      sent = newSent;
      saveJson(SENT_FILE, sent);
    }
  } catch (err) {
    console.error("cron error:", err);
  }
});

console.log("Reminder bot started and polling for messages.");
