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
     RESTAURAR SESIÓN
  ========================= */
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedSession = localStorage.getItem("sessionId");

    console.log("👤 USER STORAGE:", savedUser);
    console.log("🆔 SESSION STORAGE:", savedSession);

    if (savedUser && savedSession) {

      const parsedUser = JSON.parse(savedUser);

      console.log("✅ RESTAURANDO USUARIO:", parsedUser);

      setUser(parsedUser);
      setSessionId(savedSession);

      checkSession(savedSession);

    } else {

      console.log("❌ NO HAY DATOS EN LOCALSTORAGE");

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
          sessionId: session,
        }),
      });

      // 🔥 PROTECCIÓN ANTI-HTML / ERROR SERVER
      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.warn("⚠️ Backend no devolvió JSON (Render/Woo/API caída)");
        setLoading(false);
        return; // ❌ NO logout
      }

      // 🔥 SOLO LOGOUT SI ES EXPIRACIÓN REAL
      if (data?.ok === false && data?.reason === "expired") {
        logout();
        return;
      }

      setLoading(false);

    } catch (error) {
      console.warn("⚠️ checkSession falló (NO logout):", error);
      setLoading(false);
    }
  };
  console.log("AUTH STATE:", {
    user,
    sessionId,
    loading
  });
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