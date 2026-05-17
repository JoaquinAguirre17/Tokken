import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

const AuthContext = createContext();
const API = "https://tokkenback2.onrender.com/api";

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =========================
     RESTAURAR SESIÓN AL INICIAR
  ========================= */
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedSession = localStorage.getItem("sessionId");

    if (savedUser && savedSession) {
      setUser(JSON.parse(savedUser));
      setSessionId(savedSession);

      checkSession(savedSession);
    } else {
      setLoading(false);
    }
  }, []);

  /* =========================
     LOGIN
  ========================= */
  const login = (userData, sessionIdValue) => {
    setUser(userData);
    setSessionId(sessionIdValue);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("sessionId", sessionIdValue);
  };

  /* =========================
     LOGOUT
  ========================= */
  const logout = async () => {
    try {
      const token = localStorage.getItem("token");
      const sessionIdStorage = localStorage.getItem("sessionId");

      if (sessionIdStorage) {
        await fetch(`${API}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            sessionId: sessionIdStorage,
          }),
        });
      }
    } catch (error) {
      console.error("Error logout:", error);
    } finally {
      setUser(null);
      setSessionId(null);

      localStorage.clear();
    }
  };

  /* =========================
     CHECK SESSION (ROBUSTO)
  ========================= */
  const checkSession = async (session) => {
    try {
      const res = await fetch(`${API}/auth/check-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: session || sessionId,
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        logout();
      }
    } catch (error) {
      console.error("Error checkSession:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        sessionId,
        login,
        logout,
        checkSession,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);