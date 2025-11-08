import React, { useState } from "react";
import "./JoinChallenge.css";

export default function JoinChallenge() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    console.log("join code:", code);
    setOpen(false);
    setCode("");
  }

  return (
    <>
      <button className="join-btn" onClick={() => setOpen(true)}>
        <span className="join-btn__icon">+</span>
        <span>Join Challenge</span>
      </button>

      {open && (
        <div className="join-overlay" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <form className="join-modal" onSubmit={handleSubmit}>
            <h2 className="join-title">Enter 7-character Join Code:</h2>

            <input
              className="join-input"
              type="text"
              placeholder="e.g., AbCD124"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={7}
              autoFocus
            />

            <button className="join-primary" type="submit">Enter</button>
            <button className="join-cancel" type="button" onClick={() => setOpen(false)}>×</button>
          </form>
        </div>
      )}
    </>
  );
}
