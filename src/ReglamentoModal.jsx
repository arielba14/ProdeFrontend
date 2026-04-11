import React from 'react';
import './ReglamentoModal.css';

function ReglamentoModal({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Reglamento Prode Mundial FIFA 2026</h2>
        <ol>
          <li>Pueden participar únicamente empleados de <strong>Molinos Florencia S.A.U.</strong>. La participación es gratuita y voluntaria.</li>
          <li>El juego abarca sólo la primera fase del Mundial FIFA 2026 (72 partidos desde el <strong>11/06/26</strong>).</li>
          <li>Para participar se debe ingresar a{" "} 
            <a href="https://prodemolinosflorencia.netlify.app" target="_blank" rel="noopener noreferrer">
              prodemolinosflorencia.netlify.app
            </a>, registrarse y ser autorizado por el administrador.
          </li>
          <li> El juego consiste en predecir los resultados de cada partido, que luego se puntuará de acuerdo al resultado oficial.</li> 
          <li><strong>Sistema de puntuación:</strong>
            <ul>
              <li>Acierto exacto: <strong>3 pts</strong></li>
              <li>Acierto parcial: <strong>1 pt</strong></li>
              <li>Sin acierto: <strong>0 pts</strong></li>
            </ul>
          </li>
          <li>Ganadores: 
            <ul>
              <li>Mayor cantidad de puntos.</li>
              <li>En caso de empate, más aciertos exactos.</li>
              <li>Si persiste, sorteo.</li> 
              <li>En caso de terminar 2 ó más participantes con la misma cantidad de puntos y de aciertos exactos en el primer puesto el orden de cada participante se definirá por sorteo.</li>
            </ul>
          </li>
          <li>Una vez confirmados los pronósticos no se pueden modificar.</li>
          <li>Límite para confirmar: <strong>10/06/26 a las 12:00 hs</strong>. El usuario que haya guardado los pronósticos y no los haya confirmado no será tenido en cuenta.</li>
          <li>Una vez confirmado los pronósticos cada participante puede acceder a ver sus pronósticos, los resultados oficiales y el ranking de participantes.</li>
          <li>El juego no tiene costo.</li>
          <li><strong>Premios:</strong>
            <ul>
              <li>1er Premio: Una cena para dos personas</li>
              <li>2do Premio: Un desayuno para dos personas</li>
            </ul>
          </li>
        </ol>
        <button className="close-btn" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}

export default ReglamentoModal;