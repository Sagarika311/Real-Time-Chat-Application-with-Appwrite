import React, { useState, useRef, useEffect } from "react";
import { useMessages } from "../hooks/useMessages";
import { FiSend } from "react-icons/fi";

const MessageInput = ({ user, showToast }) => {
  const [text, setText] = useState("");
  const { sendMessage, isSending } = useMessages(user, showToast);
  const textareaRef = useRef(null);

  const handleSend = async () => {
    if (!text.trim()) return;
    await sendMessage(text);
    setText("");
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [text]);

  return (
    <div className="flex items-end gap-3 p-4 rounded-t-2xl rounded-b-none shadow-inner bg-white dark:bg-gray-900 transition-colors">
      {/* Textarea always light */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message..."
        rows={1}
        className="flex-1 resize-none rounded-full border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm bg-white"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        disabled={isSending}
      />

      {/* Send button */}
      <button
        type="button"
        onClick={handleSend}
        disabled={!text.trim() || isSending}
        className="p-3 rounded-full bg-green-500 text-white disabled:opacity-50 hover:bg-green-600 transition-colors shadow-md hover:shadow-lg flex items-center justify-center -mb-1"
      >
        {isSending ? "..." : <FiSend size={20} />}
      </button>
    </div>
  );
};

export default MessageInput;
