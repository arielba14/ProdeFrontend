import { useState, useEffect } from "react";
import { apiGet, apiPut } from "./api";
import { showAlert } from "./alertService";

function AdminSettings({ token }) {
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState(null);

  // Obtener fecha límite actual
  useEffect(() => {
    const fetchDeadline = async () => {
      try {
        if (!token) return;
        const data = await apiGet("/settings/deadline", token);

        if (data.fecha_limite) {
          const formatted = data.fecha_limite.slice(0, 16);
          setDeadline(formatted);
        }
      } catch (err) {
        console.error("Error al cargar fecha límite:", err);
        setError(err.message);
      }
    };

    fetchDeadline();
  }, [token]);

  // Guardar nueva fecha límite
  const saveDeadline = async () => {
    try {
      if (!token) throw new Error("No hay token válido disponible");
      const data = await apiPut("/settings/deadline", token, { fecha_limite: deadline });
      showAlert(data.success ? "Fecha límite actualizada" : data.error, "error");
    } catch (err) {
      console.error("Error al guardar fecha límite:", err);
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Configurar fecha límite de pronósticos</h2>
      {error && <p className="error">Error: {error}</p>}
      <input
        type="datetime-local"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
      />
      <button onClick={saveDeadline}>Guardar</button>
    </div>
  );
}

export default AdminSettings;