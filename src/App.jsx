import { useState } from "react";
import "./App.css";
import Login from "./Login";
import Register from "./Register";
import AdminPanel from "./AdminPanel"; 
import UserHome from "./UserHome";    
import Predictions from "./Predictions";

function App() {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [predictionsConfirmed, setPredictionsConfirmed] = useState(0);

  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = (data) => {
    if (data.token) {
      setToken(data.token);
    }
    if (data.role) {      
      setRole(data.role);
    }
    if (data.predictionsConfirmed !== undefined) {
      const confirmedValue = Number(data.predictionsConfirmed);      
      setPredictionsConfirmed(confirmedValue);
    } else {     
      setPredictionsConfirmed(0);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setRole(null);
    setPredictionsConfirmed(0);
  };

  if (!token) {
    return (
      <div className="container">
        <header className="header">
          <img src="/Logo Molino 4.jpg" alt="Logo Molinos Florencia" className="logo" />
          <h1>PRODE MUNDIAL MOLINOS FLORENCIA</h1>
        </header>

        {showRegister ? (
          <Register onRegister={() => setShowRegister(false)} />
        ) : (
          <Login onLogin={handleLogin} onSwitchRegister={() => setShowRegister(true)} />
        )}
      </div>
    );
  }

  if (role === "admin") {
    return <AdminPanel token={token} onLogout={handleLogout} />;
  }

  if (role === "user" && predictionsConfirmed === 0) {
    return (
      <div className="predictions-wrapper">
        <Predictions
          token={token}
          onLogout={handleLogout}
          onConfirmPredictions={() => setPredictionsConfirmed(1)}
        />
      </div>
    );
  }

  return <UserHome token={token} onLogout={handleLogout} />;
}

export default App;