import React, { useState } from 'react';
import './AppHeader.css';
import ReglamentoModal from './ReglamentoModal';

function AppHeader({ handleLogout }) {
  const [showReglamento, setShowReglamento] = useState(false);

  return (
    <>
      <header className="app-header">
        <img 
          src="/Logo Molino 4.jpg" 
          alt="Logo Molinos Florencia" 
          className="logo" 
        />
        <h1>Prode Mundial Molinos Florencia</h1>
        <nav className="nav-links">
          <button 
            className="reglamento-link" 
            onClick={() => setShowReglamento(true)}
          >
            Reglamento
          </button>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </header>

      {showReglamento && (
        <ReglamentoModal onClose={() => setShowReglamento(false)} />
      )}
    </>
  );
}

export default AppHeader;