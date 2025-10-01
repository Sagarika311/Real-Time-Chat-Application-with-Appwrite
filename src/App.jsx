import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthForm from "./components/AuthForm";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import Toast from "./components/Toast";
import { account } from "./lib/appwrite";

const SKIP_EMAIL_VERIFICATION = true; // Demo mode

const App = () => {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true"
  );
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const userData = await account.get();
        if (!SKIP_EMAIL_VERIFICATION && !userData.emailVerification) {
          showToast("Please verify your email before logging in.", "error");
          await account.deleteSession("current");
        } else {
          setUser(userData);
        }
      } catch (err) {
        console.info("No active session:", err.message);
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, []);

  useEffect(() => {
    if (darkMode) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      {toast && <Toast {...toast} />}
      <Routes>
        {!user ? (
          <>
            <Route
              path="/login"
              element={<AuthForm setUser={setUser} showToast={showToast} />}
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <>
            <Route
              path="/"
              element={
                <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
                  <Sidebar
                    user={user}
                    setUser={setUser}
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                    showToast={showToast}
                  />
                  <ChatWindow user={user} showToast={showToast} />
                </div>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default App;
