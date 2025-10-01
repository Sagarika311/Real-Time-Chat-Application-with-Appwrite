import React from "react";

const OnlineUsers = ({ currentUser, onlineUsers = [] }) => {
  // Filter out invalid or unauthorized users
  const validUsers = onlineUsers.filter(
    (u) => u.$id && u.$id !== currentUser.$id && u.username
  );

  return (
    <div
      className="
        flex-1 p-4 md:p-6
        glassmorphism
        backdrop-blur-lg
        rounded-xl
        overflow-y-auto
        border border-white/20 dark:border-indigo-700/20
        shadow-sm shadow-gray-500/10 dark:shadow-indigo-900/20
        bg-gradient-to-b from-white/60 to-white/20 dark:from-[#0f111e]/80 dark:to-[#1c2132]/70
      "
    >
      <h4 className="font-semibold text-gray-800 dark:text-indigo-200 mb-4 text-lg">
        Online Users
      </h4>

      <div className="space-y-2">
        {/* Current User */}
        <div className="flex items-center space-x-3 p-2 rounded-lg bg-white/30 dark:bg-indigo-900/40 shadow-sm shadow-gray-200/20 dark:shadow-indigo-900/40">
          <div className="relative">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {currentUser.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full animate-pulse" />
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-indigo-100">
            You
          </span>
        </div>

        {/* Other Users */}
        {validUsers.map((u) => (
          <div
            key={u.$id}
            className="
              flex items-center space-x-3 p-2 rounded-lg
              hover:bg-white/20 dark:hover:bg-indigo-800/30
              transition-colors duration-200
            "
          >
            <div className="relative">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                  u.color || "bg-gray-400"
                }`}
              >
                {u.username?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full animate-pulse" />
            </div>
            <span className="text-sm font-medium text-gray-800 dark:text-indigo-100">
              {u.username}
            </span>
          </div>
        ))}

        {validUsers.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-indigo-300 mt-2">
            No other users online.
          </p>
        )}
      </div>
    </div>
  );
};

export default OnlineUsers;
