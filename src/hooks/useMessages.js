import { useState, useEffect, useRef } from "react";
import {
  client,
  databases,
  ID,
  Query,
  Permission,
  Role,
  DATABASE_ID,
  MESSAGES_COLLECTION_ID,
} from "../lib/appwrite";

export const useMessages = (user, showToast) => {
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const loadMessages = async () => {
    try {
      const res = await databases.listDocuments(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        [Query.orderAsc("$createdAt"), Query.limit(100)]
      );
      setMessages(res.documents || []);
    } catch (err) {
      console.error("Error loading messages:", err);
      showToast("Failed to load messages", "error");
    }
  };

  const sendMessage = async (content) => {
    if (!content || !content.trim() || isSending || !user) return;
    setIsSending(true);
    try {
      const doc = {
        userId: user.$id,
        userName: user.name,
        content: content.trim(),
      };
      await databases.createDocument(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        ID.unique(),
        doc,
        [
          Permission.read(Role.users()),
          Permission.update(Role.user(user.$id)),
          Permission.delete(Role.user(user.$id)),
        ]
      );
      // server will publish realtime event and update list; we keep this function simple
    } catch (err) {
      console.error("Send message error:", err);
      showToast("Failed to send message", "error");
    } finally {
      setIsSending(false);
    }
  };

  const editMessage = async (id, newContent) => {
    if (!id || !newContent || !newContent.trim()) {
      showToast("Message cannot be empty", "error");
      return;
    }
    try {
      // update content AND mark as edited
      await databases.updateDocument(DATABASE_ID, MESSAGES_COLLECTION_ID, id, {
        content: newContent.trim(),
        edited: true,
      });

      // optimistic update for local state
      setMessages((prev) =>
        prev.map((m) =>
          m.$id === id ? { ...m, content: newContent.trim(), edited: true } : m
        )
      );

      showToast("Message updated", "success");
    } catch (err) {
      console.error("Update failed:", err);
      showToast("Failed to update message", "error");
    }
  };

  const deleteMessage = async (id) => {
    if (!id) return;
    try {
      await databases.deleteDocument(DATABASE_ID, MESSAGES_COLLECTION_ID, id);
      // optimistic removal handled by realtime, but also ensure local removal if needed
      setMessages((prev) => prev.filter((m) => m.$id !== id));
      showToast("Message deleted", "success");
    } catch (err) {
      console.error("Delete failed:", err);
      showToast("Failed to delete message", "error");
    }
  };

  useEffect(() => {
    if (!user) return;

    loadMessages();

    const unsub = client.subscribe(
      `databases.${DATABASE_ID}.collections.${MESSAGES_COLLECTION_ID}.documents`,
      (response) => {
        try {
          if (response.events.includes("databases.*.collections.*.documents.*.create")) {
            setMessages((prev) => [...prev, response.payload]);
          } else if (response.events.includes("databases.*.collections.*.documents.*.delete")) {
            setMessages((prev) => prev.filter((m) => m.$id !== response.payload.$id));
          } else if (response.events.includes("databases.*.collections.*.documents.*.update")) {
            setMessages((prev) => prev.map((m) => (m.$id === response.payload.$id ? response.payload : m)));
          }
        } catch (err) {
          console.error("Realtime handler error:", err);
        }
      }
    );

    return () => {
      try {
        if (typeof unsub === "function") unsub();
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return {
    messages,
    sendMessage,
    editMessage,
    deleteMessage,
    isSending,
    messagesEndRef,
    loadMessages,
  };
};
