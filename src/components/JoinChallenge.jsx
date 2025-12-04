import React, { useState } from "react";
import "./JoinChallenge.css";

export default function JoinChallenge({ onJoinChallenge }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:4000/api/challenges/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.message || "Failed to join challenge");
        return;
      }

      const joinedChallenge = await res.json();
      console.log("Joined challenge:", joinedChallenge);

      if (onJoinChallenge) {
        onJoinChallenge(joinedChallenge);
      }

      setOpen(false);
      setCode("");
    } catch (err) {
      console.error("Error joining challenge:", err);
      alert("Error joining challenge. Try again.");
    }
  }

  return (
    <>
      <button className="join-btn" onClick={() => setOpen(true)}>
        <span className="join-btn__icon">+</span>
        <span>Join Challenge</span>
      </button>

      {open && (
        <div
          className="join-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpen(false);
            }
          }}
        >
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

            <div className="join-actions">
              <button className="join-primary" type="submit">
                Enter
              </button>
              <button
                className="join-cancel"
                type="button"
                onClick={() => setOpen(false)}
              >
                X      
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
