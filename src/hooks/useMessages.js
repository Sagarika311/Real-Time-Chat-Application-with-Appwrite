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

  // Load initial messages
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

  // Send new message
  const sendMessage = async (content) => {
    if (!content || !content.trim() || isSending || !user) return;
    setIsSending(true);
    try {
      const doc = {
        userId: user.$id,
        userName: user.name || user.email, // ✅ fallback if no name
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
      // realtime will handle adding it locally
    } catch (err) {
      console.error("Send message error:", err);
      showToast("Failed to send message", "error");
    } finally {
      setIsSending(false);
    }
  };

  // Edit message
  const editMessage = async (id, newContent, extra = {}) => {
    if (!id || !newContent?.trim()) {
      showToast("Message cannot be empty", "error");
      return;
    }
  
    try {
      // Build update object
      const update = { content: newContent.trim(), edited: true };
  
      // Handle editingBy / editingByName clearing or setting
      if (extra.clearEditingBy) {
        update.editingBy = null;
        update.editingByName = null;
      } else {
        if (extra.setEditingBy) update.editingBy = extra.setEditingBy;
        if (extra.setEditingByName) update.editingByName = extra.setEditingByName;
      }
  
      // Update in database
      await databases.updateDocument(DATABASE_ID, MESSAGES_COLLECTION_ID, id, update);
  
      // Optimistic update
      setMessages((prev) =>
        prev.map((m) => (m.$id === id ? { ...m, ...update } : m))
      );
  
      if (!extra.setEditingBy && !extra.setEditingByName) {
        showToast("Message updated", "success");
      }
    } catch (err) {
      console.error("Update failed:", err);
      showToast("Failed to update message", "error");
    }
  };

  // Delete message
  const deleteMessage = async (id) => {
    if (!id) return;
    try {
      await databases.deleteDocument(DATABASE_ID, MESSAGES_COLLECTION_ID, id);
      setMessages((prev) => prev.filter((m) => m.$id !== id));
      showToast("Message deleted", "success");
    } catch (err) {
      console.error("Delete failed:", err);
      showToast("Failed to delete message", "error");
    }
  };

  // Realtime listener
  useEffect(() => {
    if (!user) return;

    loadMessages();

    const unsub = client.subscribe(
      `databases.${DATABASE_ID}.collections.${MESSAGES_COLLECTION_ID}.documents`,
      (response) => {
        try {
          if (response.events.some((e) => e.endsWith(".create"))) {
            setMessages((prev) => [...prev, response.payload]);
          } else if (response.events.some((e) => e.endsWith(".delete"))) {
            setMessages((prev) => prev.filter((m) => m.$id !== response.payload.$id));
          } else if (response.events.some((e) => e.endsWith(".update"))) {
            setMessages((prev) =>
              prev.map((m) =>
                m.$id === response.payload.$id ? response.payload : m
              )
            );
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
  }, [user]);

  // ✅ Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
