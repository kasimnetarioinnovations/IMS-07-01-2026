import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../../pages/config/axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  const logout = async () => {
    setUser(null);
    try {
      await api.post("/api/auth/logout");
    } catch { }
  };

  const fetchUser = async () => {
    try {
      const res = await api.get("/api/auth/me");
      setUser(res.data.user);
    } catch (err) {
      // 🔕 DO NOT clear user here
      // token may not be ready yet (OTP race)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const path = window.location.pathname;

    // 🚫 Never check auth during auth flows
    const skipPaths = [
      "/login",
      "/signin",
      "/otp",
      "/forgot-password",
      "/reset-password",
    ];

    if (skipPaths.includes(path)) {
      setLoading(false);
      setAuthReady(true);
      return;
    }

    // ✅ If user already exists (OTP just set it), skip /me
    if (user) {
      setLoading(false);
      setAuthReady(true);
      return;
    }

    fetchUser().finally(() => {
      setAuthReady(true);
    });
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, authReady, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
