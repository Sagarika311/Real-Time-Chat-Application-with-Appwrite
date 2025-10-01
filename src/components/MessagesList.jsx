import React from "react"; 
import MessageBubble from "./MessageBubble";
import { formatDate } from "../utils/formatDate";

const MessagesList = ({ messages = [], currentUser, onEdit, onDelete, messagesEndRef }) => {
  const grouped = messages.reduce((acc, msg) => {
    const d = formatDate(msg.$createdAt);
    if (!acc[d]) acc[d] = [];
    acc[d].push(msg);
    return acc;
  }, {});

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 dark:bg-gray-900 glassmorphism">
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 text-gray-300 dark:text-gray-600">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1} 
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
              />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">No messages yet</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">Start the conversation!</p>
        </div>
      ) : (
        Object.entries(grouped).map(([date, msgs]) => (
          <div key={date}>
            <div className="text-center my-6">
              <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-full">
                {date}
              </span>
            </div>

            {msgs.map((message) => (
              <MessageBubble 
                key={message.$id} 
                message={message} 
                currentUser={currentUser} 
                onEdit={onEdit} 
                onDelete={onDelete} 
              />
            ))}
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessagesList;
