import React, { createContext, useState, useEffect, useContext } from "react";
import API from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            if (token) {
                try {
                    // Set token for axios requests if not already set by interceptor
                    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const res = await API.get("/auth/me");
                    setUser(res.data.user);
                } catch (error) {
                    console.error("Failed to fetch user:", error);
                    localStorage.removeItem("token");
                    sessionStorage.removeItem("token");
                }
            }
            setLoading(false);
        };

        fetchUser();
    }, []);

    const login = (userData, token, rememberMe = false) => {
        if (rememberMe) {
            localStorage.setItem("token", token);
        } else {
            sessionStorage.setItem("token", token);
        }
        API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
