import { useEffect, useState } from "react";
import SignupForm from "./components/SignupForm.jsx";
import LoginForm from "./components/LoginForm.jsx";

export default function App() {
  const [health, setHealth] = useState(null);
  const [view, setView] = useState("signup");

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
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

      {view === "signup" ? (
        <SignupForm onSwitchToLogin={() => setView("login")} />
      ) : (
        <LoginForm onSwitchToSignup={() => setView("signup")} />
      )}
    </main>
  );
}