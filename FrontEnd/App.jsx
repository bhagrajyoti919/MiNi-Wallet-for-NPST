import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Signup from "./pages/Signup";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          loggedIn ? (
            <Dashboard onLogout={() => setLoggedIn(false)} />
          ) : (
            <Login onLogin={() => setLoggedIn(true)} />
          )
        } 
      />
      <Route path="/signup" element={<Signup />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
