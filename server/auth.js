// server/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-change-me";
const COOKIE = "stackr_token";

function sign(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function authRequired(req, res, next) {
  const token = req.cookies?.[COOKIE];
  if (!token) return res.status(401).json({ error: "Not signed in" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid session" });
  }
}

router.post("/register", (req, res) => {
  const { email, name, password, role } = req.body || {};
  if (!email || !name || !password)
    return res.status(400).json({ error: "email, name, password required" });
  const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (exists) return res.status(409).json({ error: "Email already registered" });

  const hash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare("INSERT INTO users (email, name, role, pass_hash) VALUES (?,?,?,?)")
    .run(email, name, role || "researcher", hash);
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);

  res
    .cookie(COOKIE, sign(user), { httpOnly: true, sameSite: "lax", maxAge: 7 * 864e5 })
    .json({ id: user.id, email: user.email, name: user.name, role: user.role });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !bcrypt.compareSync(password, user.pass_hash))
    return res.status(401).json({ error: "Wrong email or password" });

  res
    .cookie(COOKIE, sign(user), { httpOnly: true, sameSite: "lax", maxAge: 7 * 864e5 })
    .json({ id: user.id, email: user.email, name: user.name, role: user.role });
});

router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE).json({ ok: true });
});

router.get("/me", authRequired, (req, res) => {
  const u = db.prepare("SELECT id,email,name,role,created_at FROM users WHERE id = ?")
    .get(req.user.id);
  res.json(u);
});

router.put("/me", authRequired, (req, res) => {
  const { name, password } = req.body || {};
  if (!name) return res.status(400).json({ error: "Name is required" });

  if (password) {
    const hash = bcrypt.hashSync(password, 10);
    db.prepare("UPDATE users SET name = ?, pass_hash = ? WHERE id = ?").run(name, hash, req.user.id);
  } else {
    db.prepare("UPDATE users SET name = ? WHERE id = ?").run(name, req.user.id);
  }

  const u = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  res
    .cookie(COOKIE, sign(u), { httpOnly: true, sameSite: "lax", maxAge: 7 * 864e5 })
    .json({ id: u.id, email: u.email, name: u.name, role: u.role });
});


router.get("/runs", authRequired, (req, res) => {
  const rows = db
    .prepare("SELECT * FROM runs WHERE user_id = ? ORDER BY id DESC LIMIT 100")
    .all(req.user.id);
  res.json(rows);
});

router.post("/runs", authRequired, (req, res) => {
  const r = req.body || {};
  const info = db
    .prepare(`INSERT INTO runs
      (user_id, strategy, instance, n_items, space_util, dissipation, runtime_s, bins_used, placements_json, container_json, peak_memory_mb, constraint_satisfaction_pct)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(req.user.id, r.strategy, r.instance, r.n_items, r.space_util,
         r.dissipation, r.runtime_s, r.bins_used,
         r.placements ? JSON.stringify(r.placements) : null,
         r.container ? JSON.stringify(r.container) : null,
         r.peak_memory_mb, r.constraint_satisfaction_pct);
  res.json({ id: info.lastInsertRowid });
});

module.exports = { router, authRequired };