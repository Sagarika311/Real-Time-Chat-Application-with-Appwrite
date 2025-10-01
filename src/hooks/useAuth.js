import { useState } from "react";
import { account, ID } from "../lib/appwrite";

export const useAuth = (setUser, showToast) => {
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      await account.createEmailPasswordSession(email, password);
      const userData = await account.get();
      setUser(userData);
      showToast("Welcome back!", "success");
    } catch (err) {
      showToast("Login failed: " + (err.message || err), "error");
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, name) => {
    setLoading(true);
    try {
      await account.create(ID.unique(), email, password, name);

      // Demo mode: skip email verification and log in immediately
      const userData = await account.createEmailPasswordSession(email, password);
      const userInfo = await account.get();
      setUser(userInfo);

      showToast("Account created and logged in!", "success");
    } catch (err) {
      showToast("Registration failed: " + (err.message || err), "error");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await account.deleteSession("current");
      setUser(null);
      showToast("Logged out successfully", "info");
    } catch (err) {
      showToast("Logout failed: " + (err.message || err), "error");
    } finally {
      setLoading(false);
    }
  };

  return { login, register, logout, loading };
};
