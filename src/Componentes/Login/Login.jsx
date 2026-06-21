import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Contex/AuthContext";
import "./Login.css";

const API = "https://tokkenback2.onrender.com/api";

export default function Login() {

  const navigate = useNavigate();

  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const res = await fetch(`${API}/auth/login`, {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          username,
          password,
        }),

      });

      const data = await res.json();

      console.log("🔐 LOGIN RESPONSE:", data);

      if (!res.ok) {

        alert(data.error || "Error login");

        return;

      }

      /* =========================
         TOKEN
      ========================= */
      localStorage.setItem(
        "token",
        data.token
      );

      /* =========================
         SESSION ID
      ========================= */
      localStorage.setItem(
        "sessionId",
        data.sessionId
      );

      /* =========================
         USER
      ========================= */
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      /* =========================
         CONTEXT
      ========================= */
      login(
        data.user,
        data.sessionId
      );

      console.log(
        "✅ SESSION GUARDADA:",
        data.sessionId
      );

      /* =========================
         REDIRECT
      ========================= */

      const rol = data.user?.rol;

      if (
        rol === "vendedor"
      ) {

        navigate("/venta/venta");

      } else if (
        rol === "admin" ||
        rol === "owner"
      ) {

        navigate("/venta/venta");

      } else {

        navigate("/login");

      }

    } catch (error) {

      console.error(
        "❌ ERROR LOGIN:",
        error
      );

      alert("Error servidor");

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="login-container">

      <form
        className="login-form"
        onSubmit={handleSubmit}
      >

        <h2>Iniciar sesión</h2>

        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) =>
            setUsername(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button type="submit">

          {loading
            ? "Ingresando..."
            : "Ingresar"}

        </button>

      </form>

    </div>

  );

}