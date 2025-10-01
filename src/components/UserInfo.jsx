import React from "react";

const UserInfo = ({ user }) => (
  <div
    className="
      p-4 md:p-6
      rounded-xl
      glassmorphism
      backdrop-blur-lg
      border border-white/20 dark:border-indigo-700/20
      shadow-sm shadow-gray-200/20 dark:shadow-indigo-900/20
      bg-gradient-to-r from-white/60 to-white/20 dark:from-[#0f111e]/80 dark:to-[#1c2132]/70
      mb-4
      flex-shrink-0
    "
  >
    <div className="flex items-center space-x-4">
      {/* Avatar Circle */}
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md shadow-purple-500/30">
        <span className="text-white font-bold text-lg select-none">{user.name?.[0]?.toUpperCase()}</span>
      </div>

      {/* User Info */}
      <div className="flex flex-col justify-center">
        <h3 className="font-semibold text-gray-900 dark:text-indigo-100 text-md">{user.name}</h3>
        <p className="text-sm text-gray-700 dark:text-indigo-200">{user.email}</p>
      </div>
    </div>
  </div>
);

export default UserInfo;
