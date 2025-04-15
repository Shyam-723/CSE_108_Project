import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login.js';
import StudentView from './components/studentView.js';
import TeacherView from './components/teacherView.js';
import AdminView from './components/adminView.js';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const handleLogin = (role) => {
    setIsLoggedIn(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
  };

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/login"
          element={<Login onLogin={handleLogin} />}
        />
        <Route
          path="/student"
          element={<StudentView />}
        />
        <Route
          path="/teacher"
          element={<TeacherView />}
        />
        <Route
          path="/admin"
          element={<AdminView />}
        />
      </Routes>
    </div>
  );
}

export default App;