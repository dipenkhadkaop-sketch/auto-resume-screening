import React, { useState } from "react";

export default function JobEditor() {
  const [title, setTitle] = useState("");

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ color: "red" }}>JOB EDITOR TEST</h1>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Type here..."
        style={{ width: "100%", padding: 10 }}
      />

      <p>You typed: {title}</p>
    </div>
  );
}