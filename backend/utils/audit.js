const db = require("../db/database");

function audit({ user_id = null, action, detail = null, ip = null }) {
  db.run(
    "INSERT INTO audit_logs (user_id, action, detail, ip) VALUES (?, ?, ?, ?)",
    [user_id, action, detail ? JSON.stringify(detail) : null, ip],
    () => {}
  );
}

module.exports = { audit };
