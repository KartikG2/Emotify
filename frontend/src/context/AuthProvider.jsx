import React, { createContext, useEffect, useState, useContext } from "react";

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

  // ✅ Centralized Login Function
  const login = (userData, token) => {
    localStorage.setItem("User", JSON.stringify(userData));
    localStorage.setItem("token", token);
    setUser(userData); // Updates state immediately
  };

  // ✅ Centralized Logout Function
  const logout = () => {
    localStorage.removeItem("User");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);