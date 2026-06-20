import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api.js";
import { formatDateTime, nowLocalInput } from "../lib/format.js";

export default function MyAvailability() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notMentor, setNotMentor] = useState(false);

  const [startsAt, setStartsAt] = useState("");
  const [duration, setDuration] = useState("60");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function loadSlots() {
    setLoading(true);
    try {
      const data = await apiGet("/api/slots/mine");
      setSlots(data.slots);
      setNotMentor(false);
    } catch (err) {
      if (err.status === 403) setNotMentor(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSlots();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await apiPost("/api/slots", {
        startsAt: new Date(startsAt).toISOString(),
        durationMinutes: Number(duration),
      });
      setStartsAt("");
      await loadSlots();
    } catch (err) {
      if (err.status === 400 && err.body?.error === "SlotMustBeInFuture") {
        setError("Pick a time in the future.");
      } else if (err.status === 409) {
        setError("You already have a slot at that time.");
      } else if (err.status === 403) {
        setNotMentor(true);
      } else {
        setError("Couldn't add the slot. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="browse-msg">Loading…</p>;

  if (notMentor) {
    return (
      <div className="card home-card">
        <h2>No mentor profile yet</h2>
        <p className="email">
          Create a mentor profile under “Become a Mentor” to publish availability.
        </p>
      </div>
    );
  }

  return (
    <div className="availability">
      <form className="card availability-form" onSubmit={handleAdd} noValidate>
        <h2>Add availability</h2>

        <label>
          Date & time
          <input
            type="datetime-local"
            value={startsAt}
            min={nowLocalInput()}
            onChange={(e) => setStartsAt(e.target.value)}
            required
          />
        </label>

        <label>
          Duration
          <select value={duration} onChange={(e) => setDuration(e.target.value)}>
            <option value="30">30 minutes</option>
            <option value="60">60 minutes</option>
            <option value="90">90 minutes</option>
          </select>
        </label>

        {error && <p className="err top">{error}</p>}

        <button disabled={submitting || !startsAt}>
          {submitting && <span className="spinner" />}
          {submitting ? "Adding…" : "Add slot"}
        </button>
      </form>

      <div className="slot-list-wrap">
        <h3 className="slot-list-title">Your slots</h3>
        {slots.length === 0 ? (
          <p className="browse-msg">No slots yet. Add one to get booked.</p>
        ) : (
          <ul className="slot-list">
            {slots.map((slot) => (
              <li key={slot._id} className="slot-row">
                <span className="slot-time">{formatDateTime(slot.startsAt)}</span>
                <span className="slot-meta">{slot.durationMinutes} min</span>
                <span className={`slot-status ${slot.status}`}>{slot.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
