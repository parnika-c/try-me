import { useState } from "react";
import "./CheckinModal.css";

export function CheckinModal({challenge, currentDay = 0, checkIns = [], onComplete,}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const closeModal = () => {
    setOpen(false);
    setSubmitting(false);
    setValue("");
  };

  const handleSubmit = async (event) => {
    // TODO later
  };

  return (
    <>
      <button className="checkin-btn" onClick={() => setOpen(true)}>
        <span className="checkin-btn__icon">✓</span>
        <span>Check In</span>
      </button>

      {open && (
        <div className="checkin-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <form className="checkin-modal" onSubmit={handleSubmit}>
            <h2 className="checkin-title">Check In </h2>
            {challenge.type === "value" && (
              <label className="checkin-field">
                <input
                  type="number"
                  min="0"
                  value={value}
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
