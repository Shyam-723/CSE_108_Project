import React, { useState } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './components/login.js';
import StudentView from './components/studentView.js';
import TeacherView from './components/teacherView.js';
import AdminView from './components/adminView.js'; // ✅ Make sure this exists
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('role'));
  const [userRole, setUserRole] = useState(() => localStorage.getItem('role'));

  const handleLogin = (role) => {
    setIsLoggedIn(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserRole(null);
  };

  return (
    <div className="App">
      <nav>
        <ul>
          {!isLoggedIn ? (
            <li><Link to="/login">Login</Link></li>
          ) : (
            <>
              <li><button onClick={handleLogout}>Logout</button></li>
              {userRole === 'student' && <li><Link to="/student">Student View</Link></li>}
              {userRole === 'teacher' && <li><Link to="/teacher">Teacher View</Link></li>}
              {userRole === 'admin' && <li><Link to="/admin">Admin View</Link></li>}
            </>
          )}
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/student" element={userRole === 'student' ? <StudentView /> : <Navigate to="/login" />} />
        <Route path="/teacher" element={userRole === 'teacher' ? <TeacherView /> : <Navigate to="/login" />} />
        <Route path="/admin" element={userRole === 'admin' ? <AdminView /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;
