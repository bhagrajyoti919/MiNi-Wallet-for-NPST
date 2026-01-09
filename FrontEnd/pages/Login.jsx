"use client";
import { useState } from "react";
import { HeroSection } from "../components/HeroSection";
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
    <div className="min-h-screen w-full bg-neutral-950 relative flex flex-col items-center justify-center">
      <HeroSection onLogin={() => setShowLogin(true)} />

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
    </div>
  );
}
