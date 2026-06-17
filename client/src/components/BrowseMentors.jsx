import { useEffect, useState } from "react";
import { apiGet } from "../lib/api.js";
import MentorCard from "./MentorCard.jsx";

export default function BrowseMentors() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("");

  const [debounced, setDebounced] = useState({ search: "", skill: "" });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced({ search, skill });
    }, 400);
    return () => clearTimeout(timer);
  }, [search, skill]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (debounced.search) params.set("search", debounced.search);
    if (debounced.skill) params.set("skills", debounced.skill);

    apiGet(`/api/mentors?${params.toString()}`)
      .then((data) => setMentors(data.mentors))
      .catch(() => setError("Couldn't load mentors. Please try again."))
      .finally(() => setLoading(false));
  }, [debounced]);

  return (
    <section className="browse">
      <div className="browse-filters">
        <input
          type="text"
          placeholder="Search by name, headline, or expertise…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by skill (e.g. react)"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="browse-msg">Loading mentors…</p>
      ) : error ? (
        <p className="browse-msg err">{error}</p>
      ) : mentors.length === 0 ? (
        <p className="browse-msg">No mentors match your search.</p>
      ) : (
        <div className="mentor-grid">
          {mentors.map((m) => (
            <MentorCard key={m._id} mentor={m} />
          ))}
        </div>
      )}
    </section>
  );
}
