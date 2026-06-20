import { useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import BrowseMentors from "./BrowseMentors.jsx";
import BecomeMentor from "./BecomeMentor.jsx";
import MyAvailability from "./MyAvailability.jsx";

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
          className={tab === "become" ? "tab active" : "tab"}
          onClick={() => setTab("become")}
        >
          Become a Mentor
        </button>
        <button
          className={tab === "availability" ? "tab active" : "tab"}
          onClick={() => setTab("availability")}
        >
          My Availability
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
      ) : tab === "become" ? (
        <BecomeMentor onCreated={() => setTab("browse")} />
      ) : tab === "availability" ? (
        <MyAvailability />
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
