import { useAuth } from "../auth/AuthContext.jsx";

export default function Home() {
    const { user, logout } = useAuth();

    return (
        <div className="card home-card">
        <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
        <h2>Welcome back, {user.name}</h2>
        <p className="role-badge">{user.role}</p>
        <p className="email">{user.email}</p>
        <button onClick={logout} className="secondary">Log out</button>
        </div>
    );
}