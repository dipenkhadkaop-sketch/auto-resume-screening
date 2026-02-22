// backend/utils/audit.js
const db = require("../db/database");

function audit({ user_id = null, action, detail = {}, ip = null }) {
  db.run(
    "INSERT INTO audit_log (user_id, action, detail, ip) VALUES (?, ?, ?, ?)",
    [user_id, action, JSON.stringify(detail || {}), ip],
    (err) => {
      if (err) console.warn("audit insert failed:", err.message);
    }
  );
}

module.exports = { audit };