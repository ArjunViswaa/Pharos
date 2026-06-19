export default function MentorCard({ mentor, onSelect }) {
  const name = mentor.userId?.name || "Unknown Mentor";
  const initial = name.charAt(0).toUpperCase();

  return (
    <article className="mentor-card" onClick={() => onSelect(mentor._id)}>
      <header className="mentor-card-head">
        <div className="mentor-avatar">{initial}</div>
        <div>
          <h3>
            {name}
            {mentor.verified && (
              <span className="verified-badge" title="Verified mentor">✓</span>
            )}
          </h3>
          {mentor.headline && <p className="mentor-headline">{mentor.headline}</p>}
        </div>
      </header>

      <p className="mentor-bio">{mentor.bio}</p>

      <ul className="skill-chips">
        {mentor.skills.slice(0, 5).map((skill) => (
          <li key={skill}>{skill}</li>
        ))}
      </ul>

      <footer className="mentor-card-foot">
        <span className="mentor-exp">{mentor.yearsOfExperience} yrs exp</span>
        <span className="mentor-rate">₹{mentor.hourlyRate}<small>/hr</small></span>
      </footer>
    </article>
  );
}
