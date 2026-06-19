import { useEffect, useState } from "react";
import { apiGet } from "../lib/api.js";

export default function MentorDetail({ mentorId, onClose }) {
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiGet(`/api/mentors/${mentorId}`)
      .then((data) => setMentor(data.mentor))
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

            <button className="book-btn">Book a session</button>
          </div>
        )}
      </div>
    </div>
  );
}
