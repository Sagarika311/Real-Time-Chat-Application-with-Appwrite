// src/components/MessageBubble.jsx
import React, { useRef, useEffect, useState } from "react";
import { formatTime } from "../utils/formatTime";

const MessageBubble = ({ message, currentUser, onEdit, onDelete }) => {
  const isOwn = message.userId === currentUser.$id;

  // Local editing state
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-focus input when editing
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
      // Mark this message as being edited by current user
      onEdit(message.$id, message.content, { setEditingBy: currentUser.$id, setEditingByName: currentUser.name || currentUser.email });
    }
  }, [isEditing]);

  // Cancel if clicked outside edit box
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isEditing && containerRef.current && !containerRef.current.contains(e.target)) {
        handleCancel();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === message.content) {
      handleCancel();
      return;
    }
    onEdit(message.$id, trimmed, { clearEditingBy: true });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(message.content);
    onEdit(message.$id, message.content, { clearEditingBy: true });
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      onDelete(message.$id);
    }
  };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4 fade-in`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? "ml-auto" : "mr-auto"}`} ref={containerRef}>
        {/* Sender name for received messages */}
        {!isOwn && (
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1 ml-2 cursor-pointer transition-colors duration-200 hover:text-indigo-500 dark:hover:text-indigo-400">
            {message.userName}
          </p>
        )}

        {/* Bubble */}
        <div
          className={`p-3 rounded-3xl transition-colors ${
            isOwn
              ? "bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white shadow-md hover:brightness-105"
              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md rounded-3xl hover:brightness-105 hover:bg-gradient-to-r hover:from-green-400 hover:to-green-300 dark:hover:from-green-600 dark:hover:to-green-500"
          }`}
        >
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <input
                ref={inputRef}
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={500}
                className="w-full rounded-3xl border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              />
              <div className="flex gap-2 justify-end">
                <button
                  title="Save"
                  onClick={handleSave}
                  className="px-3 py-1.5 text-sm font-semibold rounded-3xl bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-sm"
                  type="button"
                >
                  Save
                </button>
                <button
                  title="Cancel"
                  onClick={handleCancel}
                  className="px-3 py-1.5 text-sm font-semibold rounded-3xl bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm"
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <div className="flex items-end justify-between gap-2">
                <p className="break-words">
                  {message.content}{" "}
                  {message.edited && <span className="text-[10px] opacity-70">(Edited)</span>}
                </p>
                <span className="text-xs ml-2" style={isOwn ? { color: "rgba(255,255,255,0.95)" } : undefined}>
                  {formatTime(message.$createdAt)}
                </span>
              </div>

              {/* Real-time editing indicator */}
              {!isOwn && message.editingBy && (
                <p className="text-xs text-gray-500 dark:text-indigo-300 italic mt-1">
                  {message.editingByName || "Someone"} is editing...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Actions (Edit/Delete) – only for own messages and not when editing */}
        {isOwn && !isEditing && (
          <div className="flex gap-5 mt-2 text-sm justify-end">
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors font-medium"
              type="button"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors font-medium"
              type="button"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
