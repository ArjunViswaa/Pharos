import { useState } from "react";
import { apiPost } from "../lib/api.js";

export default function BecomeMentor({ onCreated }) {
  const [form, setForm] = useState({
    headline: "",
    bio: "",
    skills: "",
    yearsOfExperience: "",
    hourlyRate: "",
    linkedIn: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [topError, setTopError] = useState(null);
  const [success, setSuccess] = useState(false);

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setTopError(null);

    const payload = {
      bio: form.bio,
      skills: form.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      yearsOfExperience: form.yearsOfExperience,
      hourlyRate: form.hourlyRate,
    };
    if (form.headline.trim()) payload.headline = form.headline.trim();
    if (form.linkedIn.trim()) payload.linkedIn = form.linkedIn.trim();

    try {
      await apiPost("/api/mentors", payload);
      setSuccess(true);
    } catch (err) {
      if (err.status === 400 && err.body?.issues) {
        setErrors(err.body.issues);
      } else if (err.status === 409) {
        setTopError("You already have a mentor profile.");
      } else {
        setTopError("Something went wrong. Please try again.");
      }
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="card success-card">
        <div className="checkmark-circle">
          <svg viewBox="0 0 24 24">
            <polyline points="5 12 10 17 19 8" />
          </svg>
        </div>
        <h2>You're a mentor now!</h2>
        <p>Your profile is live. Learners can find you in Browse Mentors.</p>
        <button onClick={onCreated} style={{ marginTop: "1.5rem" }}>
          View mentor directory
        </button>
      </div>
    );
  }

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <h2>Become a mentor</h2>

      <label>
        Headline
        <input
          value={form.headline}
          onChange={update("headline")}
          placeholder="Senior Backend Engineer at FinTech"
        />
        {errors.headline?.map((m) => <span className="err" key={m}>{m}</span>)}
      </label>

      <label>
        Bio
        <textarea
          value={form.bio}
          onChange={update("bio")}
          rows={4}
          placeholder="Tell learners about your experience (min 30 characters)…"
        />
        {errors.bio?.map((m) => <span className="err" key={m}>{m}</span>)}
      </label>

      <label>
        Skills (comma separated)
        <input
          value={form.skills}
          onChange={update("skills")}
          placeholder="node.js, system design, postgres"
        />
        {errors.skills?.map((m) => <span className="err" key={m}>{m}</span>)}
      </label>

      <label>
        Years of experience
        <input
          type="number"
          value={form.yearsOfExperience}
          onChange={update("yearsOfExperience")}
          placeholder="10"
        />
        {errors.yearsOfExperience?.map((m) => <span className="err" key={m}>{m}</span>)}
      </label>

      <label>
        Hourly rate (₹)
        <input
          type="number"
          value={form.hourlyRate}
          onChange={update("hourlyRate")}
          placeholder="2500"
        />
        {errors.hourlyRate?.map((m) => <span className="err" key={m}>{m}</span>)}
      </label>

      <label>
        LinkedIn (optional)
        <input
          value={form.linkedIn}
          onChange={update("linkedIn")}
          placeholder="https://www.linkedin.com/in/you"
        />
        {errors.linkedIn?.map((m) => <span className="err" key={m}>{m}</span>)}
      </label>

      {topError && <p className="err top">{topError}</p>}

      <button disabled={submitting}>
        {submitting && <span className="spinner" />}
        {submitting ? "Creating profile..." : "Create mentor profile"}
      </button>
    </form>
  );
}
