import { useState, useEffect } from "react";
import { apiGet, apiPut } from "./api";
import { getFlag } from "./flags";
import "./AdminResults.css";

function AdminResults({ token }) {
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiGet("/results/matches", token)
      .then((data) => {
        setMatches(data);
      })
      .catch((err) => setError(err.message));
  }, [token]);

  const saveResult = (id, goles_local, goles_visita) => {
    apiPut(`/results/matches/${id}`, token, { goles_local, goles_visita })
      .then((data) => {
        if (data.success) {
          showAlert("✅ Resultado actualizado", "success");
        } else {
          showAlert(data.error || "❌ Ocurrió un error", "error");
        }
      })
      .catch((err) => setError(err.message));
  };

  // Agrupar partidos por grupo
  const groupedMatches = matches.reduce((acc, match) => {
    if (!acc[match.grupo]) acc[match.grupo] = [];
    acc[match.grupo].push(match);
    return acc;
  }, {});

  return (
    <div className="section">
      <h3>Resultados de Partidos</h3>
      {error && <p className="error">Error: {error}</p>}
      {matches.length === 0 ? (
        <p>No hay partidos cargados.</p>
      ) : (
        Object.entries(groupedMatches).map(([grupo, partidos]) => (
          <div key={grupo} className="group-card">
            <h4>Grupo {grupo}</h4>
            {partidos.map((match) => (
              <div key={match.id} className="match-card">
                <div className="match-grid">
                  <div className="team">
                    {getFlag(match.local) && (
                      <img src={getFlag(match.local)} alt={match.local} className="flag" />
                    )}
                    <span className="team-name">{match.local}</span>
                  </div>
                  <input
                    type="number"
                    value={match.goles_local ?? ""}
                    onChange={(e) =>
                      setMatches((prev) =>
                        prev.map((m) =>
                          m.id === match.id ? { ...m, goles_local: e.target.value } : m
                        )
                      )
                    }
                    className="score-input"
                  />
                  <div className="team">
                    {getFlag(match.visita) && (
                      <img src={getFlag(match.visita)} alt={match.visita} className="flag" />
                    )}
                    <span className="team-name">{match.visita}</span>
                  </div>
                  <input
                    type="number"
                    value={match.goles_visita ?? ""}
                    onChange={(e) =>
                      setMatches((prev) =>
                        prev.map((m) =>
                          m.id === match.id ? { ...m, goles_visita: e.target.value } : m
                        )
                      )
                    }
                    className="score-input"
                  />
                  <button
                    className="save-btn"
                    onClick={() =>
                      saveResult(match.id, match.goles_local, match.goles_visita)
                    }
                  >
                    Guardar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

export default AdminResults;