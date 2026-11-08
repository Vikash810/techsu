// Tech-SU backend: Node.js + Express. Run: npm i express cors && node server.js
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const app = express();
app.use(cors());
app.use(express.json({ limit: "10kb" }));

const FILE = "enquiries.json";
const ADMIN_KEY = process.env.ADMIN_KEY || "change-me";   // set a strong key
const load = () => (fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE)) : []);

// Visitors send an enquiry
app.post("/api/enquiry", (req, res) => {
  const { name, phone, program, message } = req.body || {};
  if (!name || !/^[0-9+ ]{10,15}$/.test(phone || "")) return res.status(400).json({ error: "Invalid data" });
  const list = load();
  list.push({ name: String(name).slice(0, 60), phone, program: String(program || "").slice(0, 60),
              message: String(message || "").slice(0, 300), at: new Date().toISOString() });
  fs.writeFileSync(FILE, JSON.stringify(list, null, 2));
  res.json({ ok: true });
});

// Only you can read enquiries: GET /api/enquiries?key=YOUR_KEY
app.get("/api/enquiries", (req, res) => {
  if (req.query.key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  res.json(load());
});

app.listen(process.env.PORT || 3000, () => console.log("Tech-SU API running"));
