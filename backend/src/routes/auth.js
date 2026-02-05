const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const JWT_SECRET = process.env.JWT_SECRET || "secret";

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: "Missing fields" });
    const hashed = await bcrypt.hash(password, 10);
    const id = uuidv4();
    await db.query(`INSERT INTO users(id,name,email,password,role) VALUES($1,$2,$3,$4,$5)`, [id, name, email, hashed, role || "employee"]);
    res.json({ message: "registered" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "register failed" });
  }
});

router.post("/login", async (req,res)=>{
  try {
    const { email, password } = req.body;
    const r = await db.query(`SELECT id, password, name, role FROM users WHERE email=$1`, [email]);
    if (r.rowCount === 0) return res.status(401).json({ error: "invalid credentials" });
    const user = r.rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });
    const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: "8h" });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "login failed" });
  }
});

module.exports = router;
