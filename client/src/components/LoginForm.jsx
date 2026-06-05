import { useState } from "react";
import { apiPost } from "../lib/api.js";

export default function LoginForm({ onSwitchToSignup }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [topError, setTopError] = useState(null);
  const [success, setSuccess] = useState(null);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setTopError(null);
    try {
      const data = await apiPost("/api/auth/login", form);
      localStorage.setItem("pharos.token", data.token);
      setSuccess(data.user);
    } catch (err) {
      if (err.status === 400 && err.body?.issues) {
        setErrors(err.body.issues);
      } else if (err.status === 401) {
        setTopError("Email or password is incorrect.");
      } else {
        setTopError("Something went wrong. Please try again.");
      }
    } finally {
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
        <h2>Welcome back, {success.name}!</h2>
        <p>You're signed in. Time to find your mentor.</p>
      </div>
    );
  }

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <h2>Log in to Pharos</h2>

      <label>
        Email
        <input
          type="email"
          value={form.email}
          onChange={update("email")}
          required
          autoFocus
        />
        {errors.email?.map((m) => <span className="err" key={m}>{m}</span>)}
      </label>

      <label>
        Password
        <input
          type="password"
          value={form.password}
          onChange={update("password")}
          required
        />
        {errors.password?.map((m) => <span className="err" key={m}>{m}</span>)}
      </label>

      {topError && <p className="err top">{topError}</p>}

      <button disabled={submitting}>
        {submitting && <span className="spinner" />}
        {submitting ? "Logging in..." : "Log in"}
      </button>

      <p className="switch">
        New to Pharos?{" "}
        <button type="button" className="link" onClick={onSwitchToSignup}>
          Create an account
        </button>
      </p>
    </form>
  );
}