import { useState } from "react";
import "./CheckinModal.css";

export function CheckinModal({challenge, currentDay = 0, checkIns = [], onComplete,}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const today = Math.min(currentDay, 7);
  const alreadyCheckedIn = checkIns.find((c) => c.day === today)?.completed;

  const closeModal = () => {
    setOpen(false);
    setSubmitting(false);
    setValue("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (today === 0) {
      console.error("Challenge hasn't started yet.");
      return;
    }

    try {
      setSubmitting(true);

      let points = 25;
      if (challenge.type === "value" && challenge.dailyGoal) {
        points = value / challenge.dailyGoal * 25;
        points = Math.min(Math.max(Math.round(points), 0), 25); // round to int between 0-25, proportional to goal
      }
  

      const res = await fetch(
        `http://localhost:4000/api/challenges/${challenge._id}/check-ins`,
        {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          credentials: "include",
          body: JSON.stringify({day: today, value: challenge.type === "value" ? value : "", pointsEarned: points}),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      await onComplete(data);
      closeModal();

      // Dispatch event to update navbar
      window.dispatchEvent(new Event('userDataChanged'));
    } catch (err) {
      console.error("Error checking into challenge:",err.message);
      alert("Failed to check into challenge. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button className="checkin-btn" onClick={() => setOpen(true)} disabled={alreadyCheckedIn}>
        {alreadyCheckedIn ? "Checked In" : 
          <>
            <span className="checkin-btn__icon">✓</span>
            <span>Check In</span>
          </>
        }
      </button>

      {open && (
        <div className="checkin-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <form className="checkin-modal" onSubmit={handleSubmit}>
            <h2 className="checkin-title">Check In for Day {today}</h2>
            {challenge.type === "value" && (
              <label className="checkin-field">
                <span> Enter your {challenge.unit || "value"} for today </span>
                <input
                  type="number"
                  min="0"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={`ex. ${challenge.dailyGoal}`}
                  required
                />
              </label>
            )}

            <div className="checkin-actions">
              <button
                className="checkin-cancel"
                type="button"
                onClick={closeModal}
                disabled={submitting}
              >
                Cancel
              </button>
              <button className="checkin-primary" type="submit" disabled={submitting || today === 0}>
                {submitting ? "Saving..." : "Confirm"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default CheckinModal;
