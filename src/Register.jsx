import { useState } from "react";
import { register } from "./api";

function Register({ onRegister }) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 👇 Validamos que las contraseñas coincidan
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden" });
      return;
    }

    try {
      const data = await register({ nombre, apellido, email, password });

      if (data.error) {
        setMessage({ type: "error", text: data.error || "Error en registro" });
        return;
      }

      setMessage({
        type: "info",
        text: "✅ Registro exitoso. Tu cuenta está pendiente de aprobación por el administrador.",
      });
      onRegister(); // vuelve al login
    } catch (err) {
      setMessage({ type: "error", text: "Registro fallido: " + err.message });
    }
  };

  return (
    <div className="login-form">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Apellido"
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
          required
        />
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
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button className="btn secondary" type="submit">
          Registrarse
        </button>
        <button
          className="btn primary"
          type="button"
          onClick={onRegister}
        >
          Ya estoy registrado
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

export default Register;