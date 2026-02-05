const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "secret";

function auth(requiredRole) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "no token" });
    const token = authHeader.split(" ")[1];
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = payload;
      if (requiredRole) {
        const rolesPriority = { "employee": 1, "hr": 2, "admin": 3 };
        if ((rolesPriority[payload.role] || 0) < (rolesPriority[requiredRole] || 0)) {
          return res.status(403).json({ error: "forbidden" });
        }
      }
      next();
    } catch (e) {
      return res.status(401).json({ error: "invalid token" });
    }
  };
}

module.exports = auth;
