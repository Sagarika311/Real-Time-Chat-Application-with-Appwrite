# 🔐 Chat App with Authentication (React + Appwrite)

A modern **chat application** built with **React, Appwrite, and TailwindCSS** featuring user authentication, real-time chat UI, dark mode, and toast notifications.

🚀 This project demonstrates **full-stack integration** of authentication, protected routes, and interactive UI components with a clean developer experience.

---

## ✨ Features

* 🔑 **User Authentication** (Login/Signup with Appwrite)
* 📧 **Email Verification** (toggleable with `SKIP_EMAIL_VERIFICATION`)
* 🌙 **Dark Mode Toggle** (persistent via `localStorage`)
* 💬 **Chat UI** with responsive **Sidebar + Chat Window**
* 🔔 **Toast Notifications** (success, error, info)
* 🔄 **Loading State Handling** with animated spinner
* 🛡 **Protected Routes** with `react-router-dom`
* 🎨 **Modern UI/UX** with TailwindCSS

---

## 🛠 Tech Stack

* **Frontend:** React 18, React Router
* **Backend/Auth:** [Appwrite](https://appwrite.io)
* **Styling:** TailwindCSS + Dark Mode Support
* **Icons:** Lucide React
* **State Management:** React Hooks (`useState`, `useEffect`)

---

## 📂 Project Structure

```
├── src/
│   ├── components/
│   │   ├── AuthForm.jsx      # Login/Register form
│   │   ├── Sidebar.jsx       # Sidebar with user info + logout
│   │   ├── ChatWindow.jsx    # Main chat window
│   │   └── Toast.jsx         # Toast notification system
│   ├── lib/
│   │   └── appwrite.js       # Appwrite client configuration
│   ├── App.jsx               # Root app with routes
│   └── index.js              # React entry point
├── public/
├── package.json
└── tailwind.config.js
```

---

## ⚙️ Setup & Installation

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/chat-app.git
cd chat-app
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Configure Appwrite

* Create a project in [Appwrite Cloud](https://cloud.appwrite.io) or self-hosted Appwrite.
* Set up **Authentication** with Email/Password.
* Replace credentials in `src/lib/appwrite.js`.

### 4️⃣ Run the app

```bash
npm start
```

---

## 🚧 Environment Variables

Create a `.env` file in the project root:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
```

---

## 📸 Screenshots

| Auth Pages                 | Chat UI                       |
| -------------------------- | ----------------------------- |
| ![Login](assets/login.png) ![Signup](assets/signup.png) | ![Chat Light](assets/chat-light.png) <br> ![Chat Dark](assets/chat-dark.png) |

---

## 🌟 Future Improvements

* ✅ Real-time chat with Appwrite Realtime API
* ✅ User avatars + profile management
* ✅ Group chats & DMs

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 👩‍💻 Author

Made with ❤️ by [Sagarika](https://github.com/Sagarika311)

