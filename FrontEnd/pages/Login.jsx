"use client";
import { useState } from "react";
import { BackgroundBeams } from "../components/ui/background-beams";
import { AceternityLoginForm } from "../components/AceternityLoginForm";
import { SignupForm } from "../components/ui/signupform";
import api from "../api/api";

export default function Login({ onLogin }) {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (email, password) => {
    console.log("Attempting login with:", email); 
    try {
      setIsLoading(true);
      setError("");
      const response = await api.post("/auth/login", {
        email: email,
        password: password
      });
      console.log("Login success", response.data);
      localStorage.setItem("token", response.data.token);
      onLogin();
    } catch (err) {
      console.error("Login failed details:", err.response ? err.response.data : err.message);
      console.error("Full error:", err);
      if (!err.response) {
        setError("Unable to connect to server. Please check your internet connection or try again later.");
      } else {
        setError(err.response?.data?.detail || "Invalid credentials. Please try again.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full rounded-md bg-neutral-950 relative flex flex-col items-center justify-center antialiased">
      <div className="absolute z-50 inset-0 flex items-center justify-center text-white font-bold px-4 pointer-events-none text-3xl text-center md:text-4xl lg:text-7xl">
        <div className="bg-clip-text text-transparent drop-shadow-2xl bg-gradient-to-b from-white/80 to-white/20">
          FinTech Wallet
        </div>
      </div>
      
      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={() => setShowLogin(true)}
          className="bg-black/50 hover:bg-black/70 text-white px-6 py-2 rounded-full backdrop-blur-sm transition-all border border-white/20"
        >
          Login
        </button>
      </div>

      {showLogin && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4" 
          onClick={() => setShowLogin(false)}
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
            <AceternityLoginForm 
              onLogin={handleLogin} 
              error={error} 
              isLoading={isLoading}
              onSignup={() => {
                setShowLogin(false);
                setShowSignup(true);
              }}
            />
          </div>
        </div>
      )}

      {showSignup && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4" 
          onClick={() => setShowSignup(false)}
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
            <SignupForm 
              onSuccess={() => {
                setShowSignup(false);
                setShowLogin(true);
              }}
            />
          </div>
        </div>
      )}
      <BackgroundBeams />
    </div>
  );
}
