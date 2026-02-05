const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const authRoutes = require("./routes/auth");
const attRoutes = require("./routes/attendance");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

db.init().then(()=> console.log("DB initialized")).catch(err=> { console.error(err); process.exit(1); });

app.use("/api/auth", authRoutes);
app.use("/api/attendance", attRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log(`Backend running on port ${PORT}`));
