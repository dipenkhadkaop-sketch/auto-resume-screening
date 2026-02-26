const bcrypt = require("bcryptjs");
const db = require("./database");

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

async function seed() {
  const users = [
    { full_name: "Admin", email: "admin@gmail.com", password: "123456", role: "admin" },
    { full_name: "HR", email: "hr@gmail.com", password: "123456", role: "hr" },
    { full_name: "Recruiter", email: "recruiter@gmail.com", password: "123456", role: "recruiter" },
    { full_name: "Candidate", email: "candidate@gmail.com", password: "123456", role: "candidate" },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);

    await run(
      `INSERT OR IGNORE INTO users (full_name, email, password_hash, role)
       VALUES (?, ?, ?, ?)`,
      [u.full_name, u.email.toLowerCase(), hash, u.role]
    );
  }

  console.log("✅ Seed complete. Test logins:");
  console.log("admin@gmail.com / 123456");
  console.log("hr@gmail.com / 123456");
  console.log("recruiter@gmail.com / 123456");
  console.log("candidate@gmail.com / 123456");
  process.exit(0);
}

seed().catch((e) => {
  console.error("❌ Seed failed:", e.message);
  process.exit(1);
});