import React from "react";

const ChatHeader = () => (
  <div
    className="
      bg-white/60 dark:bg-[#0f111e]/80
      backdrop-blur-md
      border-b
      border-pink-400/30 dark:border-indigo-700/30
      p-3
      rounded-b-xl
      shadow-sm shadow-gray-200/20 dark:shadow-indigo-900/20
      flex items-center
      transition-colors duration-300
    "
  >
    {/* Avatar */}
    <div className="w-10 h-10 bg-gradient-to-r from-green-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-400/30">
      <span className="text-white font-semibold text-base">G</span>
    </div>

    {/* Chat Info */}
    <div className="ml-3">
      <h2 className="font-semibold text-gray-900 dark:text-indigo-100 text-base">General Chat</h2>
      <p className="text-sm text-gray-700 dark:text-indigo-200">Public group conversation</p>
    </div>
  </div>
);

export default ChatHeader;
