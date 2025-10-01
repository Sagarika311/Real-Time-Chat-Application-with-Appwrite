import React from "react";
import ChatHeader from "./ChatHeader";
import MessagesList from "./MessagesList";
import MessageInput from "./MessageInput";
import { useMessages } from "../hooks/useMessages";

const ChatWindow = ({ user, showToast }) => {
  const { messages, sendMessage, editMessage, deleteMessage, isSending, messagesEndRef } = useMessages(user, showToast);

  return (
    <div className="flex-1 flex flex-col glassmorphism">
      <ChatHeader />
      <MessagesList messages={messages} currentUser={user} onEdit={editMessage} onDelete={deleteMessage} messagesEndRef={messagesEndRef} />
      <MessageInput user={user} sendMessage={sendMessage} isSending={isSending} />
    </div>
  );
};

export default ChatWindow;
