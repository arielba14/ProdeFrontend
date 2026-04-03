import { useState } from "react";
import "./Login.css";

function Login({ onLogin, onSwitchRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: "error", text: data.error || "Error en login" });
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("predictionsConfirmed", Number(data.predictionsConfirmed));

      onLogin({
        token: data.token,
        role: data.role,
        predictionsConfirmed: Number(data.predictionsConfirmed),
      });

      setMessage({ type: "success", text: "¡Login exitoso! Bienvenido." });
    } catch (err) {
      setMessage({ type: "error", text: "Login fallido: " + err.message });
    }
  };

  return (
    <div className="login-form">
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="btn primary" type="submit">
          Iniciar Sesión
        </button>
        <button
          className="btn secondary"
          type="button"
          onClick={onSwitchRegister}
        >
          Registrarse
        </button>
      </form>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}

export default Login;