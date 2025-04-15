import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/login.js';
import StudentView from './components/studentView.js';
import TeacherView from './components/teacherView.js';
import AdminView from './components/adminView.js';
import './App.css';

// Create a context for global state management
export const AppContext = React.createContext();

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState('');
  const [adminData, setAdminData] = useState({
    users: {},
    courses: [],
    studentGrades: {}
  });

  // Fetch admin data to keep everything in sync
  const fetchAdminData = () => {
    fetch('http://localhost:5000/api/admin/data')
      .then(res => res.json())
      .then(data => {
        setAdminData({
          users: data.users,
          courses: data.courses,
          studentGrades: data.student_grades
        });
      })
      .catch(err => {
        console.error('Error fetching admin data:', err);
      });
  };

  // Refresh admin data periodically or after certain actions
  useEffect(() => {
    if (isLoggedIn && userRole === 'admin') {
      fetchAdminData();
    }
  }, [isLoggedIn, userRole]);

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUserRole(userData.role);
    setUsername(userData.username);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setUsername('');
  };

  // Prepare context value
  const contextValue = {
    isLoggedIn,
    userRole,
    username,
    adminData,
    fetchAdminData,
    handleLogin,
    handleLogout
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route 
            path="/login" 
            element={<Login />}
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
    </AppContext.Provider>
  );
}

export default App;