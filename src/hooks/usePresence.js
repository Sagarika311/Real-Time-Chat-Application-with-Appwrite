import { useState, useEffect } from "react";
import {
  client,
  databases,
  DATABASE_ID,
  ONLINE_USERS_COLLECTION_ID,
  Permission,
  Role,
} from "../lib/appwrite";

export const usePresence = (user) => {
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Prepare presence data
  const getPresenceData = () => ({
    userId: user?.$id,
    username: user?.name || user?.email,
    lastActive: new Date().toISOString(),
  });

  // Permissions: owner can update/delete, anyone can read
  const getPermissions = () => [
    Permission.read(Role.any()),               // anyone can read
    Permission.update(Role.user(user.$id)),   // only owner can update
    Permission.delete(Role.user(user.$id)),   // only owner can delete
  ];

  // Update or create user's presence
  const updatePresence = async () => {
    if (!user?.$id) return; // Ensure user is logged in

    try {
      // Attempt to update your own document
      await databases.updateDocument(
        DATABASE_ID,
        ONLINE_USERS_COLLECTION_ID,
        user.$id,
        { lastActive: new Date().toISOString() }
      );
    } catch (err) {
      if (err.code === 404) {
        // Document doesn't exist → create it
        try {
          await databases.createDocument(
            DATABASE_ID,
            ONLINE_USERS_COLLECTION_ID,
            user.$id, // use user ID as document ID
            getPresenceData(),
            getPermissions()
          );
        } catch (createErr) {
          if (createErr.code === 409) {
            console.info("Document already exists, skipping creation.");
          } else {
            console.error("Presence create error:", createErr);
          }
        }
      } else if (err.code === 401) {
        console.info("Unauthorized: cannot update another user's document.");
      } else {
        console.error("Presence update error:", err);
      }
    }
  };

  // Fetch all online users active in the last 5 minutes
  const fetchOnlineUsers = async () => {
    try {
      const res = await databases.listDocuments(
        DATABASE_ID,
        ONLINE_USERS_COLLECTION_ID
      );
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
      const active = res.documents.filter(
        (d) => new Date(d.lastActive) > fiveMinAgo
      );
      setOnlineUsers(active);
    } catch (err) {
      console.error("Fetch online users error:", err);
    }
  };

  useEffect(() => {
    if (!user?.$id) return;

    // Initial update and fetch
    updatePresence();
    fetchOnlineUsers();

    // Subscribe to collection changes
    const unsub = client.subscribe(
      `databases.${DATABASE_ID}.collections.${ONLINE_USERS_COLLECTION_ID}.documents`,
      () => fetchOnlineUsers()
    );

    // Periodically update presence every minute
    const interval = setInterval(updatePresence, 60_000);

    return () => {
      if (typeof unsub === "function") unsub();
      clearInterval(interval);
    };
  }, [user]);

  return { onlineUsers };
};
