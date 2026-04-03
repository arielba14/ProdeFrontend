import { useState, useEffect } from "react";
import AdminResults from "./AdminResults";  
import "./AdminPanel.css";
import AdminSettings from "./AdminSettings";
import { apiGet, apiPut, apiDelete } from "./api"; 

function AdminPanel({ onLogout }) {
  const [view, setView] = useState("pending"); // "pending", "all" o "settings"
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const token = localStorage.getItem("token");

  // Cargar usuarios según la vista seleccionada
  useEffect(() => {
    if (view === "pending") {
      apiGet("/users/pending-users", token)
        .then((data) => setPendingUsers(data))
        .catch((err) => console.error("Error al cargar pendientes:", err));
    } else if (view === "all") {
      apiGet("/users", token)
        .then((data) => setAllUsers(data))
        .catch((err) => console.error("Error al cargar usuarios:", err));
    }
  }, [view, token]);

  // Aprobar usuario pendiente
  const approveUser = (id) => {
    apiPut(`/users/approve/${id}`, token)
      .then(() => setPendingUsers(pendingUsers.filter((u) => u.id !== id)))
      .catch((err) => console.error("Error al aprobar usuario:", err));
  };

  // ❌ Desaprobar usuario (eliminar)
  const deleteUser = (id) => {
    apiDelete(`/users/${id}`, token)
      .then((data) => {
        if (data.hasPredictions) {
          const confirmDelete = window.confirm(data.message);
          if (confirmDelete) {
            apiDelete(`/users/${id}?force=true`, token)
              .then(() => {
                setPendingUsers(pendingUsers.filter((u) => u.id !== id));
                setAllUsers(allUsers.filter((u) => u.id !== id));
                alert("Usuario y sus predicciones eliminados correctamente");
              });
          }
        } else if (data.success) {
          setPendingUsers(pendingUsers.filter((u) => u.id !== id));
          setAllUsers(allUsers.filter((u) => u.id !== id));
          alert("Usuario eliminado correctamente");
        }
      })
      .catch((err) => console.error("Error al eliminar usuario:", err));
  };

  // Cambiar contraseña de usuario activo
  const changePassword = (id, newPassword) => {
    if (!newPassword) return alert("Ingrese una nueva contraseña");
    apiPut(`/change-password/${id}`, token, { newPassword })
      .then(() => alert("Contraseña cambiada correctamente"))
      .catch((err) => console.error("Error al cambiar contraseña:", err));
  };

  return (
    <div className="admin-panel">
      {/* Header fijo con logo y logout */}
      <header className="admin-header">
        <img src="/Logo Molino 4.jpg" alt="Logo Molinos Florencia" className="logo" />
        <h1>Panel de Control Admin</h1>
        <button className="logout-btn" onClick={onLogout}>Cerrar Sesión</button>
      </header>

      {/* Contenido debajo del header */}
      <div className="admin-content">
        <div className="view-buttons">
          <button className={view === "pending" ? "active" : ""} onClick={() => setView("pending")}>
            Usuarios pendientes
          </button>
          <button className={view === "all" ? "active" : ""} onClick={() => setView("all")}>
            Todos los usuarios
          </button>
          <button className={view === "settings" ? "active" : ""} onClick={() => setView("settings")}>
            Configuración
          </button>
          <button
            className={view === "results" ? "active" : ""}
            onClick={() => setView("results")}
          >
            Resultados
          </button>

        </div>

        {view === "pending" && (
          <div className="section">
            <h3>Usuarios pendientes</h3>
            {pendingUsers.length === 0 ? (
              <p>No hay usuarios pendientes.</p>
            ) : (
              pendingUsers.map((user) => (
                <div key={user.id} className="user-card">
                  <div className="user-info">
                    <p><strong>{user.nombre} {user.apellido}</strong> - {user.email}</p>
                  </div>
                  <div className="user-actions">
                    <button onClick={() => approveUser(user.id)}>Aprobar</button>
                    <button onClick={() => deleteUser(user.id)} className="btn-danger">Desaprobar</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {view === "all" && (
          <div className="section">
            <h3>Todos los usuarios</h3>
            {allUsers.length === 0 ? (
              <p>No hay usuarios registrados.</p>
            ) : (
              allUsers.map((user) => (
                <div key={user.id} className="user-card">
                  <div className="user-info">
                    <p><strong>{user.nombre} {user.apellido}</strong> ({user.status}) - {user.email}</p>
                  </div>
                  <div className="user-actions">
                    <input type="password" id={`pwd-${user.id}`} placeholder="Nueva contraseña" />
                    <button onClick={() => {
                      const input = document.getElementById(`pwd-${user.id}`);
                      if (input) changePassword(user.id, input.value);
                    }}>
                      Cambiar
                    </button>
                    <button onClick={() => deleteUser(user.id)} className="btn-danger">Eliminar</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {view === "settings" && (
          <div className="settings-section">
            <h3>Configuración de Pronósticos</h3>
            <AdminSettings token={token} />   {/* 👈 acá pasamos el token */}
          </div>
        )}

        {view === "results" && (
          <div className="results-section">
            <AdminResults token={token} />
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminPanel;