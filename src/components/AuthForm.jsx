import React, { useState, useEffect } from "react";  
import { useAuth } from "../hooks/useAuth";
import { Mail, Lock, User } from "lucide-react";
import { usePresence } from "../hooks/usePresence";

const AuthForm = ({ setUser, showToast }) => {
  const [authView, setAuthView] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const { login, register, loading } = useAuth(setUser, showToast);
  const { updatePresence } = usePresence({ $id: null }); // temporary placeholder

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedName = name.trim();

    if (authView === "login") {
      await login(trimmedEmail, trimmedPassword);
      if (updatePresence) updatePresence(); // trigger presence after login
    } else {
      await register(trimmedEmail, trimmedPassword, trimmedName);
      if (updatePresence) updatePresence(); // trigger presence after registration

      // Clear form after registration
      setAuthView("login");
      setEmail("");
      setPassword("");
      setName("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-cyan-100 to-indigo-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 fade-in">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-tr from-emerald-400 via-cyan-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to ChatApp
          </h1>
          <p className="text-gray-600">Secure real-time messaging</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {authView === "register" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative group">
                <User className="w-5 h-5 text-black absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 group-focus-within:text-emerald-500 drop-shadow-sm" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="w-full px-4 py-3 pl-11 rounded-xl bg-white border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="w-5 h-5 text-black absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 group-focus-within:text-cyan-500 drop-shadow-sm" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 pl-11 rounded-xl bg-white border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative group">
              <Lock className="w-5 h-5 text-black absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 group-focus-within:text-purple-500 drop-shadow-sm" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                minLength={8}
                className="w-full px-4 py-3 pl-11 rounded-xl bg-white border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-400 via-cyan-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium shadow-md hover:from-emerald-500 hover:via-cyan-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : authView === "login" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          {authView === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setAuthView(authView === "login" ? "register" : "login")}
            className="text-cyan-600 hover:text-cyan-800 font-medium transition-colors"
          >
            {authView === "login" ? "Sign up now" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
