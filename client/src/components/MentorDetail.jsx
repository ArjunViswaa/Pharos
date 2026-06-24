import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api.js";
import { formatDateTime } from "../lib/format.js";
import { useAuth } from "../auth/AuthContext.jsx";

export default function MentorDetail({ mentorId, onClose }) {
  const [mentor, setMentor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingSlotId, setBookingSlotId] = useState(null);
  const [notice, setNotice] = useState(null);
  const { user } = useAuth();

  async function handleBook(slotId) {
    setBookingSlotId(slotId);
    setNotice(null);
    try {
      const order = await apiPost("/api/payments/order", { slotId });

      const options = {
        key: order.keyId,
        amount: order.amount * 100,
        currency: order.currency,
        name: "Pharos",
        description: "Mentor session booking",
        order_id: order.orderId,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#e8c875" },
        handler: async (response) => {
          try {
            await apiPost("/api/payments/verify", {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              slotId,
            });
            setSlots((current) => current.filter((s) => s._id !== slotId));
            setNotice("Payment successful! Check My Bookings.");
          } catch (verifyErr) {
            setNotice("Payment couldn't be verified. Please try again.");
          }
          setBookingSlotId(null);
        },
        modal: {
          ondismiss: () => setBookingSlotId(null),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      if (err.status === 409) {
        setSlots((current) => current.filter((s) => s._id !== slotId));
        setNotice("That slot was just taken by someone else.");
      } else {
        setNotice("Couldn't start payment. Please try again.");
      }
      setBookingSlotId(null);
    }
  }

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      apiGet(`/api/mentors/${mentorId}`),
      apiGet(`/api/mentors/${mentorId}/slots`),
    ])
      .then(([mentorData, slotsData]) => {
        setMentor(mentorData.mentor);
        setSlots(slotsData.slots);
      })
      .catch(() => setError("Couldn't load this mentor."))
      .finally(() => setLoading(false));
  }, [mentorId]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {loading ? (
          <p className="browse-msg">Loading…</p>
        ) : error ? (
          <p className="browse-msg err">{error}</p>
        ) : (
          <div className="mentor-detail">
            <div className="mentor-detail-head">
              <div className="mentor-avatar lg">
                {(mentor.userId?.name || "?").charAt(0).toUpperCase()}
              </div>
              <div>
                <h2>
                  {mentor.userId?.name || "Unknown Mentor"}
                  {mentor.verified && (
                    <span className="verified-badge" title="Verified mentor">✓</span>
                  )}
                </h2>
                {mentor.headline && <p className="mentor-headline">{mentor.headline}</p>}
              </div>
            </div>

            <div className="mentor-detail-meta">
              <span>{mentor.yearsOfExperience} yrs experience</span>
              <span className="mentor-rate">
                ₹{mentor.hourlyRate}<small>/hr</small>
              </span>
            </div>

            <p className="mentor-detail-bio">{mentor.bio}</p>

            <ul className="skill-chips">
              {mentor.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>

            {mentor.linkedIn && (
              <a
                className="mentor-linkedin"
                href={mentor.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
              >
                View LinkedIn profile
              </a>
            )}

            <div className="slot-list-wrap">
              <h3 className="slot-list-title">Available slots</h3>
              {notice && <p className="detail-notice">{notice}</p>}
              {slots.length === 0 ? (
                <p className="browse-msg">No open slots right now.</p>
              ) : (
                <ul className="slot-list">
                  {slots.map((slot) => (
                    <li key={slot._id} className="slot-row">
                      <span className="slot-time">{formatDateTime(slot.startsAt)}</span>
                      <span className="slot-meta">{slot.durationMinutes} min</span>
                      <button
                        className="slot-book"
                        onClick={() => handleBook(slot._id)}
                        disabled={bookingSlotId === slot._id}
                      >
                        {bookingSlotId === slot._id ? "Booking…" : "Book"}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
