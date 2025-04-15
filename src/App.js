import React, { useState } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './components/login.js';
import StudentView from './components/studentView.js';
import TeacherView from './components/teacherView.js';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('role');
  });
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('role');
  });

  const handleLogin = (role) => {
    localStorage.setItem('role', role);
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
              <li>
                <Link to="/login">Login</Link>
              </li>
            ) : (
              <>
                <li><button onClick={handleLogout}>Logout</button></li>
                {userRole === 'student' && (
                  <li><Link to="/student">Student View</Link></li>
                )}
                {userRole === 'teacher' && (
                  <li><Link to="/teacher">Teacher View</Link></li>
                )}
              </>
            )}
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/login"
            element={<Login onLogin={handleLogin} />}
          />
          <Route
            path="/student"
            element={
              isLoggedIn && userRole === 'student'
                ? <StudentView />
                : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/teacher"
            element={
              isLoggedIn && userRole === 'teacher'
                ? <TeacherView />
                : <Navigate to="/login" replace />
            }
          />
        </Routes>
      </div>
  );
}

export default App;
