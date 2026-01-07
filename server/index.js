import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { validateLead } from "./validate.js";
import { saveLead } from "./storage.js";
import { notifyDiscord } from "./notifyDiscord.js";

dotenv.config();

console.log("Webhook loaded?", !!process.env.DISCORD_WEBHOOK_URL);
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

const app = express();
app.use(express.json());

// Resolve client path for static hosting
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDir = path.join(__dirname, "..", "client");

// Serve the client from the same origin to avoid CORS/mixed-content issues
app.use(express.static(clientDir));

// basic request logging for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// simple CORS for local dev (client opened in browser)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.get("/health", (req, res) => res.json({ ok: true }));

app.get("/", (req, res) => {
  res.sendFile(path.join(clientDir, "index.html"));
});

app.post("/api/leads", async (req, res) => {
  try {
    const lead = req.body ?? {};
    if (!Object.keys(lead).length) {
      return res.status(400).json({ ok: false, error: "Empty request body." });
    }

    // optional honeypot spam trap: bots often fill hidden fields
    if (lead.companyWebsite && lead.companyWebsite.trim() !== "") {
      return res.status(200).json({ ok: true }); // pretend success, drop silently
    }

    const { ok, errors, cleaned } = validateLead(lead);
    if (!ok) return res.status(400).json({ ok: false, errors });

    const saved = await saveLead(cleaned);
    await notifyDiscord(saved);

    res.status(201).json({ ok: true, lead: saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
