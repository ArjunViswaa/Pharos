import { useEffect, useState } from "react";
import { useAuth } from "./auth/AuthContext.jsx";
import SignupForm from "./components/SignupForm.jsx";
import LoginForm from "./components/LoginForm.jsx";
import Home from "./components/Home.jsx";
import { apiGet } from "./lib/api.js";

export default function App() {
  const { user, loading } = useAuth();
  const [health, setHealth] = useState(null);
  const [view, setView] = useState("login");

  useEffect(() => {
    apiGet("/api/health")
      .then(setHealth)
      .catch(() => setHealth({ status: "unreachable" }));
  }, []);

  return (
    <main className="app">
      <h1>Pharos</h1>
      <p className="tagline">Guiding learners to the shore of expertise.</p>
      <section className="status">
        <span className={`dot ${health?.status === "ok" ? "ok" : "off"}`} />
        <span>API: {health ? health.status : "checking..."}</span>
      </section>

      {loading ? (
        <div className="card"><p style={{ color: "var(--muted)", margin: 0 }}>Loading…</p></div>
      ) : user ? (
        <Home />
      ) : view === "signup" ? (
        <SignupForm onSwitchToLogin={() => setView("login")} />
      ) : (
        <LoginForm onSwitchToSignup={() => setView("signup")} />
      )}
    </main>
  );
}