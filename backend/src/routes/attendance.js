const express = require("express");
const router = express.Router();
const db = require("../db");
const { v4: uuidv4 } = require("uuid");
const auth = require("../middleware/auth");
const stringify = require("csv-stringify");

// Admin: generate QR session (token)
router.post("/generate", auth("admin"), async (req, res) => {
  try {
    const id = uuidv4();
    const token = uuidv4();
    const { label, ttl_minutes } = req.body;
    let expires_at = null;
    if (ttl_minutes) {
      expires_at = new Date(Date.now() + ttl_minutes * 60000);
    }
    await db.query(`INSERT INTO qr_sessions(id, token, label, expires_at) VALUES($1,$2,$3,$4)`, [id, token, label || null, expires_at]);
    res.json({ id, token, label, expires_at });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "cannot generate" });
  }
});

// Employee: check-in or check-out by scanning QR token, sending geolocation
router.post("/scan", auth(), async (req, res) => {
  try {
    const { token, lat, lng } = req.body;
    if (!token) return res.status(400).json({ error: "token missing" });
    const r = await db.query(`SELECT id, expires_at FROM qr_sessions WHERE token=$1`, [token]);
    if (r.rowCount === 0) return res.status(400).json({ error: "invalid token" });
    const session = r.rows[0];
    if (session.expires_at && new Date(session.expires_at) < new Date()) return res.status(400).json({ error: "expired" });

    const userId = req.user.id;
    const open = await db.query(`SELECT * FROM attendance WHERE user_id=$1 AND qr_session_id=$2 AND check_out IS NULL`, [userId, session.id]);
    if (open.rowCount === 0) {
      const attId = uuidv4();
      await db.query(`INSERT INTO attendance(id, user_id, qr_session_id, check_in, lat, lng) VALUES($1,$2,$3,now(),$4,$5)`, [attId, userId, session.id, lat || null, lng || null]);
      return res.json({ action: "check-in", id: attId });
    } else {
      const att = open.rows[0];
      await db.query(`UPDATE attendance SET check_out=now() WHERE id=$1`, [att.id]);
      return res.json({ action: "check-out", id: att.id });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "scan failed" });
  }
});

// Admin: export attendance CSV (optional filter by date)
router.get("/export", auth("admin"), async (req, res) => {
  try {
    const { from, to } = req.query;
    let q = `SELECT a.id, u.name AS user_name, u.email, a.check_in, a.check_out, a.lat, a.lng, s.label as session_label, a.created_at
      FROM attendance a
      LEFT JOIN users u ON u.id = a.user_id
      LEFT JOIN qr_sessions s ON s.id = a.qr_session_id`;
    const params = [];
    if (from || to) {
      q += " WHERE 1=1";
      if (from) { params.push(from); q += ` AND a.check_in >= $${params.length}`; }
      if (to) { params.push(to); q += ` AND a.check_in <= $${params.length}`; }
    }
    q += " ORDER BY a.check_in DESC LIMIT 10000";
    const r = await db.query(q, params);
    const rows = r.rows;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=\"attendance.csv\"");

    stringify(rows, { header: true }).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "export failed" });
  }
});

module.exports = router;
