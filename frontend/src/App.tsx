import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ChatInterface from './components/ChatInterface';
import ProtectedRoute from './components/ProtectedRoute';
import { User } from './interfaces';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <Routes>
      <Route path="/" element={currentUser ? <Navigate to="/groups" /> : <LoginPage onLogin={handleLogin} />} />
      <Route path="/login" element={currentUser ? <Navigate to="/groups" /> : <LoginPage onLogin={handleLogin} />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/groups" element={
        <ProtectedRoute user={currentUser}>
          <ChatInterface currentUser={currentUser!} onLogout={handleLogout} />
        </ProtectedRoute>
      } />
      <Route path="/group/:id" element={
        <ProtectedRoute user={currentUser}>
          <ChatInterface currentUser={currentUser!} onLogout={handleLogout} />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;