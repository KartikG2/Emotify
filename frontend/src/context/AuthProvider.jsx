import React, { createContext, useEffect, useState, useContext, useCallback, useMemo } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const userData = localStorage.getItem("User");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (err) {
      console.error("Failed to load user from localStorage", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Centralized Login Function - Stable Identity
  const login = useCallback((userData, token) => {
    localStorage.setItem("User", JSON.stringify(userData));
    localStorage.setItem("token", token);
    setUser(userData); // Updates state immediately
  }, []);

  // ✅ Centralized Logout Function - Stable Identity
  const logout = useCallback(() => {
    localStorage.removeItem("User");
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  // ✅ Memoize Provider Value to prevent child re-renders
  const value = useMemo(() => ({
    user,
    login,
    logout,
    loading
  }), [user, login, logout, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);