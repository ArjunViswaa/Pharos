import { useState } from "react";
import { apiPost } from "../lib/api.js";

export default function SignupForm() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "learner",
    });

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
            const data = await apiPost("/api/auth/signup", form);
            setSuccess(data.user);
        } catch (err) {
            if (err.status === 400 && err.body?.issues) {
                setErrors(err.body.issues);
            } else if (err.status === 409) {
                setTopError("That email is already registered.");
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
            <h2>Welcome aboard, {success.name}!</h2>
            <p>Your Pharos account is ready. You can now log in.</p>
            </div>
        );
    }

    return (
        <form className="card" onSubmit={handleSubmit} noValidate>
        <h2>Create your Pharos account</h2>

        <label>
            Name
            <input value={form.name} onChange={update("name")} required />
            {errors.name?.map((m) => <span className="err" key={m}>{m}</span>)}
        </label>

        <label>
            Email
            <input type="email" value={form.email} onChange={update("email")} required />
            {errors.email?.map((m) => <span className="err" key={m}>{m}</span>)}
        </label>

        <label>
            Password
            <input type="password" value={form.password} onChange={update("password")} required />
            {errors.password?.map((m) => <span className="err" key={m}>{m}</span>)}
        </label>

        <label>
            I am a
            <select value={form.role} onChange={update("role")}>
            <option value="learner">Learner</option>
            <option value="mentor">Mentor</option>
            </select>
        </label>

        {topError && <p className="err top">{topError}</p>}
        <button disabled={submitting}>
            {submitting && <span className="spinner" />}
            {submitting ? "Creating account..." : "Sign up"}
        </button>
        </form>
    );
}