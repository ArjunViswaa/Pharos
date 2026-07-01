import { useEffect, useState } from "react";
import { apiGet, apiPatch } from "../lib/api.js";

export default function AdminPanel() {
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        apiGet("/api/admin/mentors")
            .then((data) => setMentors(data.mentors))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    async function toggleVerify(id, verified) {
        setUpdatingId(id);
        try {
            await apiPatch(`/api/admin/mentors/${id}/verify`, { verified });
            setMentors((current) =>
                current.map((m) => (m._id === id ? { ...m, verified } : m))
            );
        } catch (err) {
            console.log("Failed to update mentor verification:", err);
        } finally {
            setUpdatingId(null);
        }
    }

    if (loading) return <p className="browse-msg">Loading…</p>;

    if (mentors.length === 0) {
        return <p className="browse-msg">No mentors to review.</p>;
    }

    return (
        <div className="slot-list-wrap">
            <h3 className="slot-list-title">Mentor verification</h3>
            <ul className="admin-list">
                {mentors.map((mentor) => {
                    const name = mentor.userId?.name || "Unknown";
                    return (
                        <li key={mentor._id} className="admin-row">
                            <div className="admin-avatar">{name.charAt(0).toUpperCase()}</div>
                            <div className="admin-info">
                                <span className="admin-name">{name}</span>
                                <span className="admin-headline">{mentor.headline || "—"}</span>
                            </div>
                            <span className={`slot-status ${mentor.verified ? "open" : "booked"}`}>
                                {mentor.verified ? "verified" : "unverified"}
                            </span>
                            <button
                                className={`admin-action ${mentor.verified ? "ghost" : "gold"}`}
                                onClick={() => toggleVerify(mentor._id, !mentor.verified)}
                                disabled={updatingId === mentor._id}
                            >
                                {updatingId === mentor._id
                                    ? "…"
                                    : mentor.verified
                                        ? "Unverify"
                                        : "Verify"}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}