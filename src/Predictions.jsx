import { useState, useEffect } from "react";
import "./Predictions.css";
import { apiGet, apiPost } from "./api";
import { getFlag } from "./flags";
import { showAlert } from "./alertService";
import AppHeader from './AppHeader';

function Predictions({ token, onLogout, onConfirmPredictions }) {
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [confirmed, setConfirmed] = useState(false);

  // Verificar fecha límite apenas carga el componente
  useEffect(() => {
    const checkDeadline = async () => {
      try {
        const data = await apiGet("/settings/obtenerFecha", token);
        console.log(data.fecha_limite)
        if (data.fecha_limite) {
          const deadline = new Date(data.fecha_limite);
          const now = new Date();

          if (now > deadline) {
            // Si ya pasó la fecha y NO están confirmadas
            if (!confirmed) {
              showAlert("⏰ El tiempo para cargar pronósticos ya terminó. No puedes participar.", "error");
              localStorage.removeItem("token");
              localStorage.removeItem("role");
              localStorage.removeItem("predictionsConfirmed");
              window.location.reload();
            }
          }
        }
      } catch (err) {
        console.error("Error al verificar fecha límite:", err);
      }
    };
    checkDeadline();
  }, [token, confirmed]);

  // Cargar partidos y predicciones
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await apiGet("/matches", token);
        setMatches(data);
      } catch (err) {
        showAlert(`❌ Error al cargar partidos: ${err.message}`, "error");
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
            team2: p.team2 !== null ? Number(p.team2) : null
          };
          if (p.confirmed) setConfirmed(true);
        });
        setPredictions(predObj);
      } catch (err) {
        showAlert(`❌ Error al cargar predicciones: ${err.message}`, "error");
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
        [team]: value === "" ? null : Number(value)
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
      showAlert("✅ Predicciones guardadas", "success");
    } catch (err) {
      showAlert(`❌ Error al guardar: ${err.message}`, "error");
    }
  };

  const confirmPredictions = async () => {
    const incompletos = matches.some(
      (m) =>
        predictions[m.id]?.team1 == null ||
        predictions[m.id]?.team2 == null
    );

    if (incompletos) {
      showAlert("⚠️ Debes completar todos los partidos antes de confirmar.");
      return;
    }

    try {
      const payload = Object.entries(predictions).map(([matchId, result]) => ({
        matchId,
        team1: result.team1,
        team2: result.team2
      }));
      const response = await apiPost("/predictions", token, { predictions: payload, confirm: true });

      if (response.error) {
        showAlert(`❌ Error al confirmar: ${response.error}`, "error");
        return; // 👈 no seguir si hubo error
      }

      setConfirmed(true);
      localStorage.setItem("predictionsConfirmed", 1);
      if (onConfirmPredictions) onConfirmPredictions();
      showAlert("✅ Predicciones confirmadas, ya no se pueden modificar", "success");
    } catch (err) {
      showAlert(`❌ Error al confirmar: ${err.message}`, "error");
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <div className="predictions-container">
      <AppHeader handleLogout={handleLogout} />

      {/* Barra de progreso fija */}
      {!confirmed && (
        <div className="progress-fixed">
          <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
          <p>
            {remainingMatches > 0 
              ? `Faltan ${remainingMatches} partidos por completar` 
              : "Todos los partidos están completos ✅"}
          </p>
        </div>
      )}

      {/* Scroll solo en partidos */}
      <div className="matches-scroll">
        {Object.entries(groupedMatches).map(([grupo, partidos]) => (
          <div key={grupo} className="grupo-block">
            <h2>Grupo {grupo}</h2>
            {partidos.map((match) => {
              const team1Val = predictions[match.id]?.team1 ?? "";
              const team2Val = predictions[match.id]?.team2 ?? "";
              const team1Incomplete = predictions[match.id]?.team1 == null;
              const team2Incomplete = predictions[match.id]?.team2 == null;

              return (
                <div
                  key={match.id}
                  className={`match-card ${team1Incomplete || team2Incomplete ? "incomplete-card" : ""}`}
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
                      onInput={(e) => {
                        e.target.value = e.target.value.replace(/[.,]/g, "");
                      }}
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
                      onInput={(e) => {
                        e.target.value = e.target.value.replace(/[.,]/g, "");
                      }}
                      disabled={confirmed}
                    />
                    {getFlag(match.visita) && (
                      <img src={getFlag(match.visita)} alt={normalizeName(match.visita)} />
                    )}
                    <span>{normalizeName(match.visita)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

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