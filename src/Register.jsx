import { useState } from "react";
import { register } from "./api"; // 👈 importamos la función centralizada

function Register({ onRegister }) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await register({ nombre, apellido, email, password, whatsapp });

      if (data.error) {
        // Mostramos el error real que devuelve el backend
        setMessage({ type: "error", text: data.error || "Error en registro" });
        return;
      }

      // Registro exitoso pero pendiente de aprobación
      setMessage({
        type: "info",
        text: "✅ Registro exitoso. Tu cuenta está pendiente de aprobación por el administrador.",
      });
      onRegister();
    } catch (err) {
      setMessage({ type: "error", text: "Registro fallido: " + err.message });
    }
  };

  return (
    <>
      <form className="login-form" onSubmit={handleSubmit}>
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
          type="tel"
          placeholder="WhatsApp (solo números)"
          value={whatsapp}
          onChange={(e) => {
            const onlyNumbers = e.target.value.replace(/\D/g, "");
            setWhatsapp(onlyNumbers);
          }}
          required
        />
        <button className="btn secondary" type="submit">
          Registrarse
        </button>
      </form>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
    </>
  );
}

export default Register;