import { useEffect, useState } from "react";
import { apiGet } from "../lib/api.js";
import { formatDateTime } from "../lib/format.js";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/api/bookings/mine")
      .then((data) => setBookings(data.bookings))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="browse-msg">Loading…</p>;

  if (bookings.length === 0) {
    return <p className="browse-msg">You haven't booked any sessions yet.</p>;
  }

  return (
    <div className="slot-list-wrap">
      <h3 className="slot-list-title">My bookings</h3>
      <ul className="slot-list">
        {bookings.map((booking) => (
          <li key={booking._id} className="slot-row">
            <span className="slot-time">{formatDateTime(booking.startsAt)}</span>
            <span className="slot-meta">with {booking.mentorName}</span>
            <span className="slot-meta">{booking.durationMinutes} min</span>
            <span className="slot-amount">₹{booking.amount}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
