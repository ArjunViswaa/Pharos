import { useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import BrowseMentors from "./BrowseMentors.jsx";

export default function Home() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("browse");

  return (
    <div className="home">
      <nav className="home-nav">
        <button
          className={tab === "browse" ? "tab active" : "tab"}
          onClick={() => setTab("browse")}
        >
          Browse Mentors
        </button>
        <button
          className={tab === "profile" ? "tab active" : "tab"}
          onClick={() => setTab("profile")}
        >
          My Profile
        </button>
        <button className="tab logout" onClick={logout}>
          Log out
        </button>
      </nav>

      {tab === "browse" ? (
        <BrowseMentors />
      ) : (
        <div className="card home-card">
          <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
          <h2>Welcome back, {user.name}</h2>
          <p className="role-badge">{user.role}</p>
          <p className="email">{user.email}</p>
        </div>
      )}
    </div>
  );
}
