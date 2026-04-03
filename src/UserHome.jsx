import { useState, useEffect } from "react";
import "./UserHome.css";
import "./AppHeader.css";
import { apiGet } from "./api";
import { getFlag } from "./flags";

function UserHome({ token, onLogout }) {
  const [view, setView] = useState("predictions"); // "predictions", "ranking", "results", "userPredictions"
  const [myPredictions, setMyPredictions] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [selectedUserPredictions, setSelectedUserPredictions] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    apiGet("/predictions", token)
      .then(setMyPredictions)
      .catch(err => console.error("Error al cargar mis predicciones:", err));

    apiGet("/ranking", token)
      .then(setRanking)
      .catch(err => console.error("Error al cargar ranking:", err));

    apiGet("/matches", token)
      .then(setMatches)
      .catch(err => console.error("Error al cargar partidos:", err));
  }, [token]);

  const viewUserPredictions = async (userId) => {
    try {
      const data = await apiGet(`/ranking/${userId}`, token);
      setSelectedUser(ranking.find(u => u.id === userId));
      setSelectedUserPredictions(data);
      setView("userPredictions");
    } catch (err) {
      if (err.message.includes("403")) {
        alert("⚠️ Debes confirmar tus pronósticos antes de ver los de otros usuarios.");
      } else {
        alert(`❌ Error al cargar predicciones del usuario: ${err.message}`);
      }
    }
  };

  // Enriquecer mis predicciones con grupo desde matches
  const enrichedPredictions = myPredictions.map(p => {
    const match = matches.find(m => m.id === p.match_id);
    return { ...p, grupo: match?.grupo };
  });

  const groupedPredictions = enrichedPredictions.reduce((acc, p) => {
    const grupo = p.grupo || "Sin grupo";
    if (!acc[grupo]) acc[grupo] = [];
    acc[grupo].push(p);
    return acc;
  }, {});

  // Enriquecer predicciones de otro usuario con grupo
  const enrichedUserPredictions = selectedUserPredictions?.map(p => {
    const match = matches.find(m => m.id === p.match_id);
    return { ...p, grupo: match?.grupo };
  }) || [];

  const groupedUserPredictions = enrichedUserPredictions.reduce((acc, p) => {
    const grupo = p.grupo || "Sin grupo";
    if (!acc[grupo]) acc[grupo] = [];
    acc[grupo].push(p);
    return acc;
  }, {});

  // Agrupar resultados oficiales por grupo
  const groupedMatches = matches.reduce((acc, m) => {
    const grupo = m.grupo || "Sin grupo";
    if (!acc[grupo]) acc[grupo] = [];
    acc[grupo].push(m);
    return acc;
  }, {});

  return (
    <div className="userhome-container">
      {/* 🔹 Header intacto */}
      <header className="app-header">
        <img src="/Logo Molino 4.jpg" alt="Logo Molinos Florencia" className="logo" />
        <h1>Panel de Control Admin</h1>
        <button className="logout-btn" onClick={onLogout}>Cerrar Sesión</button>
      </header>

      <div className="view-buttons">
        <button className={view === "predictions" ? "active" : ""} onClick={() => setView("predictions")}>
          Mis Pronósticos
        </button>
        <button className={view === "ranking" ? "active" : ""} onClick={() => setView("ranking")}>
          Posiciones
        </button>
        <button className={view === "results" ? "active" : ""} onClick={() => setView("results")}>
          Resultados Oficiales
        </button>
      </div>

      {view === "predictions" && (
        <div className="section">
          <h3>Mis Pronósticos</h3>
          {Object.entries(groupedPredictions).map(([grupo, partidos]) => (
            <div key={grupo} className="group-card">
              <h4>Grupo {grupo}</h4>
              {partidos.map((p) => (
                <div key={p.match_id} className="match-card">
                  <div className="local-block">
                    {getFlag(p.local) && <img src={getFlag(p.local)} alt={p.local} />}
                    <span>{p.local}</span>
                    <span className="score">{p.team1 ?? "-"}</span>
                  </div>
                  <span className="vs">VS</span>
                  <div className="visitor-block">
                    <span className="score">{p.team2 ?? "-"}</span>
                    {getFlag(p.visita) && <img src={getFlag(p.visita)} alt={p.visita} />}
                    <span>{p.visita}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {view === "ranking" && (
        <div className="section">
          <h3>Tabla de Posiciones</h3>
          <table className="ranking-table">
            <thead>
              <tr>
                <th className="col-pos">Pos</th>
                <th className="col-nombre">Nombre</th>
                <th className="col-puntos">Puntos</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((user, i) => (
                <tr key={user.id} onClick={() => viewUserPredictions(user.id)}>
                  <td className="col-pos">
                    {i + 1}
                    {i === 0 && <span className="medal gold">🥇</span>}
                    {i === 1 && <span className="medal silver">🥈</span>}
                  </td>
                  <td className="col-nombre">{user.nombre} {user.apellido}</td>
                  <td className="col-puntos">{user.total_puntos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === "userPredictions" && selectedUserPredictions?.length > 0 && (
        <div className="section">
          <h3>Pronósticos de {selectedUser?.nombre} {selectedUser?.apellido}</h3>
          {Object.entries(groupedUserPredictions).map(([grupo, partidos]) => (
            <div key={grupo} className="group-card">
              <h4>Grupo {grupo}</h4>
              {partidos.map((p) => (
                <div key={p.match_id} className="match-card">
                  <div className="local-block">
                    {getFlag(p.local) && <img src={getFlag(p.local)} alt={p.local} />}
                    <span>{p.local}</span>
                    <span className="score">{p.pred_local ?? "-"}</span>
                  </div>
                  <span className="vs">VS</span>
                  <div className="visitor-block">
                    <span className="score">{p.pred_visita ?? "-"}</span>
                    {getFlag(p.visita) && <img src={getFlag(p.visita)} alt={p.visita} />}
                    <span>{p.visita}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
          <button className="back-btn" onClick={() => setView("ranking")}>Volver al Ranking</button>
        </div>
      )}

      {view === "results" && (
        <div className="section">
          <h3>Resultados Oficiales</h3>
          {Object.entries(groupedMatches).map(([grupo, partidos]) => (
            <div key={grupo} className="group-card">
              <h4>Grupo {grupo}</h4>
              {partidos.map((m) => (
                <div key={m.id} className="match-card">
                  <div className="local-block">
                    {getFlag(m.local) && <img src={getFlag(m.local)} alt={m.local} />}
                    <span>{m.local}</span>
                    <span className="score">{m.goles_local ?? "-"}</span>
                  </div>
                  <span className="vs">VS</span>
                  <div className="visitor-block">
                    <span className="score">{m.goles_visita ?? "-"}</span>
                    {getFlag(m.visita) && <img src={getFlag(m.visita)} alt={m.visita} />}
                    <span>{m.visita}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserHome;