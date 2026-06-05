import { createContext, useContext, useEffect, useState } from "react";
import { apiGet, getToken, setToken } from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = getToken();
        if (!token) {
        setLoading(false);
        return;
        }
        apiGet("/api/auth/me")
        .then((data) => setUser(data.user))
        .catch(() => setToken(null))
        .finally(() => setLoading(false));
    }, []);

    function login(token, user) {
        setToken(token);
        setUser(user);
    }

    function logout() {
        setToken(null);
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
        {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
}