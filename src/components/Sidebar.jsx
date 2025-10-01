import React from "react";
import UserInfo from "./UserInfo";
import OnlineUsers from "./OnlineUsers";
import { useAuth } from "../hooks/useAuth";
import { usePresence } from "../hooks/usePresence";

const Sidebar = ({ user, setUser, darkMode, setDarkMode, showToast }) => {
  const { logout } = useAuth(setUser, showToast);
  const { onlineUsers } = usePresence(user);

  return (
    <div
      className={`
        w-80 flex flex-col
        rounded-tr-2xl rounded-br-2xl
        backdrop-blur-lg
        border-r
        shadow-lg
        overflow-hidden
        transition-colors duration-500
        ${
          darkMode
            ? "bg-gradient-to-b from-[#0f111e]/80 via-[#1c2132]/70 to-[#0b0f1c]/80 border-indigo-700/20 shadow-indigo-900/20"
            : "bg-gradient-to-b from-[#f9fafb]/80 via-[#f3f4f6]/70 to-[#e5e7eb]/80 border-gray-300/30 shadow-gray-200/20"
        }
      `}
    >
      {/* Header */}
      <div
        className={`
          p-6 flex items-center justify-between
          border-b
          backdrop-blur-md
          ${darkMode ? "border-indigo-700/20" : "border-gray-300/30"}
        `}
      >
        <h1 className={`text-2xl font-bold ${darkMode ? "text-white drop-shadow-md" : "text-gray-900 drop-shadow-sm"}`}>ChatApp</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 transition-colors rounded-lg ${darkMode ? "text-indigo-200 hover:text-indigo-400" : "text-gray-600 hover:text-gray-800"}`}
            title="Toggle dark mode"
          >
            {darkMode ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
              </svg>
            )}
          </button>

          <button
            onClick={() => logout(user)}
            className={`p-2 transition-colors rounded-lg ${darkMode ? "text-indigo-200 hover:text-indigo-400" : "text-gray-600 hover:text-gray-800"}`}
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
      </div>

      <UserInfo user={user} />
      <OnlineUsers currentUser={user} onlineUsers={onlineUsers} />
    </div>
  );
};

export default Sidebar;
