import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // loading = true only while we're fetching the initial profile on page load
  const [loading, setLoading] = useState(true);

  // On mount: if a token already exists, restore the session
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api
        .get("/profile/")
        .then((res) => setUser(res.data))
        .catch(() => {
          // Token is invalid/expired — clear it
          localStorage.removeItem("token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  /**
   * Call this from Login instead of setting the token manually.
   * It stores the token, fetches the user, and sets state — all
   * before the caller navigates, so PrivateRoute never sees a
   * "token present but user null" flash.
   */
  const login = async (token) => {
    localStorage.setItem("token", token);
    const res = await api.get("/profile/");
    setUser(res.data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    // Hard redirect so all component state is wiped
    window.location.href = "/login";
  };

  const refreshUser = () =>
    api.get("/profile/").then((res) => setUser(res.data));

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
