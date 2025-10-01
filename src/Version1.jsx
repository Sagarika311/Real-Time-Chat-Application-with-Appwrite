import React, { useState, useEffect, useRef } from 'react';
import { Client, Account, Databases, ID, Query, Permission, Role } from 'appwrite';

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

const account = new Account(client);
const databases = new Databases(client);

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const MESSAGES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_MESSAGES_COLLECTION_ID;
const ONLINE_USERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_ONLINE_USERS_COLLECTION_ID;

const RealTimeChatApp = () => {
  const [user, setUser ] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authView, setAuthView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Inline editing state
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const editingInputRef = useRef(null);

  // Online users state
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Show toast notification
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Toggle dark mode class on body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  // Update user presence in online users collection
  const updatePresence = async () => {
    if (!user) return;
    try {
      await databases.createDocument(
        DATABASE_ID,
        ONLINE_USERS_COLLECTION_ID,
        user.$id,
        { username: user.name || user.email, lastActive: new Date().toISOString() },
        [Permission.read(Role.any())],
        [Permission.write(Role.user(user.$id))]
      );
    } catch (error) {
      if (error.code === 409) {
        // Document exists, update lastActive
        await databases.updateDocument(
          DATABASE_ID,
          ONLINE_USERS_COLLECTION_ID,
          user.$id,
          { lastActive: new Date().toISOString() }
        );
      } else {
        console.error('Presence update error:', error);
      }
    }
  };

  // Fetch online users active within last 5 minutes
  const fetchOnlineUsers = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        ONLINE_USERS_COLLECTION_ID,
        [Query.orderDesc('lastActive')]
      );
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const activeUsers = response.documents.filter(
        (onlineUser ) => new Date(onlineUser .lastActive) > fiveMinutesAgo
      );
      setOnlineUsers(activeUsers);
    } catch (error) {
      console.error('Fetch online users error:', error);
    }
  };

  // Check if user is logged in on mount
  useEffect(() => {
    const checkUser  = async () => {
      try {
        const userData = await account.get();
        setUser (userData);
        await loadMessages();
      } catch {
        console.log('No user logged in');
      } finally {
        setIsLoading(false);
      }
    };
    checkUser ();
  }, []);

  // Subscribe to messages and online users presence updates
  useEffect(() => {
    if (!user) return;

    // Subscribe to messages collection realtime updates
    const unsubscribeMessages = client.subscribe(
      `databases.${DATABASE_ID}.collections.${MESSAGES_COLLECTION_ID}.documents`,
      (response) => {
        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          setMessages((prev) => [...prev, response.payload]);
        } else if (response.events.includes('databases.*.collections.*.documents.*.delete')) {
          setMessages((prev) => prev.filter((msg) => msg.$id !== response.payload.$id));
        } else if (response.events.includes('databases.*.collections.*.documents.*.update')) {
          setMessages((prev) =>
            prev.map((msg) => (msg.$id === response.payload.$id ? response.payload : msg))
          );
        }
      }
    );

    // Update presence and fetch online users initially
    updatePresence();
    fetchOnlineUsers();

    // Subscribe to online users collection realtime updates
    const unsubscribePresence = client.subscribe(
      `databases.${DATABASE_ID}.collections.${ONLINE_USERS_COLLECTION_ID}.documents`,
      () => {
        fetchOnlineUsers();
      }
    );

    // Keep presence updated every minute
    const presenceInterval = setInterval(updatePresence, 60000);

    // Cleanup subscriptions and interval on unmount or user change
    return () => {
      unsubscribeMessages();
      unsubscribePresence();
      clearInterval(presenceInterval);
    };
  }, [user]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (inputRef.current) inputRef.current.focus();
  }, [messages]);

  // Focus editing input when editingMessageId changes
  useEffect(() => {
    if (editingMessageId !== null && editingInputRef.current) {
      editingInputRef.current.focus();
      editingInputRef.current.select();
    }
  }, [editingMessageId]);

  // Load messages from database
  const loadMessages = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        [Query.orderAsc('$createdAt'), Query.limit(100)]
      );
      setMessages(response.documents);
    } catch (error) {
      console.error('Error loading messages:', error);
      showToast('Failed to load messages', 'error');
    }
  };

  // Authentication handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await account.createEmailPasswordSession(email, password);
      const userData = await account.get();
      setUser (userData);
      await loadMessages();
      showToast('Welcome back!', 'success');
    } catch (error) {
      showToast('Login failed: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await account.create(ID.unique(), email, password, name);
      await account.createEmailPasswordSession(email, password);
      const userData = await account.get();
      setUser (userData);
      await loadMessages();
      showToast('Account created successfully!', 'success');
    } catch (error) {
      showToast('Registration failed: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (user) {
        await databases.deleteDocument(DATABASE_ID, ONLINE_USERS_COLLECTION_ID, user.$id);
      }
      await account.deleteSession('current');
      setUser (null);
      setMessages([]);
      setOnlineUsers([]);
      showToast('Logged out successfully', 'info');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Message actions
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      await databases.createDocument(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        ID.unique(),
        {
          userId: user.$id,
          userName: user.name,
          content: newMessage.trim(),
        },
        [
          Permission.read(Role.users()),
          Permission.update(Role.user(user.$id)),
          Permission.delete(Role.user(user.$id)),
        ]
      );
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      showToast('Failed to send message', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const editMessage = async (messageId, newContent) => {
    try {
      await databases.updateDocument(DATABASE_ID, MESSAGES_COLLECTION_ID, messageId, { content: newContent });
      setMessages((prev) =>
        prev.map((msg) => (msg.$id === messageId ? { ...msg, content: newContent } : msg))
      );
      showToast('Message updated', 'success');
    } catch (error) {
      console.error('Error updating message:', error);
      showToast('Failed to update message', 'error');
    }
  };

  const deleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await databases.deleteDocument(DATABASE_ID, MESSAGES_COLLECTION_ID, messageId);
        showToast('Message deleted', 'success');
      } catch (error) {
        console.error('Error deleting message:', error);
        showToast('Failed to delete message', 'error');
      }
    }
  };

  // Formatting helpers
  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatDate = (timestamp) => new Date(timestamp).toLocaleDateString();

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.$createdAt);
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
    return groups;
  }, {});

  // Inline editing handlers
  const startEditing = (message) => {
    setEditingMessageId(message.$id);
    setEditingContent(message.content);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingContent('');
  };

  const saveEditing = async () => {
    const trimmed = editingContent.trim();
    if (!trimmed) {
      showToast('Message cannot be empty', 'error');
      return;
    }
    await editMessage(editingMessageId, trimmed);
    setEditingMessageId(null);
    setEditingContent('');
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEditing();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditing();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}

        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 fade-in">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome to ChatApp</h1>
            <p className="text-gray-600 dark:text-gray-300">Secure real-time messaging</p>
          </div>

          <form
            onSubmit={authView === 'login' ? handleLogin : handleRegister}
            className="space-y-6"
          >
            {authView === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter your name"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter your password"
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : authView === 'login' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            {authView === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => setAuthView(authView === 'login' ? 'register' : 'login')}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
            >
              {authView === 'login' ? 'Sign up now' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}

      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col slide-in glassmorphism">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 glassmorphism">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ChatApp</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Toggle dark mode"
              >
                {darkMode ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Logout"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900 dark:to-purple-900 glassmorphism">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {user.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{user.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Online Users */}
        <div className="flex-1 p-6 glassmorphism overflow-y-auto">
          <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">Online Users</h4>
          <div className="space-y-2">
            {/* Current User */}
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900">
              <div className="relative">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {/* You can replace this with an actual avatar image if available */}
                  Y
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
              </div>
              <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">You</span>
            </div>

            {/* Other Online Users */}
            {onlineUsers
              .filter((onlineUser ) => onlineUser .$id !== user.$id)
              .map((onlineUser ) => (
                <div
                  key={onlineUser .$id}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="relative">
                    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-semibold">
                      {onlineUser .username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{onlineUser .username}</span>
                </div>
              ))}

            {onlineUsers.length <= 1 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No other users online.</p>
            )}
          </div>
        </div>

      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col glassmorphism">
        {/* Chat Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 glassmorphism">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">G</span>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">General Chat</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Public group conversation</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 dark:bg-gray-900 glassmorphism">
          {Object.entries(groupedMessages).length === 0 ? (
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
            Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                <div className="text-center my-6">
                  <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-full">
                    {date}
                  </span>
                </div>
                {dateMessages.map((message) => (
                  <div
                    key={message.$id}
                    className={`flex ${message.userId === user.$id ? 'justify-end' : 'justify-start'} mb-4 fade-in`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md ${
                        message.userId === user.$id ? 'ml-auto' : 'mr-auto'
                      }`}
                    >
                      {message.userId !== user.$id && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-2">{message.userName}</p>
                      )}
                      <div
                        className={`p-3 rounded-2xl ${
                          message.userId === user.$id
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        {editingMessageId === message.$id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              ref={editingInputRef}
                              type="text"
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              onKeyDown={handleEditKeyDown}
                              onBlur={cancelEditing}
                              maxLength={500}
                              className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                            />
                            <button
                              onClick={saveEditing}
                              className="text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-400 text-sm font-semibold"
                              title="Save"
                              type="button"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm font-semibold"
                              title="Cancel"
                              type="button"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <p className="break-words">{message.content}</p>
                        )}
                      </div>
                      <div
                        className={`flex items-center mt-1 ${
                          message.userId === user.$id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <span
                          className={`text-xs ${
                            message.userId === user.$id ? 'text-indigo-200' : 'text-gray-400 dark:text-gray-500'
                          }`}
                        >
                          {formatTime(message.$createdAt)}
                        </span>
                        {message.userId === user.$id && editingMessageId !== message.$id && (
                          <>
                            <button
                              onClick={() => startEditing(message)}
                              className="ml-2 text-xs text-blue-400 hover:text-blue-600 dark:hover:text-blue-500 transition-colors"
                              title="Edit message"
                              type="button"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5h2m-1 0v10m-7 4h14" />
                              </svg>
                            </button>

                            <button
                              onClick={() => deleteMessage(message.$id)}
                              className="ml-2 text-xs text-red-400 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                              title="Delete message"
                              type="button"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form
          onSubmit={sendMessage}
          className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 glassmorphism"
        >
          <div className="flex items-end space-x-3">
            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-2xl p-2">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full bg-transparent border-none outline-none px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                disabled={isSending}
                maxLength={500}
              />
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Send message"
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
          {newMessage.length > 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-right">
              {newMessage.length}/500 characters
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default RealTimeChatApp;
