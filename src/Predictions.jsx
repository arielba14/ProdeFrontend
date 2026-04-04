import { useState, useEffect } from "react";
import "./Predictions.css";
import "./AppHeader.css";
import { apiGet, apiPost } from "./api";
import { getFlag } from "./flags";

function Predictions({ token, onLogout, onConfirmPredictions }) {
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await apiGet("/matches", token);
        setMatches(data);
      } catch (err) {
        alert(`❌ Error al cargar partidos: ${err.message}`);
      }
    };

    const fetchPredictions = async () => {
      try {
        const data = await apiGet("/predictions", token);
        if (!Array.isArray(data)) throw new Error(data.error || "Respuesta inesperada");
        const predObj = {};
        data.forEach((p) => {
          predObj[p.match_id] = {
            team1: p.team1 !== null ? Number(p.team1) : null,
            team2: p.team2 !== null ? Number(p.team2) : null,
            puntos: p.puntos // 👉 guardar los puntos
          };
          if (p.confirmed) setConfirmed(true);
        });
        setPredictions(predObj);
      } catch (err) {
        alert(`❌ Error al cargar predicciones: ${err.message}`);
      }
    };

    fetchMatches();
    fetchPredictions();
  }, [token]);

  const handlePrediction = (matchId, team, value) => {
    if (confirmed) return;
    setPredictions({
      ...predictions,
      [matchId]: {
        ...predictions[matchId],
        [team]: value === "" ? null : Number(value) // guardamos como número
      }
    });
  };

  const savePredictions = async () => {
    try {
      const payload = Object.entries(predictions).map(([matchId, result]) => ({
        matchId,
        team1: result.team1,
        team2: result.team2
      }));
      await apiPost("/predictions", token, { predictions: payload, confirm: false });
      alert("✅ Predicciones guardadas");
    } catch (err) {
      alert(`❌ Error al guardar: ${err.message}`);
    }
  };

  const confirmPredictions = async () => {
    const incompletos = matches.some(
      (m) =>
        predictions[m.id]?.team1 == null ||
        predictions[m.id]?.team2 == null
    );

    if (incompletos) {
      alert("⚠️ Debes completar todos los partidos antes de confirmar.");
      return;
    }

    try {
      const payload = Object.entries(predictions).map(([matchId, result]) => ({
        matchId,
        team1: result.team1,
        team2: result.team2
      }));
      await apiPost("/predictions", token, { predictions: payload, confirm: true });
      setConfirmed(true);
      localStorage.setItem("predictionsConfirmed", 1);
      if (onConfirmPredictions) onConfirmPredictions();
      alert("✅ Predicciones confirmadas, ya no se pueden modificar");
    } catch (err) {
      alert(`❌ Error al confirmar: ${err.message}`);
    }
  };

  // Calcular progreso
  const totalMatches = matches.length;
  const completedMatches = matches.filter(
    (m) =>
      predictions[m.id]?.team1 != null &&
      predictions[m.id]?.team2 != null
  ).length;
  const remainingMatches = totalMatches - completedMatches;
  const progressPercent = totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0;

  // Agrupar partidos por grupo
  const groupedMatches = matches.reduce((acc, match) => {
    if (!acc[match.grupo]) acc[match.grupo] = [];
    acc[match.grupo].push(match);
    return acc;
  }, {});

  // Normalizar nombres
  const normalizeName = (name) => {
    if (name === "katar") return "Qatar";
    return name;
  };

  return (
    <div className="predictions-container">
      <header className="app-header">
        <img src="/Logo Molino 4.jpg" alt="Logo Molinos Florencia" className="logo" />
        <h1>Prode Mundial Molinos Florencia</h1>
        <button className="logout-btn" onClick={onLogout}>Cerrar Sesión</button>
      </header>

      {/* Barra de progreso */}
      {!confirmed && (
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
          <p>{remainingMatches > 0 
              ? `Faltan ${remainingMatches} partidos por completar` 
              : "Todos los partidos están completos ✅"}</p>
        </div>
      )}

      {/* Renderizar partidos agrupados */}
      {Object.entries(groupedMatches).map(([grupo, partidos]) => (
        <div key={grupo} className="grupo-block">
          <h2>Grupo {grupo}</h2>
          {partidos.map((match) => {
            const team1Val = predictions[match.id]?.team1 ?? "";
            const team2Val = predictions[match.id]?.team2 ?? "";
            const team1Incomplete = predictions[match.id]?.team1 == null;
            const team2Incomplete = predictions[match.id]?.team2 == null;

            // 👉 Nuevo: puntos obtenidos
            const points = predictions[match.id]?.puntos; // 0, 1, 2 o 3
            let pointsClass = "";
            if (points === 3) pointsClass = "points-3";
            else if (points === 1) pointsClass = "points-1";
            else if (points === 0) pointsClass = "points-0";

            return (
              <div
                key={match.id}
                className={`match-card ${team1Incomplete || team2Incomplete ? "incomplete-card" : ""} ${pointsClass}`}
              >
                <div className="local-block">
                  {getFlag(match.local) && (
                    <img src={getFlag(match.local)} alt={normalizeName(match.local)} />
                  )}
                  <span>{normalizeName(match.local)}</span>
                  <input
                    className={`score ${team1Incomplete ? "incomplete" : ""}`}
                    type="number"
                    min="0"
                    step="1"
                    value={team1Val}
                    onChange={(e) => handlePrediction(match.id, "team1", e.target.value)}
                    disabled={confirmed}
                  />
                </div>

                <span className="vs">VS</span>

                <div className="visitor-block">
                  <input
                    className={`score ${team2Incomplete ? "incomplete" : ""}`}
                    type="number"
                    min="0"
                    step="1"
                    value={team2Val}
                    onChange={(e) => handlePrediction(match.id, "team2", e.target.value)}
                    disabled={confirmed}
                  />
                  {getFlag(match.visita) && (
                    <img src={getFlag(match.visita)} alt={normalizeName(match.visita)} />
                  )}
                  <span>{normalizeName(match.visita)}</span>
                </div>

                {/* 👉 Opcional: mostrar puntos */}
                {points !== undefined && confirmed && (
                  <div className="points-label">+{points} pts</div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      <div className="buttons-row">
        {!confirmed && (
          <>
            <button className="action-btn" onClick={savePredictions}>Guardar Pronósticos</button>
            <button className="action-btn" onClick={confirmPredictions}>Confirmar Pronósticos</button>
          </>
        )}
        {confirmed && <p className="info-text">✅ Predicciones confirmadas. Solo lectura.</p>}
      </div>
    </div>
  );
}

export default Predictions;